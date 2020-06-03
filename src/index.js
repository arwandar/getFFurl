import fs from 'fs'

import Axios from 'axios'

const baseUrl = `https://www.fanfiction.net/book/Hobbit/?&srt=1&lan=1&r=4&len=1&c1=75054&c2=89127&s=2&p=`

const writeUrls = (urlsArray) =>
  fs.appendFile('url.txt', `${urlsArray.join('\n')}\n`, (err) => {
    if (err) throw err
    console.log('The "data to append" was appended to file!')
  })

const processBody = (data) => {
  const captureStrings = data.match(/href="\/s\/(.+?)\//g)

  if (!captureStrings) return false

  writeUrls(
    captureStrings.map(
      (captureString) =>
        `https://www.fanfiction.net/s/${captureString.match(/href="\/s\/(.+?)\//)[1]}`
    )
  )
  return true
}

const max = 1

const getBody = (page) =>
  Axios.get(`${baseUrl}${page}`).then(({ data }) => {
    const res = processBody(data)
    if (res && page + 1 < max) getBody(page + 1)
  })

getBody(1)
