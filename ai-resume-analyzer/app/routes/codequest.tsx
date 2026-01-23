import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import axios from 'axios';
// ✅ FIX 1: Import component from the main package (Solves "Missing highlight")
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// ✅ FIX 2: Import style directly from file (Solves "Missing coy")
import dracula from 'react-syntax-highlighter/dist/esm/styles/prism/dracula';
import { Link } from 'react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';

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
            // Ensure port 5000 is correct (your backend)
            const response = await axios.post('http://localhost:5000/api/ai/get-review', { code: prompt });
            setReview(response.data.result);
            setCode(`// Solve the ${config.language} challenge here...`);
        } catch (err) {
            setReview("### ❌ Error\nFailed to sync with AI. Ensure Backend is running on Port 5000.");
        } finally {
            setLoading(false);
        }
    };

    // --- 2. NEW: CODE REVIEW (No Scoring) ---
    const handleCodeReview = async () => {
        setLoading(true);
        setReview("### 🧐 Reviewing your code...");
        try {
            // Sends "CODE_REVIEW" prompt to trigger Mode 3 on backend
            const response = await axios.post('http://localhost:5000/api/ai/get-review', {
                code: `CODE_REVIEW for ${config.language}:\n${code}`
            });
            setReview(response.data.result);
        } catch (err) {
            setReview("### ❌ Review Failed\nServer error or rate limit.");
        } finally {
            setLoading(false);
        }
    };

    // --- 3. SUBMIT & SCORE ---
    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/ai/get-review', {
                code: `USER_SOLUTION for ${config.language}:\n${code}`
            });
            const aiText = response.data.result;
            setReview(aiText);

            // Extract Score
            const match = aiText.match(/(\d{1,3})\/100/);
            if (match) {
                const newScores = [...scores];
                newScores[currentIdx - 1] = parseInt(match[1]);
                setScores(newScores);
            }
        } catch (err) {
            setReview("### ❌ Review Failed\nServer error.");
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
                <div className="w-full max-w-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-10 rounded-3xl shadow-2xl text-center">
                    <h1 className="text-5xl font-black text-emerald-500 mb-2 tracking-tighter">QUEST COMPLETE</h1>
                    <div className="text-7xl font-black mb-10 text-white">{average}%</div>
                    <button
                        onClick={() => { setStep('setup'); setScores([]); setCurrentIdx(1); }}
                        className="w-full bg-emerald-500 text-slate-950 font-black py-4 rounded-xl hover:bg-emerald-400 transition-all uppercase"
                    >
                        Start New Session
                    </button>
                </div>
            </div>
        );
    }

    // --- SETUP SCREEN ---
    if (step === 'setup') {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 font-sans">
                <div className="absolute top-6 left-6">
                    <Link to="/home" className="text-slate-400 hover:text-white flex items-center gap-2"><ArrowLeft size={20}/> Dashboard</Link>
                </div>
                <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-[0_0_50px_-12px_rgba(16,185,129,0.2)]">
                    <h1 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-8">CodeQuest</h1>

                    <div className="space-y-6">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Language</label>
                            <select className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-4 rounded-xl outline-none"
                                    value={config.language} onChange={(e) => setConfig({...config, language: e.target.value})}>
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                                <option value="cpp">C++</option>
                            </select>
                        </div>
                        <button onClick={() => { setStep('test'); generateQuestion(); }}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                            INITIALIZE TEST
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- MAIN WORKSPACE ---
    return (
        <div className="h-screen bg-[#020617] flex flex-col text-slate-200 overflow-hidden font-sans">
            <header className="px-8 py-4 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <Link to="/home"><ArrowLeft className="text-slate-500 hover:text-white" /></Link>
                    <h2 className="text-2xl font-black text-emerald-500 tracking-tighter">CodeQuest</h2>
                    <div className="h-6 w-px bg-slate-800"></div>
                    <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">
            {currentIdx} / {config.count}
          </span>
                </div>

                <div className="flex gap-3">
                    {/* 🔹 BLUE CODE REVIEW BUTTON */}
                    <button onClick={handleCodeReview} disabled={loading}
                            className="bg-blue-500/10 border border-blue-500/50 text-blue-400 px-6 py-2 rounded-lg font-bold hover:bg-blue-500 hover:text-slate-950 transition-all disabled:opacity-30 flex items-center gap-2">
                        {loading ? <Loader2 className="animate-spin" size={16}/> : "CODE REVIEW"}
                    </button>

                    {/* 🟢 SUBMIT BUTTON */}
                    <button onClick={handleSubmit} disabled={loading}
                            className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 px-6 py-2 rounded-lg font-bold hover:bg-emerald-500 hover:text-slate-950 transition-all disabled:opacity-30 flex items-center gap-2">
                        {loading ? <Loader2 className="animate-spin" size={16}/> : "SUBMIT SOLUTION"}
                    </button>

                    <button
                        onClick={() => {
                            if(currentIdx < config.count) {
                                setCurrentIdx(c => c+1);
                                generateQuestion();
                            } else {
                                setStep('results');
                            }
                        }}
                        className="bg-slate-800 hover:bg-slate-700 px-6 py-2 rounded-lg font-bold transition-all"
                    >
                        {currentIdx === config.count ? "FINISH" : "NEXT"}
                    </button>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden p-6 gap-6">
                <div className="flex-1 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl bg-slate-950">
                    <Editor height="100%" theme="vs-dark" language={config.language} value={code} onChange={(v) => setCode(v || "")}
                            options={{ fontSize: 15, padding: { top: 20 }, minimap: { enabled: false } }} />
                </div>

                <div className="flex-1 bg-slate-900/30 border border-slate-800 rounded-2xl p-8 overflow-y-auto prose prose-invert prose-emerald max-w-none shadow-inner custom-scrollbar">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}
                                   components={{
                                       code({node, inline, className, children, ...props}: any) {
                                           const match = /language-(\w+)/.exec(className || '');
                                           return !inline && match ? (
                                               <SyntaxHighlighter style={dracula} language={match[1]} PreTag="div" className="rounded-xl border border-slate-800" {...props}>
                                                   {String(children).replace(/\n$/, '')}
                                               </SyntaxHighlighter>
                                           ) : <code className="bg-slate-800 text-emerald-400 px-1 rounded" {...props}>{children}</code>
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