import { App, defineInit } from './app.js'
import { MaybePromise } from './utils.js'

const kPlugin = Symbol('plugin')

export interface IPlugin<O = unknown> {
  id: string
  name: string
  setup: (app: App, options: O) => MaybePromise<unknown>
}

export function definePlugin<O>(plugin: IPlugin<O>): IPlugin<O> {
  return Object.assign({}, plugin, { [kPlugin]: true })
}

export interface IPluginInstance {
  plugin: IPlugin
  options: unknown
}

declare module './app.js' {
  interface App {
    plugins: Record<string, IPluginInstance>
  }
}

export async function loadPlugin(app: App, id: string, options: unknown) {
  if (id.startsWith('builtin:')) {
    id = id.replace('builtin:', '')
    id = `./plugins/${id}.js`
  }
  const { default: plugin } = await import(id)
  if (!plugin[kPlugin]) throw new Error(`Plugins should be defined using definePlugin()`)
  id = plugin.id
  if (id in app.plugins) throw new Error(`Plugin ${plugin.name} is already loaded`)
  app.plugins[id] = { plugin, options }
  app.logger.info(`Loaded plugin ${plugin.name}(${id})`)
}

export const initPlugins = defineInit(async (app) => {
  app.plugins = {}
  for (const plugin of app.config.plugins) {
    const [id, options] = plugin instanceof Array ? plugin : [plugin, undefined]
    await loadPlugin(app, id, options)
  }
  for (const { plugin, options } of Object.values(app.plugins)) {
    await plugin.setup(app, options)
  }
})
