export async function makeWhiteTransparent(imageUrl, threshold = 240) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imgData.data
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          // If pixel is near white, make transparent
          if (r >= threshold && g >= threshold && b >= threshold) {
            data[i + 3] = 0
          }
        }
        ctx.putImageData(imgData, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      } catch (e) {
        resolve(imageUrl)
      }
    }
    img.onerror = () => resolve(imageUrl)
    img.src = imageUrl
  })
}



