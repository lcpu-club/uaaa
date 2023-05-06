import { pino, type Logger } from 'pino'
import { IAppConfig, resolveConfig } from './config.js'
import { initMongo } from './mongo.js'
import { initServer } from './server.js'
import { initHook } from './hook.js'
import { initPlugins } from './plugin.js'
import { initIdentityProviders } from './idp.js'

export interface ICreateAppOptions {
  logger: Logger
  config: Partial<IAppConfig>
}

export class App {
  private _initiated = false
  logger
  config

  constructor(options?: Partial<ICreateAppOptions>) {
    this.logger = options?.logger ?? pino()
    this.config = resolveConfig(options?.config)
  }

  async init() {
    if (this._initiated) return
    this._initiated = true
    await initHook(this)
    await initPlugins(this)
    await initIdentityProviders(this)
    await initMongo(this)
    await initServer(this)
  }

  async start() {
    await this.init()
    await this.server.listen(this.config.listenOptions)
  }
}

export function defineInit(init: (app: App) => Promise<unknown>) {
  return init
}
