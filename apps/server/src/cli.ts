import { App } from './index.js'
import { generateKeyPairSync } from 'crypto'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { migrateDb } from './migration/index.js'

yargs(hideBin(process.argv))
  .command(
    'start',
    'Starts the UAAA server',
    (yargs) => yargs,
    async () => {
      const app = new App()
      await app.start()
    }
  )
  .command(
    'migrate',
    'Migrate database',
    (yargs) =>
      yargs.option('mongoUrl', { type: 'string' }).option('initPassphrase', { type: 'string' }),
    async (argv) => {
      await migrateDb(argv)
      console.log('Done')
    }
  )
  .command('generate', 'Generate files', (yargs) =>
    yargs
      .command(
        'key',
        'Generate a new RSA secret key',
        (yargs) => yargs.option('passphrase', { type: 'string' }),
        async (argv) => {
          const keyPair = generateKeyPairSync('rsa', {
            modulusLength: 4096,
            publicKeyEncoding: {
              type: 'spki',
              format: 'pem'
            },
            privateKeyEncoding: {
              type: 'pkcs8',
              format: 'pem',
              ...(argv.passphrase ? { cipher: 'aes-256-cbc', passphrase: argv.passphrase } : {})
            }
          })
          console.log('Public key:')
          console.log(keyPair.publicKey)
          console.log('Private key:')
          console.log(keyPair.privateKey)
        }
      )
      .demandCommand(1)
  )
  .demandCommand(1)
  .parse()
