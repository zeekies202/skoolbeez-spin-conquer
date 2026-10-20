const cache = new Map()

function isChecker(r, g, b) {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  return min >= 198 && max - min <= 26
}

function softenFringe(imageData) {
  const { data, width, height } = imageData
  const snapshot = new Uint8ClampedArray(data)
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = (y * width + x) * 4
      if (snapshot[index + 3] === 0) continue
      const touchesClear =
        snapshot[index - 1] === 0 ||
        snapshot[index + 7] === 0 ||
        snapshot[index - width * 4 + 3] === 0 ||
        snapshot[index + width * 4 + 3] === 0
      if (!touchesClear) continue
      const max = Math.max(snapshot[index], snapshot[index + 1], snapshot[index + 2])
      const min = Math.min(snapshot[index], snapshot[index + 1], snapshot[index + 2])
      if (min >= 172 && max - min <= 14) data[index + 3] = 0
    }
  }
}

function knockChecker(imageData, clearHole) {
  const { data, width, height } = imageData
  const count = width * height
  const checker = new Uint8Array(count)
  for (let pixel = 0; pixel < count; pixel += 1) {
    const index = pixel * 4
    if (isChecker(data[index], data[index + 1], data[index + 2])) checker[pixel] = 1
  }

  const seen = new Uint8Array(count)
  const queue = new Int32Array(count)
  let head = 0
  let tail = 0

  const push = (pixel) => {
    if (pixel < 0 || pixel >= count || seen[pixel] || !checker[pixel]) return
    seen[pixel] = 1
    queue[tail] = pixel
    tail += 1
  }

  for (let x = 0; x < width; x += 1) {
    push(x)
    push((height - 1) * width + x)
  }
  for (let y = 0; y < height; y += 1) {
    push(y * width)
    push(y * width + width - 1)
  }

  while (head < tail) {
    const pixel = queue[head]
    head += 1
    data[pixel * 4 + 3] = 0
    const x = pixel % width
    if (x > 0) push(pixel - 1)
    if (x < width - 1) push(pixel + 1)
    if (pixel >= width) push(pixel - width)
    if (pixel < count - width) push(pixel + width)
  }

  if (!clearHole) return

  const visited = new Uint8Array(count)
  let bestStart = -1
  let bestCount = 0
  const component = new Int32Array(count)

  for (let pixel = 0; pixel < count; pixel += 1) {
    if (!checker[pixel] || seen[pixel] || visited[pixel]) continue
    let localHead = 0
    let localTail = 0
    component[localTail] = pixel
    localTail += 1
    visited[pixel] = 1
    while (localHead < localTail) {
      const current = component[localHead]
      localHead += 1
      const x = current % width
      const consider = (next) => {
        if (next < 0 || next >= count || !checker[next] || seen[next] || visited[next]) return
        visited[next] = 1
        component[localTail] = next
        localTail += 1
      }
      if (x > 0) consider(current - 1)
      if (x < width - 1) consider(current + 1)
      if (current >= width) consider(current - width)
      if (current < count - width) consider(current + width)
    }
    if (localTail > bestCount) {
      bestCount = localTail
      bestStart = pixel
    }
  }

  if (bestCount < 1000 || bestStart < 0) return

  const holeQueue = new Int32Array(count)
  const holeSeen = new Uint8Array(count)
  let holeHead = 0
  let holeTail = 0
  holeQueue[holeTail] = bestStart
  holeTail += 1
  holeSeen[bestStart] = 1

  while (holeHead < holeTail) {
    const pixel = holeQueue[holeHead]
    holeHead += 1
    data[pixel * 4 + 3] = 0
    const x = pixel % width
    const consider = (next) => {
      if (next < 0 || next >= count || holeSeen[next] || !checker[next] || seen[next]) return
      holeSeen[next] = 1
      holeQueue[holeTail] = next
      holeTail += 1
    }
    if (x > 0) consider(pixel - 1)
    if (x < width - 1) consider(pixel + 1)
    if (pixel >= width) consider(pixel - width)
    if (pixel < count - width) consider(pixel + width)
  }
}

function processStand(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      const context = canvas.getContext('2d', { willReadFrequently: true })
      context.drawImage(image, 0, 0)
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      knockChecker(imageData, true)
      softenFringe(imageData)
      context.putImageData(imageData, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    image.onerror = () => reject(new Error(`Could not load ${src}`))
    image.src = src
  })
}

function processDisc(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      const context = canvas.getContext('2d', { willReadFrequently: true })
      context.drawImage(image, 0, 0)
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      knockChecker(imageData, false)
      softenFringe(imageData)
      context.putImageData(imageData, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    image.onerror = () => reject(new Error(`Could not load ${src}`))
    image.src = src
  })
}

function cachedCut(src, process) {
  const key = `${process.name}:${src}`
  if (!cache.has(key)) {
    const pending = process(src).catch((error) => {
      cache.delete(key)
      throw error
    })
    cache.set(key, pending)
  }
  return cache.get(key)
}

export function cutWheelStand(src) {
  return cachedCut(src, processStand)
}

export function cutWheelDisc(src) {
  return cachedCut(src, processDisc)
}
