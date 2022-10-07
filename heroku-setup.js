function writeEnv() {
  const fs = require('fs')
  const data = fs.readFileSync('./src/config/env/heroku.json')
  const json = JSON.parse(data)
  let file = ''
  Object.keys(json).forEach((item) => (file += `${item}=${json[item]}\n`))
  fs.writeFileSync('./.env.production', file)
}

writeEnv()
