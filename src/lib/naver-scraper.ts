import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import axios from 'axios';

const parser = new Parser();

export interface BlogPost {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet?: string;
  content?: string;
  guid?: string;
}

export async function fetchRSS(feedUrl: string): Promise<BlogPost[]> {
  try {
    const feed = await parser.parseURL(feedUrl);
    return feed.items.map(item => ({
      title: item.title || '',
      link: item.link || '',
      pubDate: item.pubDate || '',
      contentSnippet: item.contentSnippet || '',
      guid: item.guid || item.link,
    }));
  } catch (error) {
    console.error('Error fetching RSS:', error);
    return [];
  }
}

export async function scrapePostContent(url: string): Promise<string[]> {
  try {
    // Naver blogs often use iframes. We need to handle that.
    // First, fetch the main page.
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const $ = cheerio.load(response.data);

    // Check for iframe with id 'mainFrame'
    const iframeSrc = $('#mainFrame').attr('src');

    let finalUrl = url;
    if (iframeSrc) {
      // Construct the real URL
      if (iframeSrc.startsWith('http')) {
        finalUrl = iframeSrc;
      } else {
        const urlObj = new URL(url);
        finalUrl = `${urlObj.protocol}//${urlObj.host}${iframeSrc}`;
      }

      // Fetch the iframe content
      const iframeResponse = await axios.get(finalUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const $iframe = cheerio.load(iframeResponse.data);

      // Extract content from the main container. 
      // Naver Smart Editor 2.0 uses #postViewArea, 3.0/One uses .se-main-container
      // We want to split by paragraphs or meaningful blocks.

      const paragraphs: string[] = [];

      // Try Smart Editor One/3.0 selectors first (more common now)
      const seMain = $iframe('.se-main-container');
      if (seMain.length > 0) {
        // Extract text from text modules
        seMain.find('.se-text-paragraph, .se-component-content, .se-section-text').each((_, el) => {
          // Replace <br> with newlines to preserve formatting
          $iframe(el).find('br').replaceWith('\n');
          const text = $iframe(el).text().trim();
          if (text.length > 0) {
            paragraphs.push(text);
          }
        });
      } else {
        // Fallback for older editors (Smart Editor 2.0)
        const postView = $iframe('#postViewArea');
        if (postView.length > 0) {
          // Try to split by <p> or <br>
          postView.find('p').each((_, el) => {
            $iframe(el).find('br').replaceWith('\n');
            const text = $iframe(el).text().trim();
            if (text.length > 0) paragraphs.push(text);
          });

          // If no p tags found (sometimes just br separated), just get full text and split by newline
          if (paragraphs.length === 0) {
            postView.find('br').replaceWith('\n');
            const fullText = postView.text();
            fullText.split('\n').forEach(line => {
              if (line.trim().length > 0) paragraphs.push(line.trim());
            });
          }
        }
      }

      return paragraphs;
    } else {
      // No iframe (rare for Naver Blog, but possible for mobile views etc)
      // Simplified fallback
      const content = $('.se-main-container').text() || $('#postViewArea').text();
      return content.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    }
  } catch (error) {
    console.error('Error scraping post:', error);
    return [];
  }
}
