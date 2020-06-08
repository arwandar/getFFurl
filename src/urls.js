import fs from 'fs'

import processAo3 from './processAo3'
import processFfnet from './processFfnet'
import * as fandoms from './usualConfigs'

if (!fandoms[process.argv[2]]) process.exit()

const fandom = fandoms[process.argv[2]]
console.log('Pixelle::urls.js::8::fandom =>', fandom)

if (fandom.previous) {
  const getUrls = (path) => {
    try {
      return fs
        .readFileSync(`urls/${path}`, 'utf8')
        .split('\n')
        .filter((url) => url)
    } catch (err) {
      return []
    }
  }

  const urls = [...getUrls(fandom.current), ...getUrls(fandom.previous)]
  fs.writeFileSync(`urls/${fandom.previous}`, [...new Set(urls)].join('\n'))
}

fs.writeFileSync(`urls/${fandom.current}`, '')

processAo3(fandom.ao3, fandom.current, fandom.previous)
  .finally(() => processFfnet(fandom.ffnet, fandom.current, fandom.previous))
  .finally(() => process.exit())
