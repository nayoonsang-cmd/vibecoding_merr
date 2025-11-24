'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Play, Square, Send } from 'lucide-react';

interface Post {
    title: string;
    link: string;
    pubDate: string;
    contentSnippet: string;
}

export default function Home() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [analyzing, setAnalyzing] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<any | null>(null);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/feed');
            const data = await res.json();
            setPosts(data.posts);
        } catch (error) {
            console.error('Failed to fetch posts', error);
        } finally {
            setLoading(false);
        }
    };

    const controlScheduler = async (action: 'start' | 'stop' | 'run') => {
        setStatus(`Executing ${action}...`);
        try {
            const res = await fetch(`/api/cron?action=${action}`);
            const data = await res.json();
            setStatus(data.status || 'Done');
        } catch (error) {
            setStatus('Error executing command');
        }
    };

    const analyzePost = async (link: string) => {
        setAnalyzing(link);
        setAnalysisResult(null);
        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: link }),
            });
            const data = await res.json();
            setAnalysisResult(data);
        } catch (error) {
            console.error('Analysis failed', error);
        } finally {
            setAnalyzing(null);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <main className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Naver Blog AI Digest</h1>
                        <p className="text-gray-500">Monitoring: ranto28</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => controlScheduler('start')}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                        >
                            <Play size={16} /> Start Scheduler
                        </button>
                        <button
                            onClick={() => controlScheduler('stop')}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                        >
                            <Square size={16} /> Stop
                        </button>
                        <button
                            onClick={() => controlScheduler('run')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                            <Send size={16} /> Trigger Now
                        </button>
                    </div>
                </header>

                {status && (
                    <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                        Status: {status}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <section className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-800">Latest Posts</h2>
                            <button
                                onClick={fetchPosts}
                                disabled={loading}
                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition"
                            >
                                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                            </button>
                        </div>

                        <div className="divide-y divide-gray-100 max-h-[80vh] overflow-y-auto">
                            {posts.map((post, idx) => (
                                <div key={idx} className="p-6 hover:bg-gray-50 transition">
                                    <div className="mb-2">
                                        <h3 className="text-lg font-medium text-gray-900 leading-tight mb-1">
                                            <a href={post.link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                                                {post.title}
                                            </a>
                                        </h3>
                                        <span className="text-xs text-gray-400">
                                            {new Date(post.pubDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                        {post.contentSnippet}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => analyzePost(post.link)}
                                            disabled={analyzing === post.link}
                                            className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1 px-3 py-1 bg-purple-50 rounded-full transition"
                                        >
                                            {analyzing === post.link ? 'Analyzing...' : '✨ AI Explain'}
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {posts.length === 0 && !loading && (
                                <div className="p-8 text-center text-gray-500">
                                    No posts found.
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="lg:col-span-2">
                        {analysisResult ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                                <div className="mb-8 border-b pb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Analysis Result</h2>
                                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                                        <h4 className="text-sm font-bold text-purple-900 uppercase tracking-wider mb-2">Summary</h4>
                                        <p className="text-purple-800 leading-relaxed">{analysisResult.summary}</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {analysisResult.paragraphs.map((para: any, i: number) => (
                                        <div key={i} className="relative group">
                                            <p className="text-gray-800 text-lg leading-relaxed mb-4 font-serif whitespace-pre-line">{para.original}</p>

                                            {para.explanation && (
                                                <div className="ml-6 pl-4 border-l-4 border-indigo-400 bg-indigo-50 p-5 rounded-r-lg text-indigo-900 my-4 animate-in fade-in slide-in-from-left-2 shadow-sm">
                                                    <div className="flex items-center gap-2 mb-2 text-indigo-800 font-bold uppercase text-xs tracking-wide">
                                                        <span className="flex items-center gap-1">🎓 AI 해설</span>
                                                    </div>
                                                    <p className="text-sm leading-relaxed font-medium text-gray-800">{para.explanation.replace('AI 해설: ', '')}</p>
                                                    {para.keywords && (
                                                        <div className="mt-3 pt-3 border-t border-indigo-100">
                                                            {para.keywords.map((kw: any, k: number) => (
                                                                <div key={k} className="mb-1 last:mb-0">
                                                                    <span className="font-bold text-indigo-700 text-xs">{kw.term}</span>
                                                                    <span className="text-indigo-600 text-xs mx-1">:</span>
                                                                    <span className="text-gray-600 text-xs">{kw.explanation}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-xl border border-gray-200 p-12 text-center text-gray-400 border-dashed h-full flex flex-col justify-center items-center">
                                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                                    <Send size={32} className="text-gray-300" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-600 mb-2">Select a post to analyze</h3>
                                <p className="max-w-md mx-auto">Click the "✨ AI Explain" button on any post from the list to see the full content with AI-powered explanations.</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}
