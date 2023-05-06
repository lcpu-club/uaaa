/**
 * UPI (Universal Permission Identifier) is a URI-like syntax for identifying
 * permissions in a hierarchical manner.
 *
 * @export
 * @class UPI
 */
export class UPI {
  namespace: string
  path: string
  metadata: string

  constructor(source: string | UPI) {
    if (source instanceof UPI) {
      this.namespace = source.namespace
      this.path = source.path
      this.metadata = source.metadata
    } else {
      const match = source.match(/^(?<namespace>[\w-]+):(?<path>[\w-]+(?:\/[\w-]+)*)(?:\?(?<metadata>.+))?$/)
      if (!match || !match.groups) {
        throw new Error('Invalid UPI')
      }
      this.namespace = match.groups.namespace
      this.path = match.groups.path
      this.metadata = match.groups.metadata ?? ''
    }
  }

  toString() {
    const metadata = this.metadata.toString()
    return `${this.namespace}:${this.path}` + (metadata ? `?${metadata}` : '')
  }

  isDerivedFrom(upi: UPI) {
    // Require identical namespace
    if (this.namespace !== upi.namespace) return false
    // Derived path must have a prefix of parent path
    if (!this.path.startsWith(upi.path)) return false
    // Derived path must have a slash after parent path,
    // or be the same length
    if (this.path.length > upi.path.length && this.path[upi.path.length] !== '/') return false
    // Derived metadata must contain all parent metadata
    if (upi.metadata) {
      if (!this.metadata.startsWith(upi.metadata)) return false
      if (this.metadata.length > upi.metadata.length && this.metadata[upi.metadata.length] !== '&') return false
    }
    return true
  }

  canDerive(upi: UPI) {
    return upi.isDerivedFrom(this)
  }

  derive(wanted: string | UPI) {
    const derived = new UPI(wanted)
    if (derived.metadata) throw new Error(`Wanted UPI ${wanted} should not have metadata`)
    derived.metadata = this.metadata
    if (!derived.isDerivedFrom(this)) throw new Error('Derivation failed')
    return derived
  }
}

/**
 * UPINamespace is a class to maintain a collection of UPIs with the same
 * namespace, which supports fast derivation of UPI metadatas.
 *
 * @export
 * @class UPINamespace
 */
export class UPINamespace {
  pathes: Record<string, string>
  constructor(public namespace: string, init?: string[]) {
    this.pathes = Object.create(null)
    if (init) {
      init
        .map((perm) => new UPI(perm))
        .filter((perm) => perm.namespace === namespace)
        .forEach((perm) => this.add(perm.path, perm.metadata))
    }
  }

  /**
   * Add a path-metadata pair to the namespace.
   *
   * @param {string} path
   * @param {string} metadata
   * @memberof UPINamespace
   */
  add(path: string, metadata: string) {
    if (path in this.pathes) throw new Error(`Duplicate path: ${toString()}`)
    this.pathes[path] = metadata
  }

  /**
   * Derive metadata from a path.
   *
   * @param {string} path
   * @return {(string | null)}
   * @memberof UPINamespace
   */
  derivedMetadata(path: string): string | null {
    while (path) {
      if (path in this.pathes) {
        return this.pathes[path]
      }
      path = path.substring(0, path.lastIndexOf('/'))
    }
    return null
  }
}

/**
 * UPICollection is a class to maintain a collection of UPIs, which supports
 * derivation of a set of wanted permissions.
 *
 * @export
 * @class UPICollection
 */
export class UPICollection {
  namespaces: Record<string, UPINamespace>

  constructor(permissions: string[]) {
    this.namespaces = Object.create(null)
    for (const permission of permissions) {
      const upi = new UPI(permission)
      const namespace = (this.namespaces[upi.namespace] ??= new UPINamespace(upi.namespace))
      namespace.add(upi.path, upi.metadata)
    }
  }

  /**
   * Try to derive a set of wanted permissions. Metadata will be added to the wanted
   * permissions if possible.
   *
   * @param {string[]} wantedPermissions
   * @memberof UPICollection
   */
  tryDerive(wantedPermissions: string[]) {
    const ok: string[] = []
    const notOk: string[] = []
    for (const permission of wantedPermissions) {
      const upi = new UPI(permission)
      if (upi.metadata) throw new Error(`Wanted UPI ${permission} should not have metadata`)

      const namespace = this.namespaces[upi.namespace]
      if (!namespace) {
        notOk.push(permission)
        continue
      }

      const metadata = namespace.derivedMetadata(upi.path)
      if (metadata !== null) {
        upi.metadata = metadata
        ok.push(upi.toString())
      } else {
        notOk.push(permission)
      }
    }
    return { ok, notOk }
  }
}
