import fastify, { FastifyInstance } from 'fastify'
import { App, defineInit } from './app.js'
import { apiRouter, wellKnownRouter } from './api/index.js'

declare module 'fastify' {
  interface FastifyInstance {
    app: App
  }
}

declare module './app.js' {
  interface App {
    server: FastifyInstance
  }
}

declare module './hook.js' {
  interface IHookMap {
    prependServer(app: App, server: FastifyInstance): void
  }
}

export const initServer = defineInit(async (app) => {
  const server = fastify({ logger: app.logger })
  server.decorate('app', app)
  app.server = server
  app.hook.fire('prependServer', server)
  server.register(apiRouter, { prefix: '/api' })
  server.register(wellKnownRouter, { prefix: '/.well-known' })
  await server.ready()
})
