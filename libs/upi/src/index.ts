export class UPI {
  namespace: string
  path: string
  metadata: URLSearchParams

  constructor(source: string | UPI) {
    if (source instanceof UPI) {
      this.namespace = source.namespace
      this.path = source.path
      this.metadata = new URLSearchParams(source.metadata.toString())
    } else {
      const match = source.match(
        /^(?<namespace>[\w-]+):(?<path>[\w-]+(?:\/[\w-]+)*)(?<metadata>\?.*)?$/
      )
      if (!match || !match.groups) {
        throw new Error('Invalid UPI')
      }
      this.namespace = match.groups.namespace
      this.path = match.groups.path
      this.metadata = new URLSearchParams(
        match.groups.metadata?.substring(1) ?? ''
      )
    }
  }

  toString() {
    const metadata = this.metadata.toString()
    return `${this.namespace}:${this.path}${metadata ? `?${metadata}` : ''}`
  }

  isDerivedFrom(upi: UPI) {
    // Require identical namespace
    if (this.namespace !== upi.namespace) return false
    // Derived path must have a prefix of parent path
    if (!this.path.startsWith(upi.path)) return false
    // Derived path must have a slash after parent path,
    // or be the same length
    if (
      this.path.length > upi.path.length &&
      this.path[upi.path.length] !== '/'
    )
      return false
    // Derived metadata must contain all parent metadata
    for (const [key, value] of upi.metadata) {
      if (this.metadata.get(key) !== value) return false
    }
    return true
  }

  canDerive(upi: UPI) {
    return upi.isDerivedFrom(this)
  }

  derive(source: string | UPI) {
    const derived = new UPI(source)
    if (!derived.isDerivedFrom(this)) throw new Error('Derivation failed')
    return derived
  }
}
