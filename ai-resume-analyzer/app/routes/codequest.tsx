import React, { useState } from 'react';
// ❌ REMOVED: No more Monaco Editor imports
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import dracula from 'react-syntax-highlighter/dist/esm/styles/prism/dracula';
import { Link } from 'react-router';
import { ArrowLeft, Loader2, Play, CheckCircle, Trophy, RefreshCcw } from 'lucide-react';

export default function CodeQuestPage() {
    const [step, setStep] = useState<'setup' | 'test' | 'results'>('setup');
    const [config, setConfig] = useState({ language: 'javascript', count: 5 });
    const [currentIdx, setCurrentIdx] = useState(1);
    const [code, setCode] = useState("");
    const [review, setReview] = useState("");
    const [loading, setLoading] = useState(false);
    const [scores, setScores] = useState<number[]>([]);

    // --- 1. GENERATE QUESTION ---
    const generateQuestion = async () => {
        setLoading(true);
        setReview("### ⚡ Generating your challenge...");
        try {
            const prompt = `GENERATE_QUESTION: Random ${config.language} challenge.`;
            // Pointing to Port 5000 (Your Backend)
            const response = await axios.post('http://localhost:5000/api/ai/get-review', { code: prompt });
            setReview(response.data.result);
            setCode(`// Write your ${config.language} solution here...\n\n`);
        } catch (err) {
            setReview("### ❌ Error\nFailed to sync with AI. Ensure Backend is running on Port 5000.");
        } finally {
            setLoading(false);
        }
    };

    // --- 2. SUBMIT & REVIEW ---
    const handleReview = async () => {
        setLoading(true);
        setReview("### 🧐 Reviewing your solution...");
        try {
            const response = await axios.post('http://localhost:5000/api/ai/get-review', {
                code: `USER_SOLUTION for ${config.language}:\n${code}`
            });
            const aiText = response.data.result;
            setReview(aiText);

            // Extract numerical score from AI text (e.g., "Score: 85/100")
            const match = aiText.match(/(\d{1,3})\/100/);
            if (match) {
                const newScores = [...scores];
                newScores[currentIdx - 1] = parseInt(match[1]);
                setScores(newScores);
            }
        } catch (err) {
            setReview("### ❌ Review Failed\nRate limit or network error.");
        } finally {
            setLoading(false);
        }
    };

    // --- RESULTS SCREEN ---
    if (step === 'results') {
        const finalScore = scores.reduce((a, b) => a + (b || 0), 0);
        const average = Math.round(finalScore / config.count);

        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white font-sans">
                <div className="w-full max-w-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-10 rounded-3xl shadow-2xl text-center animate-in fade-in zoom-in duration-500">
                    <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
                    <h1 className="text-5xl font-black text-emerald-500 mb-2 tracking-tighter">QUEST COMPLETE</h1>
                    <p className="text-slate-400 mb-8 font-bold tracking-widest uppercase">Performance Summary</p>

                    <div className="text-7xl font-black mb-10 text-white">{average}%</div>

                    <div className="space-y-3 mb-10 text-left max-h-60 overflow-y-auto custom-scrollbar pr-2">
                        {scores.map((s, i) => (
                            <div key={i} className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
                                <span className="text-slate-500 font-bold uppercase text-xs tracking-widest">Challenge {i + 1}</span>
                                <span className={`font-black ${s >= 70 ? 'text-emerald-400' : s >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                                    {s || 0} / 100
                                </span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => { setStep('setup'); setScores([]); setCurrentIdx(1); }}
                        className="w-full bg-emerald-600 text-white font-black py-4 rounded-xl hover:bg-emerald-500 transition-all uppercase flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/20"
                    >
                        <RefreshCcw size={20} /> Start New Session
                    </button>

                    <Link to="/home" className="block mt-4 text-slate-500 hover:text-white text-sm font-bold">
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    // --- SETUP SCREEN ---
    if (step === 'setup') {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 font-sans relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.05] pointer-events-none" />
                <div className="absolute top-6 left-6 z-10">
                    <Link to="/home" className="text-slate-400 hover:text-white flex items-center gap-2 font-bold"><ArrowLeft size={20} /> Dashboard</Link>
                </div>

                <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">CodeQuest</h1>
                        <p className="text-slate-400">Configure your training session</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Programming Language</label>
                            <select className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-4 rounded-xl outline-none focus:border-emerald-500 transition-colors"
                                    value={config.language} onChange={(e) => setConfig({ ...config, language: e.target.value })}>
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                                <option value="cpp">C++</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Number of Challenges</label>
                            <input type="number" min="1" max="10"
                                   className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-4 rounded-xl outline-none focus:border-emerald-500 transition-colors"
                                   value={config.count} onChange={(e) => setConfig({ ...config, count: Number(e.target.value) })} />
                        </div>
                        <button onClick={() => { setStep('test'); generateQuestion(); }}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-2">
                            <Play size={20} fill="currentColor" /> INITIALIZE TEST
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- MAIN WORKSPACE (TEST) ---
    return (
        <div className="h-screen bg-[#020617] flex flex-col text-slate-200 overflow-hidden font-sans">
            <header className="px-8 py-4 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <Link to="/home"><ArrowLeft className="text-slate-500 hover:text-white transition-colors" /></Link>
                    <h2 className="text-2xl font-black text-emerald-500 tracking-tighter hidden sm:block">CodeQuest</h2>
                    <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>
                    <div className="flex gap-4 text-xs font-bold uppercase tracking-widest items-center">
                        <span className="text-slate-500">Progress</span>
                        <span className="text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                            {currentIdx} / {config.count}
                        </span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={handleReview} disabled={loading}
                            className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 px-6 py-2 rounded-lg font-bold hover:bg-emerald-500 hover:text-slate-950 transition-all disabled:opacity-30 flex items-center gap-2">
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                        {loading ? "ANALYZING..." : "SUBMIT SOLUTION"}
                    </button>
                    <button
                        onClick={() => {
                            if (currentIdx < config.count) {
                                setCurrentIdx(c => c + 1);
                                generateQuestion();
                            } else {
                                setStep('results');
                            }
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg font-bold transition-all border border-slate-700"
                    >
                        {currentIdx === config.count ? "FINISH" : "NEXT"}
                    </button>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden p-6 gap-6 flex-col md:flex-row">

                {/* ✅ SIMPLE TEXT AREA INPUT (Instant Load) */}
                <div className="flex-1 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl bg-slate-950 relative group">
                    <div className="absolute top-0 right-0 p-3 z-10 pointer-events-none">
                        <span className="text-xs text-slate-500 font-mono font-bold uppercase bg-slate-900 px-2 py-1 rounded border border-slate-800">{config.language} INPUT</span>
                    </div>

                    <textarea
                        className="w-full h-full bg-slate-950 text-slate-200 font-mono p-6 resize-none outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm leading-relaxed custom-scrollbar placeholder:text-slate-600"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder={`// Write your ${config.language} solution here...`}
                        spellCheck="false"
                        autoCapitalize="off"
                        autoComplete="off"
                    />
                </div>

                {/* AI Review / Question Section */}
                <div className="flex-1 bg-slate-900/30 border border-slate-800 rounded-2xl p-8 overflow-y-auto prose prose-invert prose-emerald max-w-none shadow-inner custom-scrollbar">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}
                                   components={{
                                       code({ node, inline, className, children, ...props }: any) {
                                           const match = /language-(\w+)/.exec(className || '');
                                           return !inline && match ? (
                                               <SyntaxHighlighter style={dracula} language={match[1]} PreTag="div" className="rounded-xl border border-slate-800 my-4" {...props}>
                                                   {String(children).replace(/\n$/, '')}
                                               </SyntaxHighlighter>
                                           ) : <code className="bg-slate-800 text-emerald-400 px-1 py-0.5 rounded font-mono text-sm" {...props}>{children}</code>
                                       }
                                   }}
                    >
                        {review}
                    </ReactMarkdown>
                </div>
            </main>
        </div>
    );
}