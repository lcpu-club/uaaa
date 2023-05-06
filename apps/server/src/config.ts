import { FastifyListenOptions } from 'fastify'

class EnvLoader {
  prefix
  string
  number
  boolean
  json

  constructor(prefix: string) {
    this.prefix = prefix
    this.string = this.transform((val) => val)
    this.number = this.transform((val) => parseInt(val, 10))
    this.boolean = this.transform((val) => val === 'true')
    this.json = this.transform((val) => JSON.parse(val))
  }

  transform<T>(transform: (val: string) => T) {
    return (key: string, init?: T) => {
      key = this.prefix + key
      const raw = process.env[key]
      let value: T | undefined = init
      if (typeof raw === 'string') {
        value = transform(raw)
      }
      if (value === undefined) throw new Error(`Missing environment variable: ${key}`)
      return value
    }
  }
}

export const env = new EnvLoader('UAAA_')

export interface IAppConfig {
  mongoUrl: string
  listenOptions: FastifyListenOptions
  plugins: (string | [string, unknown])[]
  keyPassphrase: string
}

export function resolveConfig(input?: Partial<IAppConfig>): IAppConfig {
  return {
    mongoUrl: env.string('MONGO_URL', input?.mongoUrl),
    listenOptions: input?.listenOptions ?? {
      port: env.number('PORT', 3000),
      host: env.string('HOST', '127.0.0.1')
    },
    plugins: input?.plugins ?? env.json('PLUGINS', []),
    keyPassphrase: env.string('KEY_PASSPHRASE', input?.keyPassphrase)
  }
}
