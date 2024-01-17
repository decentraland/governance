const URL = 'https://httpstat.us'

export class HttpStat {
  static async fetchResponse(responseCode: string, sleepTime: number) {
    if (sleepTime > 0) {
      responseCode += '?sleep=' + sleepTime
    }

    const url = `${URL}/${responseCode}`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ContentType: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Error fetching data from ${url}: ${await response.text()}`)
    }

    return await response.json()
  }
}
