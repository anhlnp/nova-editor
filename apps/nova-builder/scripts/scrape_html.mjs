import ContextDev from 'context.dev';
import fs from 'fs';

const apiKey = process.env.CONTEXT_DEV_API_KEY;
if (!apiKey) {
  console.error("Error: CONTEXT_DEV_API_KEY is not defined in process.env.");
  process.exit(1);
}

const client = new ContextDev({
  apiKey: apiKey,
});

try {
  console.log("Scraping HTML of useorigin.com...");
  const scrapeResult = await client.web.webScrapeHTML({
    url: 'https://useorigin.com',
  });
  
  if (scrapeResult && scrapeResult.html) {
    console.log("HTML length:", scrapeResult.html.length);
    fs.writeFileSync('scripts/useorigin.html', scrapeResult.html);
    console.log("Successfully wrote HTML to scripts/useorigin.html!");

    // Search for images and videos in the scraped HTML
    const htmlContent = scrapeResult.html;
    
    // Find img srcs
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
    const imgUrls = [];
    let match;
    while ((match = imgRegex.exec(htmlContent)) !== null) {
      imgUrls.push(match[1]);
    }

    // Find video src or source src
    const videoRegex = /<video[^>]*>[\s\S]*?<\/video>/g;
    const srcRegex = /src=["']([^"']+)["']/g;
    const videoUrls = [];
    let videoMatch;
    while ((videoMatch = videoRegex.exec(htmlContent)) !== null) {
      const videoBlock = videoMatch[0];
      let srcMatch;
      while ((srcMatch = srcRegex.exec(videoBlock)) !== null) {
        videoUrls.push(srcMatch[1]);
      }
    }

    // Find generic sources (like in <source src="...">)
    const sourceRegex = /<source[^>]+src=["']([^"']+)["']/g;
    while ((match = sourceRegex.exec(htmlContent)) !== null) {
      videoUrls.push(match[1]);
    }

    console.log("\n--- IMAGES DISCOVERED ---");
    console.log(JSON.stringify([...new Set(imgUrls)], null, 2));

    console.log("\n--- VIDEOS DISCOVERED ---");
    console.log(JSON.stringify([...new Set(videoUrls)], null, 2));

    // Also write resources list to a JSON file
    fs.writeFileSync('scripts/useorigin_assets.json', JSON.stringify({
      images: [...new Set(imgUrls)],
      videos: [...new Set(videoUrls)]
    }, null, 2));
    console.log("Saved assets to scripts/useorigin_assets.json");

  } else {
    console.log("Failed to scrape HTML: no content returned");
  }
} catch (error) {
  console.error("Failed to scrape:", error);
}
