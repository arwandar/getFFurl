import fs from 'fs'

import qs from 'query-string'

let url = ''
try {
  url = fs.readFileSync('url_to_parse.txt', 'utf8').trim()
} catch (err) {
  // do nothing
}

const parse = qs.parse(url.match(/.*\?(.*)/)[1])

const res = {
  current: 'TODO',
  previous: 'TODO',
}

if (url.includes('archiveofourown.org'))
  res.ao3 = {
    languages: [parse['work_search[language_id]']],
    fandoms: [parse.tag_id],
    params: Object.keys(parse).reduce(
      (obj, key) =>
        ['tag_id', 'work_search[language_id]'].includes(key) ? obj : { ...obj, [key]: parse[key] },
      {}
    ),
  }

if (url.includes('fanfiction.net')) {
  const fandom = url.match(/fanfiction.net\/(.*\/.*)\/\?/)

  res.ffnet = {
    languages: [parse.lan],
    fandoms: [fandom[1]],
    params: Object.keys(parse).reduce(
      (obj, key) => (['lan'].includes(key) ? obj : { ...obj, [key]: parse[key] }),
      {}
    ),
  }
}

fs.writeFileSync(`src/usualConfigs/unnamed.js`, `export default ${JSON.stringify(res)}`)
