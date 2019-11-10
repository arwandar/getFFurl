import fs from 'fs'

import Axios from 'axios'

const baseUrl = `https://archiveofourown.org/works?utf8=%E2%9C%93&work_search%5Bsort_column%5D=revised_at&work_search%5Bother_tag_names%5D=&exclude_work_search%5Brating_ids%5D%5B%5D=10&exclude_work_search%5Brating_ids%5D%5B%5D=11&exclude_work_search%5Bcategory_ids%5D%5B%5D=116&exclude_work_search%5Bfreeform_ids%5D%5B%5D=1220805&work_search%5Bexcluded_tag_names%5D=&work_search%5Bcrossover%5D=F&work_search%5Bcomplete%5D=T&work_search%5Bwords_from%5D=&work_search%5Bwords_to%5D=&work_search%5Bdate_from%5D=&work_search%5Bdate_to%5D=&work_search%5Bquery%5D=&work_search%5Blanguage_id%5D=en&commit=Sort+and+Filter&tag_id=Bilbo+Baggins*s*Thorin+Oakenshield&page=`

const writeUrls = (urlsArray) =>
  fs.appendFile('url.txt', `${urlsArray.join('\n')}\n`, (err) => {
    if (err) throw err
    console.log('The "data to append" was appended to file!')
  })

const processBody = (data) => {
  const urls = data.match(/href="\/works\/(\d)*"/g)
  console.log('Pixelle::index.js::15::urls =>', urls)
  if (!urls) return false

  writeUrls(
    urls.map((string) => `https://archiveofourown.org${string.substring(6, string.length - 1)}`)
  )
  return true
}

const getBody = (page) =>
  Axios.get(`${baseUrl}${page}`).then(({ data }) => {
    const res = processBody(data)
    if (res) getBody(page + 1)
  })

getBody(1)
