import { defineRouter } from '../../index.js'

export const v1UserRouter = defineRouter(async (server) => {
  server.addHook('preValidation', async (req) => {
    //
  })
})
