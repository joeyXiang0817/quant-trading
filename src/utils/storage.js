const PREFIX = 'quant_'

export const storage = {
  local: {
    get(key) {
      try {
        const val = localStorage.getItem(PREFIX + key)
        return val ? JSON.parse(val) : null
      } catch {
        return null
      }
    },
    set(key, value) {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    },
    remove(key) {
      localStorage.removeItem(PREFIX + key)
    }
  }
}
