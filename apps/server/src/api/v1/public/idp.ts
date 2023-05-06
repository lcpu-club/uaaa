import { defineRouter } from '../../index.js'

export const v1IdPRouter = defineRouter(async (server) => {
  server.get('/list', async () => {
    return Object.values(server.app.identityProviders).map(({ id, name }) => ({ id, name }))
  })
  for (const [id, idp] of Object.entries(server.app.identityProviders)) {
    idp.additionalRoutes && server.register(idp.additionalRoutes, { prefix: `/${id}` })
  }
})
