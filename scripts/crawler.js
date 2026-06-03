import { ingest } from './ingest.js';

const searchUrl = 'https://news.google.com/rss/search?q=AI+copyright+technology&hl=en-US&gl=US&ceid=US:en';

async function fetchRss() {
  console.log(`Fetching RSS feed from: ${searchUrl}...`);
  try {
    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS: ${response.status} ${response.statusText}`);
    }
    const xml = await response.text();
    console.log("Successfully fetched RSS content.");

    // Extract items using regex
    const items = [];
    const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
    
    for (const match of itemMatches) {
      const itemXml = match[1];
      const title = (itemXml.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "";
      const link = (itemXml.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || "";
      const pubDate = (itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || "";
      const description = (itemXml.match(/<description>([\s\S]*?)<\/description>/) || [])[1] || "";
      
      const clean = (str) => {
        // Strip CDATA tags
        let s = str.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
        // Decode common XML entities
        s = s.replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/&apos;/g, "'");
        // Strip HTML tags for clean text description
        s = s.replace(/<[^>]*>/g, '');
        return s.trim();
      };

      items.push({
        title: clean(title),
        link: clean(link),
        pubDate: clean(pubDate),
        description: clean(description)
      });
    }

    console.log(`Parsed ${items.length} news items.`);
    
    // Select top 5 latest items
    const topItems = items.slice(0, 5);
    if (topItems.length === 0) {
      console.log("No news items found.");
      return;
    }

    let markdownContent = "### Real-time RSS News Feed Ingestion\n\n";
    topItems.forEach((item, index) => {
      markdownContent += `**Headline ${index + 1}:** ${item.title}\n`;
      markdownContent += `*   **Link:** ${item.link}\n`;
      markdownContent += `*   **Published:** ${item.pubDate}\n`;
      markdownContent += `*   **Description:** ${item.description}\n\n`;
    });

    const logPath = ingest('news', 'RSS Live Crawler', markdownContent);
    console.log(`Live news crawled and logged to: ${logPath}`);
  } catch (err) {
    console.error("Error running RSS crawler:", err);
    process.exit(1);
  }
}

fetchRss();
