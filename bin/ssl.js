const fs = require('fs')
const { resolve, relative, dirname } = require('path')
const { promisify } = require('util')
const devcert = require('devcert')

/**
 *
 * @param {string} path
 */
const stat = (path) =>
  new Promise((resolve) =>
    fs.stat(path, (err, st) => (err ? resolve(null) : resolve(st)))
  )

const writeFile = promisify(fs.writeFile)
const mkdir = promisify(fs.mkdir)

const ROOT_DIR = dirname(__dirname)
const SSL_DIR = resolve(ROOT_DIR, './.ssl')

Promise.resolve()
  .then(() => stat(SSL_DIR))
  .then((st) => {
    if (!st) {
      return mkdir(SSL_DIR)
    }
  })
  .then(() =>
    Promise.all([stat(SSL_DIR + '/cert.crt'), stat(SSL_DIR + '/cert.key')])
  )
  .then(([crt, key]) => {
    if (!crt || !key) {
      return devcert
        .certificateFor('localhost')
        .then(({ key, cert }) =>
          Promise.all([
            writeFile(SSL_DIR + '/cert.crt', cert).then(() =>
              console.log(
                'created: ',
                relative(ROOT_DIR, SSL_DIR + '/cert.crt')
              )
            ),
            writeFile(SSL_DIR + '/cert.key', key).then(() =>
              console.log(
                'created: ',
                relative(ROOT_DIR, SSL_DIR + '/cert.key')
              )
            )
          ])
        )
    }
  })
  .catch(console.error)
