const cache = new Map()

function isMatte(r, g, b, mode) {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (mode === 'black') return max <= 22
  return min >= 214 && max - min <= 28
}

function knockOut(imageData, mode) {
  const { data, width, height } = imageData
  const count = width * height
  const visited = new Uint8Array(count)
  const queue = new Int32Array(count)
  let head = 0
  let tail = 0

  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return
    const pixel = y * width + x
    if (visited[pixel]) return
    const index = pixel * 4
    if (!isMatte(data[index], data[index + 1], data[index + 2], mode)) return
    visited[pixel] = 1
    queue[tail] = pixel
    tail += 1
  }

  for (let x = 0; x < width; x += 1) {
    push(x, 0)
    push(x, height - 1)
  }
  for (let y = 0; y < height; y += 1) {
    push(0, y)
    push(width - 1, y)
  }

  while (head < tail) {
    const pixel = queue[head]
    head += 1
    data[pixel * 4 + 3] = 0
    const x = pixel % width
    const y = (pixel - x) / width
    push(x + 1, y)
    push(x - 1, y)
    push(x, y + 1)
    push(x, y - 1)
  }

  const snapshot = new Uint8ClampedArray(data)
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = (y * width + x) * 4
      if (snapshot[index + 3] === 0) continue
      const edge =
        snapshot[index - 1] === 0 ||
        snapshot[index + 7] === 0 ||
        snapshot[index - width * 4 + 3] === 0 ||
        snapshot[index + width * 4 + 3] === 0
      if (!edge) continue
      const max = Math.max(snapshot[index], snapshot[index + 1], snapshot[index + 2])
      const min = Math.min(snapshot[index], snapshot[index + 1], snapshot[index + 2])
      const fringe =
        mode === 'black' ? max < 48 : min > 188 && max - min < 36
      if (fringe) data[index + 3] = 0
    }
  }
}

function processImage(src, mode) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      const context = canvas.getContext('2d', { willReadFrequently: true })
      context.drawImage(image, 0, 0)
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      knockOut(imageData, mode)
      context.putImageData(imageData, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    image.onerror = () => reject(new Error(`Could not load ${src}`))
    image.src = src
  })
}

export function cutoutImage(src, mode) {
  const key = `${mode}:${src}`
  if (!cache.has(key)) {
    const pending = processImage(src, mode).catch((error) => {
      cache.delete(key)
      throw error
    })
    cache.set(key, pending)
  }
  return cache.get(key)
}
