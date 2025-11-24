import { NextResponse } from 'next/server';
import { runDailyCheck, startScheduler, stopScheduler } from '@/lib/scheduler';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'start') {
        startScheduler();
        return NextResponse.json({ status: 'Scheduler started' });
    } else if (action === 'stop') {
        stopScheduler();
        return NextResponse.json({ status: 'Scheduler stopped' });
    } else if (action === 'run') {
        // Run immediately
        await runDailyCheck(); // Run in background
        return NextResponse.json({ status: 'Manual check triggered' });
    }

    return NextResponse.json({ error: 'Invalid action. Use ?action=start|stop|run' }, { status: 400 });
}
