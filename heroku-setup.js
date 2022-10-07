function writeEnv() {
  try {
    const fs = require('fs')
    const data = fs.readFileSync('./src/config/env/heroku.json')
    const json = JSON.parse(data)
    const outputPath = './.env.production'
    let file = ''
    Object.keys(json).forEach((item) => (file += `${item}=${json[item]}\n`))
    fs.writeFileSync(outputPath, file)
    console.log(`Finished writing heroku.json to ${outputPath}. Have a nice day 🌞!`)
  } catch (error) {
    console.log(`Error writing heroku.json to ${outputPath} 😱`, error)
  }
}

writeEnv()
