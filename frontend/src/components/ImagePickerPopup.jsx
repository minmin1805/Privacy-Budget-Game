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
        <div className='w-full flex items-center justify-center bg-[#c5c5c5] rounded-sm min-h-[140px] max-h-[min(58dvh,820px)] overflow-auto'>
          <img
            src={imageSrc}
            alt={title}
            className='max-w-full max-h-[min(58dvh,820px)] w-auto h-auto object-contain'
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
    <div className='fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6'>
      <div className='absolute inset-0 bg-black/40' onClick={onClose} aria-hidden />

      <div className='relative w-full max-w-[1200px] max-h-[92vh] overflow-y-auto rounded-xl border border-[#5c5c5c] bg-[#efefef] p-4 md:p-6 shadow-2xl'>
        <button
          type='button'
          onClick={onClose}
          className='absolute right-4 top-3 text-black hover:text-[#1d4ed8] transition-colors'
          aria-label='Close image picker'
        >
          <IoClose size={52} />
        </button>

        <h2 className='text-[#24356f] text-xl md:text-4xl font-bold mb-5 pr-16'>
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

        <div className='mt-5 flex justify-end'>
          <button
            type='button'
            onClick={handleSubmit}
            disabled={!canSubmit}
            className='rounded-lg px-7 py-2.5 text-lg font-bold text-white bg-[#2f79df] border border-[#234f92] disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Submit Selection
          </button>
        </div>
      </div>
    </div>
  )
}

export default ImagePickerPopup
