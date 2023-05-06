import { defineRouter } from '../index.js'
import { v1PublicRouter } from './public/index.js'
import { v1UserRouter } from './user/index.js'

export const v1Router = defineRouter(async (server) => {
  server.register(v1PublicRouter, { prefix: '/public' })
  server.register(v1UserRouter, { prefix: '/user' })
})
