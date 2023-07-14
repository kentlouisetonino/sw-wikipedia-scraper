import axios from 'axios'
import * as Cheerio from 'cheerio'
import * as fs from 'fs'
import { Parser } from 'json2csv'
import message from './libs/message'
import { SisterProject } from './libs/types'


async function getWikipediaSisterProjects() {
  const wikiPediaURL = 'https://en.wikipedia.org/wiki/Main_Page/'
  const sisterProjects: SisterProject[] = []

  try {
    const response = await axios.get(wikiPediaURL)
    const $ = Cheerio.load(response.data)
    const relatedProjectsData = $('#sister-projects-list li')

    relatedProjectsData.each(function () {
      const imageSrc = $(this).find('img').attr('src')
      const title = $(this).find('.extiw').text()
      const projectLink = $(this).find('.extiw').attr('href')

      const description = $(this)
        .find('div:eq(1)')
        .contents()
        .filter(function () {
          return this.nodeType === 3
        })
        .text()

      sisterProjects.push({
        imageSrc: imageSrc,
        title: title,
        projectLink: projectLink,
        description: description,
      })
    })

    // Instantiate parser.
    const parser = new Parser()

    // Parse JSON or object data to CSV.
    const csv = parser.parse(sisterProjects)

    // Add or update file.
    fs.writeFileSync('./src/files/sister-projects.csv', csv)

    await message({
      isError: false,
      message: 'Successfully saving data. Please check the files directory.',
    })
  } catch (error: unknown) {
    if (error instanceof Error) {
      await message({
        isError: true,
        message: `Something\'s wrong. ${error.message}`,
      })
    }
  }
}

await getWikipediaSisterProjects()
