function writeEnv() {
  try {
    const fs = require('fs')
    const data = fs.readFileSync('./src/config/env/heroku.json')
    const json = JSON.parse(data)
    let file = ''
    Object.keys(json).forEach((item) => (file += `${item}=${json[item]}\n`))
    fs.writeFileSync('./.env.production', file)
    console.log('Finished writing heroku.json to ./env.production. Have a nice day 🌞!')
  } catch (error) {
    console.log('Error writing heroku.json to ./env.production 😱', error)
  }
}

writeEnv()
