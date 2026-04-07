import React, { useEffect, useState } from 'react'
import { IoClose } from 'react-icons/io5'

function OptionCard({ title, subtitle, description, imageSrc, isSelected, onClick }) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`text-left rounded-lg border w-full p-4 bg-[#d7d7d7] transition-all duration-150 ${
        isSelected
          ? 'border-[#1d4ed8] ring-4 ring-[#8fb6ff]'
          : 'border-[#5a5a5a] hover:border-[#3557b7]'
      }`}
    >
      <div className='mb-3'>
        <h3 className='text-[#24356f] text-lg md:text-xl font-bold text-center'>{title}</h3>
        {subtitle ? (
          <p className='text-[#1e3a6e] text-sm md:text-base font-semibold text-center mt-1'>{subtitle}</p>
        ) : null}
        {description ? (
          <p className='text-[#2a3148] text-sm md:text-[15px] leading-snug text-center mt-2 px-1'>
            {description}
          </p>
        ) : null}
      </div>
      {imageSrc ? (
        <div className='w-full flex items-center justify-center bg-[#c5c5c5] rounded-sm min-h-[120px] max-h-[min(42dvh,520px)] sm:max-h-[min(58dvh,820px)] overflow-auto'>
          <img
            src={imageSrc}
            alt={title}
            className='max-w-full max-h-[min(42dvh,520px)] sm:max-h-[min(58dvh,820px)] w-auto h-auto object-contain'
          />
        </div>
      ) : (
        <div className='w-full min-h-[140px] max-h-[min(58dvh,820px)] bg-[#bbb] rounded-sm flex items-center justify-center text-[#444] text-sm'>
          Image not available
        </div>
      )}
    </button>
  )
}

function ImagePickerPopup({
  onClose,
  onSubmit,
  optionAUrl,
  optionBUrl,
  optionATitle = 'Option A',
  optionBTitle = 'Option B',
  optionASubtitle,
  optionBSubtitle,
  optionADescription,
  optionBDescription,
  singleOptionOnly = false,
}) {
  const [selectedOption, setSelectedOption] = useState(null)

  useEffect(() => {
    if (singleOptionOnly) {
      setSelectedOption('Option A')
    } else {
      setSelectedOption(null)
    }
  }, [singleOptionOnly])

  const handleSelect = (option) => {
    if (singleOptionOnly) {
      setSelectedOption('Option A')
      return
    }
    setSelectedOption((prev) => (prev === option ? null : option))
  }

  const handleSubmit = () => {
    if (!selectedOption) return
    onSubmit(selectedOption)
  }

  const canSubmit = Boolean(selectedOption)

  return (
    <div className='fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain p-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] md:p-6 md:items-center'>
      <div className='absolute inset-0 bg-black/40' onClick={onClose} aria-hidden />

      <div className='relative my-4 w-full max-w-[1200px] max-h-[min(92dvh,92vh)] overflow-y-auto rounded-xl border border-[#5c5c5c] bg-[#efefef] p-3 sm:p-4 md:p-6 shadow-2xl'>
        <button
          type='button'
          onClick={onClose}
          className='absolute right-2 top-2 sm:right-4 sm:top-3 text-black hover:text-[#1d4ed8] transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center'
          aria-label='Close image picker'
        >
          <IoClose className='w-8 h-8 sm:w-12 sm:h-12' />
        </button>

        <h2 className='text-[#24356f] text-lg sm:text-xl md:text-4xl font-bold mb-4 sm:mb-5 pr-12 sm:pr-16 leading-snug'>
          Choose the versions of the original image you want to replace
        </h2>

        <div
          className={`grid gap-5 ${singleOptionOnly ? 'grid-cols-1 max-w-xl mx-auto' : 'grid-cols-1 md:grid-cols-2'}`}
        >
          <OptionCard
            title={optionATitle}
            subtitle={optionASubtitle}
            description={optionADescription}
            imageSrc={optionAUrl}
            isSelected={selectedOption === 'Option A'}
            onClick={() => handleSelect('Option A')}
          />
          {!singleOptionOnly && (
            <OptionCard
              title={optionBTitle}
              subtitle={optionBSubtitle}
              description={optionBDescription}
              imageSrc={optionBUrl}
              isSelected={selectedOption === 'Option B'}
              onClick={() => handleSelect('Option B')}
            />
          )}
        </div>

        <div className='mt-5 flex justify-stretch sm:justify-end'>
          <button
            type='button'
            onClick={handleSubmit}
            disabled={!canSubmit}
            className='w-full sm:w-auto rounded-lg px-6 py-3 min-h-[48px] text-base sm:text-lg font-bold text-white bg-[#2f79df] border border-[#234f92] disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation'
          >
            Submit Selection
          </button>
        </div>
      </div>
    </div>
  )
}

export default ImagePickerPopup
