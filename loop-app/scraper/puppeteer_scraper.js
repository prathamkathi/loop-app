const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config();

const HANDLES = [
  "ankahi_iitd", "axlr8r.formula.racing", "bhmiitd", "brcaiitd", "bsa.iitd",
  "bsp.iitdelhi", "bsw_iitd", "caic_iitd", "debsoc_iitd", "designclubiitd",
  "edc_iitd", "enactus_iitdelhi", "envogueiitd", "facc.azure.iitd",
  "hindisamiti.iitd", "humans_of_bloodconnect", "igem_iitd", "iitdaa",
  "iitddanceclub", "iitdelhi", "iitdmusicclub", "iitdonair", "iitdqc",
  "kaizen.iitd", "litclub.iitd", "literati.iitd", "nssiitd", "ocs_iitd",
  "outreach_iitd", "pac_iitd", "pfciitd", "rendezvous.iitd", "sac_iitdelhi",
  "speranza.iitd", "spicmacay_iitd", "sportech.iitd", "tryst.iitd",
  "uzyre.iitd", "vdefyn.iitd"
];

// For quick testing, let's just do 3 handles first if the user wants it fast, but we'll do all if possible.
// Wait, doing 39 handles might take time, but the user said "do it fast". 
// I'll run the first 5 to show it works, and let the rest run in the background.

const OUTPUT_DIR = path.join(__dirname, 'stock');
const IMAGES_DIR = path.join(OUTPUT_DIR, 'images');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function scrapeInstagram() {
  console.log("Starting Puppeteer...");
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Set headers to appear more like a real user
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36');
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9'
  });

  const scrapedData = [];
  
  for (const handle of HANDLES) {
    console.log(`\nVisiting @${handle}...`);
    try {
      await page.goto(`https://www.instagram.com/${handle}/`, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 3000));
      
      // Extract post links
      const posts = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href^="/p/"]'));
        return links.slice(0, 2).map(a => a.href); // Get top 2 posts
      });
      
      if (posts.length === 0) {
        console.log(`No posts found for @${handle}`);
        continue;
      }
      
      console.log(`Found ${posts.length} posts for @${handle}`);
      
      for (let i = 0; i < posts.length; i++) {
        const postUrl = posts[i];
        console.log(`  -> Scraping ${postUrl}`);
        
        await page.goto(postUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise(r => setTimeout(r, 2000));
        
        const postData = await page.evaluate(() => {
          // Try to find the image
          const img = document.querySelector('article img[style*="object-fit: cover"]');
          const imgUrl = img ? img.src : null;
          
          // Try to find the caption
          const h1 = document.querySelector('h1');
          const caption = h1 ? h1.innerText : '';
          
          return { imgUrl, caption };
        });
        
        if (postData.imgUrl) {
          const postId = postUrl.split('/p/')[1].replace('/', '');
          const imgName = `${handle}_${postId}.jpg`;
          const imgPath = path.join(IMAGES_DIR, imgName);
          
          await downloadImage(postData.imgUrl, imgPath);
          console.log(`    Downloaded image: ${imgName}`);
          
          scrapedData.push({
            host: `@${handle}`,
            postUrl: postUrl,
            imagePath: imgPath,
            caption: postData.caption
          });
          
          fs.writeFileSync(path.join(OUTPUT_DIR, 'raw_scraped.json'), JSON.stringify(scrapedData, null, 2));
        } else {
          console.log(`    No image found for this post (might be a video).`);
        }
        
        await new Promise(r => setTimeout(r, 2000)); // Delay between posts
      }
      
    } catch (e) {
      console.log(`Error on @${handle}: ${e.message}`);
    }
    
    await new Promise(r => setTimeout(r, 4000)); // Delay between handles
  }
  
  await browser.close();
  console.log("Scraping completed!");
}

scrapeInstagram();
