import fs from 'fs'

import Axios from 'axios'
import qs from 'query-string'

const baseUrl = `https://www.fanfiction.net/`
const max = 10
const delay = 500

const getKnowIds = (paths) => {
  let ids = []
  paths.forEach((path) => {
    if (path)
      ids = [
        ...ids,
        ...fs
          .readFileSync(`urls/${path}`, 'utf8')
          .trim()
          .split('\n')
          .filter((url) => url.includes('fanfiction.net.org'))
          .map((url) => url.replace(`${baseUrl}s/`, '')),
      ]
  })

  return new Set(ids)
}

const writeUrls = (path, ids) =>
  new Promise((resolve, reject) =>
    fs.appendFile(`urls/${path}`, ids.map((id) => `${baseUrl}s/${id}`).join('\n'), (err) =>
      err ? reject() : resolve()
    )
  )

const regex = /href="\/s\/(.+?)\//

const processBody = (data, knownIds) => {
  const ids = data.match(new RegExp(regex, 'g'))

  return ids
    ? ids
        .map((stg) => stg.match(regex)[1])
        .filter((id) => !knownIds.has(id))
        .reduce((newIds, id) => newIds.add(id), new Set())
    : false
}

const process = (config, current, previous) => {
  if (!config) return Promise.resolve()

  let knownIds = getKnowIds([current, previous])
  let newIds = new Set()

  const getBody = (fandomUrl, params, p = 1) =>
    !max || p < max
      ? Axios.get(`${baseUrl}${fandomUrl}/?${qs.stringify({ ...params, p })}`).then(({ data }) => {
          console.log('FFNET::page =>', p)
          const res = processBody(data)

          if (res) {
            newIds = new Set([...res, ...newIds])
            knownIds = new Set([...knownIds, ...newIds])
            return new Promise((resolve) => {
              setTimeout(() => getBody(fandomUrl, params, p + 1).then(resolve), delay)
            })
          }
          return Promise.resolve()
        })
      : Promise.resolve()

  let combinaisons = []

  config.languages.forEach((lng) =>
    config.fandoms.forEach((fdm) => {
      combinaisons = [...combinaisons, { lan: lng, fandomUrl: fdm }]
    })
  )

  const recursif = () => {
    const combinaison = combinaisons.shift()
    if (combinaison) console.log('AO3::combinaison =>', combinaison)
    return combinaison
      ? getBody(combinaison.fandomUrl, { ...config.params, lan: combinaison.lan }).then(recursif)
      : Promise.resolve()
  }

  return recursif().then(() =>
    newIds.size === 0 ? Promise.resolve() : writeUrls(current, [...newIds])
  )
}

export default process
