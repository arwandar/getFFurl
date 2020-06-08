import fs from 'fs'

import Axios from 'axios'
import qs from 'query-string'

const baseUrl = 'https://archiveofourown.org/works'
const max = undefined
const delay = 1000

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
          .filter((url) => url.includes('archiveofourown.org'))
          .map((url) => url.replace(`${baseUrl}/`, '')),
      ]
  })

  return new Set(ids)
}

const writeUrls = (path, ids) =>
  new Promise((resolve, reject) =>
    fs.appendFile(`urls/${path}`, ids.map((id) => `${baseUrl}/${id}`).join('\n'), (err) =>
      err
        ? reject()
        : fs.appendFile(`urls/${path}`, '\n', (errBis) => (errBis ? reject() : resolve()))
    )
  )

const regex = /href="\/works\/(\d*)"/

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

  const getBody = (params, page = 1) =>
    !max || page < max
      ? Axios.get(`${baseUrl}?${qs.stringify({ ...params, page })}`).then(({ data }) => {
          console.log('AO3::page =>', page)
          const res = processBody(data, knownIds)

          if (res) {
            newIds = new Set([...res, ...newIds])
            knownIds = new Set([...knownIds, ...newIds])
            return new Promise((resolve) => {
              setTimeout(() => getBody(params, page + 1).then(resolve), delay)
            })
          }

          return Promise.resolve()
        })
      : Promise.resolve()

  let combinaisons = []

  config.languages.forEach((lng) =>
    config.fandoms.forEach((fdm) => {
      combinaisons = [...combinaisons, { 'work_search[language_id]': lng, tag_id: fdm }]
    })
  )

  const recursif = () => {
    const combinaison = combinaisons.shift()
    if (combinaison) console.log('AO3::combinaison =>', combinaison)
    return combinaison
      ? getBody({ ...config.params, ...combinaison }).then(recursif)
      : Promise.resolve()
  }

  return recursif().then(() =>
    newIds.size === 0 ? Promise.resolve() : writeUrls(current, [...newIds])
  )
}

export default process
