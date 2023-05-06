import { defineRouter } from '../../index.js'
import { v1IdPRouter } from './idp.js'
import { v1LoginRouter } from './login.js'

export const v1PublicRouter = defineRouter(async (server) => {
  server.register(v1IdPRouter, { prefix: '/idp' })
  server.register(v1LoginRouter, { prefix: '/login' })
})
