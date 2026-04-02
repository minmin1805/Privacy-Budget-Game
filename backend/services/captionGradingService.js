/**
 * Azure OpenAI caption grading for edited captions (server-side only).
 * Env: AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, AZURE_OPENAI_DEPLOYMENT, AZURE_OPENAI_API_VERSION
 */

const DEFAULT_API_VERSION = '2025-01-01-preview';

/** Heuristic: long keyboard-mash or very low vowel density */
function looksLikeGibberish(text) {
    const t = text.trim();
    if (t.length < 6) return false;
    const words = t.split(/\s+/).filter(Boolean);
    const vowel = /[aeiouy]/i;
    const lettersOnly = (w) => w.replace(/[^a-z]/gi, '');
    const isWordLike = (w) => {
        const L = lettersOnly(w);
        if (L.length < 2) return false;
        return vowel.test(L);
    };
    const wordish = words.filter(isWordLike);
    if (t.length >= 8 && wordish.length === 0) return true;
    if (words.length === 1) {
        const L = lettersOnly(words[0]);
        if (L.length >= 12 && !vowel.test(L)) return true;
    }
    const allLetters = t.replace(/[^a-z]/gi, '');
    if (allLetters.length >= 10) {
        const vowels = [...allLetters.toLowerCase()].filter((c) => 'aeiouy'.includes(c)).length;
        if (vowels / allLetters.length < 0.28) return true;
    }
    return false;
}

const PROFANITY_HEURISTIC =
    /\b(fuck|fucks|fucking|shit|shits|bitch|bitches|dammit|damn|asshole|assholes|crap|cunts?|slut|sluts|bastard)\b/i;

const HARD_FAIL_FLAGS = ['empty', 'gibberish', 'nonsense', 'profanity', 'inappropriate_language'];

function normalizeAiResult(parsed) {
    const risk_flags = Array.isArray(parsed.risk_flags) ? parsed.risk_flags : [];
    let band = ['safe', 'okay', 'risky'].includes(parsed.band) ? parsed.band : 'okay';
    let verdict = parsed.verdict === 'appropriate' ? 'appropriate' : 'needs_revision';

    if (risk_flags.some((f) => HARD_FAIL_FLAGS.includes(f))) {
        band = 'risky';
        verdict = 'needs_revision';
    }
    if (band !== 'safe') {
        verdict = 'needs_revision';
    }
    return { band, verdict, risk_flags };
}

function heuristicGrade(caption) {
    const text = (caption || '').trim();
    if (!text) {
        return {
            band: 'risky',
            flags: ['empty_caption'],
            reason: 'Caption is empty.',
            suggestedRewrite: 'Add a short, general caption without location or schedule details.',
            verdict: 'needs_revision',
            risk_flags: ['empty'],
            suggested_caption: 'Out with friends — good vibes.',
        };
    }

    if (PROFANITY_HEURISTIC.test(text)) {
        return {
            band: 'risky',
            flags: ['profanity'],
            reason: 'Caption contains language that is not appropriate for a general audience.',
            suggestedRewrite: 'Use a friendly line without insults or swear words.',
            verdict: 'needs_revision',
            risk_flags: ['profanity'],
            suggested_caption: 'Good day — keeping it positive.',
        };
    }

    if (looksLikeGibberish(text)) {
        return {
            band: 'risky',
            flags: ['gibberish'],
            reason: 'Caption looks like random typing, not a real message.',
            suggestedRewrite: 'Write a short, clear line you would actually post.',
            verdict: 'needs_revision',
            risk_flags: ['gibberish'],
            suggested_caption: 'Happy to share this moment.',
        };
    }

    const lower = text.toLowerCase();
    const riskyPatterns = [
        /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/,
        /\b\d{1,2}:\d{2}\s*(am|pm)?\b/i,
        /\bat\s+(school|home|work|the)\b/i,
        /\briverside\b/i,
        /\bpractice\b.*\b\d/i,
    ];

    const flags = [];
    for (const re of riskyPatterns) {
        if (re.test(text)) flags.push('possible_identifier_or_time');
    }
    if (/\b(st|street|ave|road|rd|blvd)\b/i.test(text)) flags.push('location_cue');

    const band = flags.length >= 2 ? 'risky' : flags.length === 1 ? 'okay' : 'safe';

    return {
        band,
        flags,
        reason:
            band === 'safe'
                ? 'Caption looks general and does not add obvious location or schedule cues.'
                : 'Caption may still hint at place, time, or identity; consider simplifying.',
        suggestedRewrite:
            band === 'safe'
                ? null
                : 'Good day with people I care about.',
        verdict: band === 'safe' ? 'appropriate' : 'needs_revision',
        risk_flags: flags.map((f) =>
            f === 'possible_identifier_or_time' ? 'personal_identifier' : 'location_cue',
        ),
        suggested_caption: band === 'safe' ? null : 'Fun day — keeping it low-key.',
    };
}

