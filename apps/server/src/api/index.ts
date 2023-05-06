import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { v1Router } from './v1/index.js'

export function defineRouter(router: FastifyPluginAsyncTypebox) {
  return router
}

export const apiRouter = defineRouter(async (server) => {
  server.get('/health', () => 'ok')

  server.register(v1Router, { prefix: '/v1' })
})

export const wellKnownRouter = defineRouter(async (server) => {
  const jwks = {
    keys: [server.app.keyPair.publicKey.export({ format: 'jwk' })]
  }
  server.get('/jwks.json', () => jwks)
})
