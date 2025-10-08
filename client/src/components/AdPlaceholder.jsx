import { useState, useEffect } from 'react'

export default function AdPlaceholder({ className = "" }) {
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [failed, setFailed] = useState({})
  
  // Expect actual image files to be placed under client/public/ads/
  // Example names (please add your provided images with these names or update below):
  const base = (import.meta.env.BASE_URL || '/')
  const ads = [
    // Only these three images should be used (placed in client/public/ads/)
    { id: 1, image: `${base}ads/startuptn-preincubation.jpg`, alt: 'StartupTN Pre-Incubation Centre' },
    { id: 2, image: `${base}ads/amcet-528.jpg`, alt: 'Anna University Academic Achievers' },
    { id: 3, image: `${base}ads/grand-launch.jpg`, alt: 'Grand Launch Event - Annai Mira College' }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length)
    }, 20000) // 20 seconds

    return () => clearInterval(interval)
  }, [ads.length])

  // Choose a display index that is not failed; if all failed show helper panel
  let displayIndex = currentAdIndex
  let attempts = 0
  while (failed[displayIndex] && attempts < ads.length) {
    displayIndex = (displayIndex + 1) % ads.length
    attempts++
  }
  const allFailed = attempts >= ads.length

  return (
    <div className={` h-full flex items-center justify-center p-4 ${className}`}>
      <div className="text-center">
        <div className="text-sm font-semibold text-gray-700 mb-4">Advertisement</div>
        <div className="relative overflow-hidden rounded-lg bg-base-100">
          {!allFailed ? (
            <img
              src={ads[displayIndex].image}
              alt={ads[displayIndex].alt}
              className="w-full h-32 md:h-48 lg:h-56 xl:h-64 object-cover transition-opacity duration-500"
              onError={() => {
                setFailed((f)=>({ ...f, [displayIndex]: true }))
                setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length)
              }}
            />
          ) : (
            <div className="w-full h-full grid place-items-center relative">
              <div className="flex flex-col items-center justify-center">
                <div className="text-2xl md:text-3xl font-bold opacity-90 mb-2">Advertisement</div>
              </div>
            </div>
          )}
          <div className="absolute bottom-2 right-2 flex gap-1">
            {ads.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  index === displayIndex ? 'bg-primary' : 'bg-base-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
