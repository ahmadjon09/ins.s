const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const puppeteer = require('puppeteer')

const app = express()
app.use(bodyParser.json())
app.use(cors()) // CORS muammosini hal qilish uchun

// Like bosish endpointi
app.post('/like', async (req, res) => {
  const { username, password, postUrl } = req.body

  try {
    // Puppeteer browserni ishga tushiramiz
    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage()

    // Instagram'ga kirish
    await page.goto('https://www.instagram.com/accounts/login/')
    await page.waitForSelector('input[name="username"]', { visible: true })
    await page.type('input[name="username"]', username, { delay: 50 })
    await page.type('input[name="password"]', password, { delay: 50 })
    await page.click('button[type="submit"]')
    await page.waitForNavigation()

    // Postga o'tish va like bosish
    await page.goto(postUrl, { waitUntil: 'networkidle2' })
    await page.waitForSelector('svg[aria-label="Like"]', { visible: true })
    await page.click('svg[aria-label="Like"]')

    await browser.close()
    res.json({ message: 'Post liked successfully!' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error liking the post', error })
  }
})

app.listen(5000, () => console.log('Backend running at http://localhost:5000'))
