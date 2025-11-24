import { NextResponse } from 'next/server';
import { scrapePostContent } from '@/lib/naver-scraper';
import { analyzeContent } from '@/lib/ai-service';

export async function POST(request: Request) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const paragraphs = await scrapePostContent(url);
        if (!paragraphs || paragraphs.length === 0) {
            return NextResponse.json({ error: 'Failed to scrape content' }, { status: 500 });
        }

        const analysis = await analyzeContent(paragraphs);
        return NextResponse.json(analysis);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
