export const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

export const gray = (x, a = 1) => {
  let steps = 16
  let y = x * (255 / steps)
  return `rgba(${y}, ${y}, ${y}, ${a})`
}

export const HOOK_GET = 0
export const HOOK_SET = 1
