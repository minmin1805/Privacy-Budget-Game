import React, { useState } from 'react'
import Header from '../components/Header'
import ImagePickerPopup from '../components/ImagePickerPopup'
import profileImage from '../assets/Photo/GamePage/mockprofile.png'
import postImage from '../assets/Photo/GamePage/postimage.png'
import { FaHeart, FaRegCommentDots, FaRegShareSquare, FaRegThumbsUp } from 'react-icons/fa'
import { IoShield } from 'react-icons/io5'

const pillBase =
  'px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors duration-200'

function ToggleRow({ label, left, right, leftActive = true, onLeftClick, onRightClick }) {
  return (
    <div className='rounded-xl border border-[#5f6686] bg-white px-4 py-3 flex items-center justify-between gap-4'>
      <span className='text-sm md:text-base font-semibold text-[#1b2244]'>{label}</span>
      <div className='rounded-md bg-[#e8ebfa] p-1 flex items-center'>
        <button
          type='button'
          onClick={onLeftClick}
          className={`${pillBase} ${leftActive ? 'bg-[#10bf62] text-[#06122f] border-[#0fa659]' : 'bg-transparent text-[#1b2244] border-transparent'}`}
        >
          {left}
        </button>
        <button
          type='button'
          onClick={onRightClick}
          className={`${pillBase} ${!leftActive ? 'bg-[#10bf62] text-[#06122f] border-[#0fa659]' : 'bg-transparent text-[#1b2244] border-transparent'}`}
        >
          {right}
        </button>
      </div>
    </div>
  )
}

function ScoreCard({ icon, title, score, value = 70 }) {
  return (
    <div className='bg-[#4860bd] rounded-xl px-4 py-2 text-white shadow-sm'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <span className='text-3xl'>{icon}</span>
          <h3 className='text-lg md:text-xl font-bold'>{title}</h3>
        </div>
        <span className='text-3xl md:text-4xl font-bold'>{score}</span>
      </div>
      <div className='mt-2 h-3 bg-[#dfe5ff] rounded-full overflow-hidden'>
        <div className='h-full bg-white rounded-full' style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

export default function GamePage() {
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false)
  const [photoCropMode, setPhotoCropMode] = useState('Original')
  const [selectedImageOption, setSelectedImageOption] = useState(null)

  const openImagePicker = () => {
    setIsImagePickerOpen(true)
  }

  const closeImagePicker = () => {
    setIsImagePickerOpen(false)
  }

  const handleImageSubmit = (pickedOption) => {
    setSelectedImageOption(pickedOption)
    setPhotoCropMode('Crop/Blur Image')
    setIsImagePickerOpen(false)
  }

  const handleChooseOriginal = () => {
    setPhotoCropMode('Original')
    setSelectedImageOption(null)
  }

  return (
    <div className='min-h-screen bg-[#ebedf2]'>
      <Header />

      <main className='max-w-[1720px] mx-auto px-4 md:px-6 py-3 mt-5'>
        <section className='grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4'>
          <ScoreCard icon={<IoShield />} title='Privacy Score' score={70} value={70} />
          <ScoreCard icon={<FaHeart className='text-[#ff4f6f]' />} title='Engagement Score' score={70} value={70} />
        </section>

        <section className='grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4 mt-7'>
          <div className='space-y-3'>
            <article className='rounded-lg border border-[#373a47] bg-white px-4 py-3'>
              <h2 className='text-3xl md:text-4xl font-bold text-[#1b2244] leading-tight'>
                Scenario: Team Photo After Practice
              </h2>
              <hr className='my-2 border-[#5d6475]' />
              <p className='text-lg md:text-[20px] text-[#222639] leading-snug'>
                Alex wants to post a photo taken outside school. Not everything in the frame is equally meant for everyone
              </p>
            </article>

            <article className='rounded-lg border border-[#373a47] bg-white overflow-hidden'>
              <div className='px-4 py-3'>
                <h2 className='text-xl md:text-[32px] font-bold text-[#1b2244] leading-tight'>Your New Post</h2>
                <hr className='my-2 border-[#5d6475]' />

                <div className='flex items-center justify-between gap-3 mb-3'>
                  <div className='flex items-center gap-3'>
                    <img src={profileImage} alt='Profile' className='w-12 h-12 md:w-14 md:h-14 rounded-full object-cover' />
                    <div>
                      <p className='font-bold text-sm md:text-base text-[#161a2d]'>Alex_132</p>
                      <p className='text-[#3973ba] text-xs md:text-sm'>Riverdale High School</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-md md:text-lg text-[#161a2d]'>Audience:</span>
                    <span className='px-4 py-1 rounded-lg bg-[#1f7dff] text-white text-md md:text-lg font-semibold'>
                      Public
                    </span>
                  </div>
                </div>
              </div>

              <img src={postImage} alt='Post content' className='w-full h-[250px] md:h-[320px] object-cover border-y border-[#404454]' />

              <div className='px-4 py-3'>
                <p className='text-base md:text-[24px] leading-tight text-[#1b1e2d]'>
                  Hanging out at my school!! <span className='text-[#2f6dc9] font-semibold'>#SchoolLife</span>
                </p>
              </div>

              <div className='px-4 py-3 border-t border-[#5d6475] flex items-center justify-around text-[#1b1f32]'>
                <button className='flex items-center gap-2 text-lg md:text-xl'>
                  <FaRegThumbsUp size={20}/>
                  <span>Like</span>
                </button>
                <button className='flex items-center gap-2 text-lg md:text-xl'>
                  <FaRegCommentDots size={20}/>
                  <span>Comment</span>
                </button>
                <button className='flex items-center gap-2 text-lg md:text-xl'>
                  <FaRegShareSquare size={20}/>
                  <span>Share</span>
                </button>
              </div>
            </article>
          </div>

          <aside className='rounded-3xl border border-[#66709b] bg-[#dfe4f4] overflow-hidden h-fit mt-15'>
            <div className='bg-[#4860bd] px-5 py-3'>
              <h2 className='text-white text-3xl md:text-4xl font-bold leading-[0.95]'>Adjust Setting Here:</h2>
            </div>

            <div className='p-3 space-y-2.5'>
              <ToggleRow label='Audience:' left='Public' right='Friends' leftActive />
              <ToggleRow label='Location Tag:' left='On' right='Off' leftActive />
              <ToggleRow label='Caption Detail:' left='Keep' right='Edit' leftActive />
              <ToggleRow
                label='Photo Crop:'
                left='Original'
                right='Crop/Blur Image'
                leftActive={photoCropMode === 'Original'}
                onLeftClick={handleChooseOriginal}
                onRightClick={openImagePicker}
              />

              {photoCropMode === 'Crop/Blur Image' && selectedImageOption && (
                <p className='text-xs text-[#1b2244] font-medium'>
                  Selected image version: {selectedImageOption}
                </p>
              )}

              <button className='w-full py-2.5 mt-1 rounded-lg text-lg md:text-xl font-bold text-white bg-[#79a7e8] border border-[#3e5a96]'>
                Show post preview
              </button>
              <button className='w-full py-2.5 rounded-lg text-lg md:text-xl font-bold text-white bg-[#2f79df] border border-[#234f92]'>
                Post Now
              </button>
            </div>
          </aside>
        </section>
      </main>

      {isImagePickerOpen && (
        <ImagePickerPopup
          onClose={closeImagePicker}
          onSubmit={handleImageSubmit}
        />
      )}
    </div>
  )
}