async function callAzureOpenAI(caption, levelContext) {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT?.replace(/\/$/, '');
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || DEFAULT_API_VERSION;

    if (!endpoint || !apiKey) {
        return null;
    }

    const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

    const system = `You grade short social-post captions for a teen privacy-education game. Reply with ONLY valid JSON (no markdown).

Schema:
{"verdict":"appropriate"|"needs_revision","reason":"one short sentence for the player","risk_flags":string[],"suggested_caption":string|null,"band":"safe"|"okay"|"risky"}

risk_flags: zero or more of ONLY these tokens:
- "location_cue" — specific place, street, venue, school, neighborhood that pins the user
- "time_routine" — exact times, schedules, or routines that pin when/where
- "personal_identifier" — phone, email, others' full names, or strong identity cues
- "empty" — blank or whitespace-only (treat as no usable caption)
- "gibberish" — random letters or keyboard mash with no readable meaning (e.g. "askdnaskjdn", "asjkdhaksj")
- "nonsense" — tokens are readable but not a sensible caption (e.g. "test test 123", unrelated word salad)
- "profanity" — swear words or harsh insults
- "inappropriate_language" — slurs, sexual vulgarity, hate, or harassment

Band rules:
- "safe": coherent, civil caption suitable for sharing; no privacy leaks; not empty/gibberish/nonsense/profanity
- "okay": minor concern or borderline wording but not a hard fail
- "risky": empty, gibberish, nonsense, profanity/slurs, or clear privacy leaks

verdict must be "appropriate" only when band is "safe" AND there are no hard issues (not empty, gibberish, nonsense, profanity, or inappropriate_language). Otherwise "needs_revision".

If needs_revision and a neutral rewrite helps, set suggested_caption to one short friendly line (no addresses, times, or school names); otherwise null.`;

    const user = `Level context: ${JSON.stringify(levelContext || {})}
Caption to grade: ${JSON.stringify(caption)}`;

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': apiKey,
        },
        body: JSON.stringify({
            messages: [
                { role: 'system', content: system },
                { role: 'user', content: user },
            ],
            temperature: 0.2,
            max_tokens: 400,
            response_format: { type: 'json_object' },
        }),
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Azure OpenAI error ${res.status}: ${errText.slice(0, 200)}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    const { band, verdict, risk_flags } = normalizeAiResult(parsed);

    return {
        band,
        flags: risk_flags,
        reason: typeof parsed.reason === 'string' ? parsed.reason : 'Graded by model.',
        suggestedRewrite:
            typeof parsed.suggested_caption === 'string' ? parsed.suggested_caption : null,
        verdict,
        risk_flags,
        suggested_caption:
            parsed.suggested_caption === null
                ? null
                : typeof parsed.suggested_caption === 'string'
                  ? parsed.suggested_caption
                  : null,
    };
}

/**
 * @param {string} caption
 * @param {object} [levelContext] e.g. { levelId, scenarioTitle }
 * @returns {Promise<object>} Unified shape for Player + scoring
 */
export async function gradeCaption(caption, levelContext = {}) {
    try {
        const ai = await callAzureOpenAI(caption, levelContext);
        if (ai) {
            return {
                ...ai,
                source: 'azure',
            };
        }
    } catch {
        // fall through to heuristic
    }

    const h = heuristicGrade(caption);
    return {
        ...h,
        source: 'heuristic',
    };
}
