import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { App, defineInit } from './app.js'
import { Static, TSchema } from '@sinclair/typebox'
import { BSON } from 'mongodb'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IIdentityProvider<Login extends TSchema = any, Bind extends TSchema = any> {
  id: string
  name: string

  loginSchema?: Login
  login: (data: Static<Login>) => Promise<BSON.UUID>

  bindSchema?: Bind
  bind: (userId: BSON.UUID, data: Static<Bind>) => Promise<void>

  unbind: (userId: BSON.UUID) => Promise<void>
  additionalRoutes?: FastifyPluginAsyncTypebox
}

declare module './app.js' {
  interface App {
    identityProviders: Record<string, IIdentityProvider>
  }
}

declare module './hook.js' {
  interface IHookMap {
    registerIdentityProvider(app: App): IIdentityProvider
  }
}

export const initIdentityProviders = defineInit(async (app) => {
  app.identityProviders = Object.create(null)
  for (const provider of app.hook.fire('registerIdentityProvider')) {
    app.identityProviders[provider.id] = provider
    app.logger.info(`Registered identity provider: ${provider.name}(${provider.id})`)
  }
})

export function defineIdentityProvider<Login extends TSchema, Bind extends TSchema>(
  provider: IIdentityProvider<Login, Bind>
) {
  return provider
}
