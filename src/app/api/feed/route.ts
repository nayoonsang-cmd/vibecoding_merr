import { NextResponse } from 'next/server';
import { fetchRSS } from '@/lib/naver-scraper';

export async function GET() {
    const feedUrl = 'https://rss.blog.naver.com/ranto28.xml';
    const posts = await fetchRSS(feedUrl);
    return NextResponse.json({ posts });
}
