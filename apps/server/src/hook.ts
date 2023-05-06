/* eslint-disable @typescript-eslint/no-explicit-any */
import { App, defineInit } from './app.js'

declare module './app.js' {
  interface App {
    hook: IAppHookContext
  }
}

export interface IHookMap extends Record<string, IHookFn> {
  test: (app: App, a: number) => string
}

export interface IHookFn<Args extends Array<any> = Array<any>, Result = any> {
  (app: App, ...args: Args): Result
}

type Rest<T extends any[]> = T extends [any, ...infer Rest] ? Rest : never

export interface IAppHookContext {
  hooks: Record<keyof IHookMap, IHookFn[]>
  register<K extends keyof IHookMap>(name: K, fn: IHookMap[K]): () => void
  fire<K extends keyof IHookMap>(
    name: K,
    ...args: Rest<Parameters<IHookMap[K]>>
  ): ReturnType<IHookMap[K]>[]
  fireOrdered<K extends keyof IHookMap>(
    name: K,
    ...args: Rest<Parameters<IHookMap[K]>>
  ): Promise<ReturnType<IHookMap[K]>[]>
}

export const initHook = defineInit(async (app) => {
  app.hook = {
    hooks: Object.create(null),
    register(name, fn) {
      this.hooks[name] = this.hooks[name] ?? []
      this.hooks[name].push(fn)
      return () => {
        const index = this.hooks[name].indexOf(fn)
        if (index !== -1) this.hooks[name].splice(index, 1)
      }
    },
    fire(name, ...args) {
      return this.hooks[name]?.map((fn) => fn(app, ...args))
    },
    async fireOrdered(name, ...args) {
      const hooks = this.hooks[name]
      if (!hooks) return []
      const result = []
      for (const hook of hooks) {
        result.push(await hook(app, ...args))
      }
      return result
    }
  }
})
