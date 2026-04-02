/**
 * Azure OpenAI caption grading for edited captions (server-side only).
 * Env: AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, AZURE_OPENAI_DEPLOYMENT, AZURE_OPENAI_API_VERSION
 */

const DEFAULT_API_VERSION = '2025-01-01-preview';

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

    const system = `You grade social post captions for privacy. Reply with ONLY valid JSON, no markdown:
{"verdict":"appropriate"|"needs_revision","reason":"short string","risk_flags":["location_cue"|"time_routine"|"personal_identifier"],"suggested_caption":string|null,"band":"safe"|"okay"|"risky"}
Rules: "appropriate" means no obvious location, schedule, or identity leaks for a broad audience.`;

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
    const band = ['safe', 'okay', 'risky'].includes(parsed.band) ? parsed.band : 'okay';
    const verdict = parsed.verdict === 'appropriate' ? 'appropriate' : 'needs_revision';

    return {
        band,
        flags: Array.isArray(parsed.risk_flags) ? parsed.risk_flags : [],
        reason: typeof parsed.reason === 'string' ? parsed.reason : 'Graded by model.',
        suggestedRewrite:
            typeof parsed.suggested_caption === 'string' ? parsed.suggested_caption : null,
        verdict,
        risk_flags: Array.isArray(parsed.risk_flags) ? parsed.risk_flags : [],
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
