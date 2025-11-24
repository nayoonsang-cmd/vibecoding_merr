import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { fetchRSS, scrapePostContent } from './naver-scraper';
import { analyzeContent } from './ai-service';
import { sendDigestEmail } from './email-service';

// Store the task to be able to stop/start it
let task: ReturnType<typeof cron.schedule> | null = null;

const BLOG_RSS_URL = 'https://rss.blog.naver.com/ranto28.xml';
const TARGET_EMAIL = process.env.TARGET_EMAIL || 'user@example.com';
const DATA_FILE = path.join(process.cwd(), 'last_checked.json');

// Load last checked date from file
let lastCheckedDate = new Date(0);
try {
    if (fs.existsSync(DATA_FILE)) {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        if (data.lastChecked) {
            lastCheckedDate = new Date(data.lastChecked);
            console.log(`Loaded last checked date: ${lastCheckedDate.toISOString()}`);
        }
    }
} catch (error) {
    console.error('Failed to load last checked date:', error);
}

function saveLastCheckedDate(date: Date) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify({ lastChecked: date.toISOString() }));
        console.log(`Saved last checked date: ${date.toISOString()}`);
    } catch (error) {
        console.error('Failed to save last checked date:', error);
    }
}

export function startScheduler() {
    if (task) {
        console.log('Scheduler already running.');
        return;
    }

    // Schedule to run every day at 10:00 AM
    task = cron.schedule('0 10 * * *', async () => {
        console.log('Running daily check...');
        await runDailyCheck();
    });

    console.log('Scheduler started: 0 10 * * *');
}

export function stopScheduler() {
    if (task) {
        task.stop();
        task = null;
        console.log('Scheduler stopped.');
    }
}

export async function runDailyCheck() {
    console.log('Fetching RSS feed...');
    const posts = await fetchRSS(BLOG_RSS_URL);

    const newPosts = posts.filter(p => {
        const pubDate = new Date(p.pubDate);
        return pubDate > lastCheckedDate;
    });

    if (newPosts.length === 0) {
        console.log('No new posts found.');
        return;
    }

    console.log(`Found ${newPosts.length} new posts.`);

    // Update last checked date immediately to the latest post's date
    // to avoid re-processing if something fails mid-way (or update at the end, depending on preference)
    // Updating at the end is safer to ensure we don't miss posts if the process crashes.
    // However, for this v1, let's update it if we successfully process at least one.

    const latestPostDate = new Date(newPosts[0].pubDate);

    const analyzedPosts = [];

    // Process up to 3 new posts to handle multiple posts uploaded within 24 hours
    // This balances between catching all recent posts and managing API costs
    const postsToProcess = newPosts.slice(0, 3);

    for (const post of postsToProcess) {
        console.log(`Processing: ${post.title}`);
        const paragraphs = await scrapePostContent(post.link);
        if (paragraphs && paragraphs.length > 0) {
            const analysis = await analyzeContent(paragraphs);
            analyzedPosts.push({ post, analysis });
        }
    }

    if (analyzedPosts.length > 0) {
        console.log('Sending email digest...');
        await sendDigestEmail(TARGET_EMAIL, analyzedPosts);

        // Update and save last checked date only after successful email
        lastCheckedDate = latestPostDate;
        saveLastCheckedDate(lastCheckedDate);
    }
}
