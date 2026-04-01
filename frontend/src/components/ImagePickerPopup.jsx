import React, { useState } from 'react'
import { IoClose } from 'react-icons/io5'
import mockImage1 from '../assets/Photo/ImagePickerPopup/mock1.png'
import mockImage2 from '../assets/Photo/ImagePickerPopup/mock2.png'

function OptionCard({ title, imageSrc, isSelected, onClick }) {
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
      <h3 className='text-[#24356f] text-xl md:text-2xl font-bold text-center mb-4'>
        {title}
      </h3>
      <img
        src={imageSrc}
        alt={title}
        className='w-full h-[250px] md:h-[320px] object-cover rounded-sm'
      />
    </button>
  )
}

function ImagePickerPopup({ onClose, onSubmit }) {
  const [selectedOption, setSelectedOption] = useState(null)

  const handleSelect = (option) => {
    setSelectedOption((prev) => (prev === option ? null : option))
  }

  const handleSubmit = () => {
    if (!selectedOption) return
    onSubmit(selectedOption)
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6'>
      <div
        className='absolute inset-0 bg-black/40'
        onClick={onClose}
        aria-hidden
      />

      <div className='relative w-full max-w-[1200px] rounded-xl border border-[#5c5c5c] bg-[#efefef] p-4 md:p-6 shadow-2xl'>
        <button
          type='button'
          onClick={onClose}
          className='absolute right-4 top-3 text-black hover:text-[#1d4ed8] transition-colors'
          aria-label='Close image picker'
        >
          <IoClose size={52} />
        </button>

        <h2 className='text-[#24356f] text-2xl md:text-5xl font-bold mb-5 pr-16'>
          Choose the versions of the original image you want to replace
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          <OptionCard
            title='Remove the boy'
            imageSrc={mockImage1}
            isSelected={selectedOption === 'Option A'}
            onClick={() => handleSelect('Option A')}
          />
          <OptionCard
            title='Remove the school name'
            imageSrc={mockImage2}
            isSelected={selectedOption === 'Option B'}
            onClick={() => handleSelect('Option B')}
          />
        </div>

        <div className='mt-5 flex justify-end'>
          <button
            type='button'
            onClick={handleSubmit}
            disabled={!selectedOption}
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