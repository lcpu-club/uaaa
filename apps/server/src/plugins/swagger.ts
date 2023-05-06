import { definePlugin } from '../index.js'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'

export default definePlugin({
  id: 'builtin:swagger',
  name: 'Swagger',
  setup(app, options: { prefix?: string }) {
    app.hook.register('prependServer', async (app, server) => {
      await server.register(fastifySwagger, {
        openapi: {
          info: {
            title: 'UAAA Server',
            description: 'UAAA Server',
            version: 'latest'
          },
          components: {
            securitySchemes: {
              bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
              }
            }
          },
          security: [
            {
              bearerAuth: []
            }
          ]
        }
      })
      await server.register(fastifySwaggerUi, {
        routePrefix: options.prefix ?? '/swagger'
      })
    })
  }
})
