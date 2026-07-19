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
  console.log("Crawling useorigin.com for Markdown content...");
  const crawl = await client.web.webCrawlMd({
    url: 'https://useorigin.com',
    maxPages: 1, 
    stopAfterMs: 30000,
  });
  
  if (crawl.results.length > 0) {
    const md = crawl.results[0].markdown;
    fs.writeFileSync('scripts/useorigin_markdown.md', md);
    console.log("Successfully wrote useorigin_markdown.md!");
  } else {
    console.log("No pages crawled");
  }
} catch (error) {
  console.error("Failed to crawl:", error);
}
