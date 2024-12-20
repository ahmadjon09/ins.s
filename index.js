const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors()); // CORS muammosini hal qilish uchun

// Foydalanuvchi bergan URL ga kirish va Google qidiruvini amalga oshirish
app.post('/open-url', async (req, res) => {
  const { url } = req.body;

  try {
    // Puppeteer browserni ishga tushiramiz (headless: true bo'lsa brauzer ko'rsatilmaydi)
    const browser = await puppeteer.launch({
      headless: false, // Ekran ko'rsatiladi
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // Ba'zan serverda kerakli argumentlar
    });

    const page = await browser.newPage();
    // Brauzer o'lchamini normal qilish (kichik ekran yoki odatiy o'lcham)
    await page.setViewport({ width: 1280, height: 800 });

    // Google'ga o'tish
    await page.goto('https://www.google.com', { waitUntil: 'load' });

    // Qidiruv maydonini kutish va URLni qidiruvga yozish
    await page.waitForSelector('textarea[name="q"]', { visible: true, timeout: 5000 }); // 5 sekund kutish

    // Qidiruv maydoniga URLni yozish
    await page.type('textarea[name="q"]', url, { delay: 50 });

    // Qidiruvni boshlash
    await page.keyboard.press('Enter');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Birinchi natijaga o'tish
    await page.waitForSelector('h3', { visible: true }); // Qidiruv natijalarini kutish
    const firstResult = await page.$('h3'); // Birinchi natijani tanlash
    await firstResult.click(); // Birinchi natijaga kirish

    // Brauzerni yopmaslik, foydalanuvchi uchun ochiq qoladi
    // await browser.close(); // Brauzerni yopingan holda qoldirmadik

    // Yaxshi javob qaytarish
    res.json({ message: 'URL opened and first result opened successfully!' });
  } catch (error) {
    console.error('Error during URL open and search:', error);
    res.status(500).json({ message: 'Error opening URL', error: error.message });
  }
});

app.listen(5000, () => console.log('Backend running at http://localhost:5000'));
