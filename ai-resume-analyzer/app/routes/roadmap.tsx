import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Terminal, Shield, Activity, Globe, Cpu,
    ArrowRight, Download, Share2, ScanFace, Binary, ArrowLeft,
    CheckCircle2, Sparkles, Target, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router';

export default function RoadmapPage() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [logMessages, setLogMessages] = useState<string[]>([]);

    // Cinematic log console effect
    useEffect(() => {
        if (loading) {
            const msgs = [
                "> Initializing handshake protocol...",
                "> Encrypting data packet [AES-256]...",
                "> Uploading to Neural Core...",
                "> Gemini 2.5 Engine: ACTIVE",
                "> Scanning live market nodes...",
                "> Compiling strategic vectors...",
                "> Success: Blueprint Generated."
            ];
            let i = 0;
            const interval = setInterval(() => {
                if (i < msgs.length) {
                    setLogMessages(prev => [...prev, msgs[i]]);
                    i++;
                }
            }, 1200);
            return () => clearInterval(interval);
        } else {
            setLogMessages([]);
        }
    }, [loading]);

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append("resume", file);

        try {
            const res = await axios.post("http://localhost:5000/api/roadmap", formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(res.data);
        } catch (err) {
            alert("Connection Lost. Ensure Backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#030712] text-slate-300 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">

            {/* Animated Background Mesh */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 bg-[#030712]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <Link to="/home" className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/>
                        Back
                    </Link>
                    <div className="h-6 w-[1px] bg-white/10"></div>
                    <div className="flex items-center gap-3">
                        <div className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                        </div>
                        <span className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent tracking-wide">
                            PATHGENIE AI
                        </span>
                    </div>
                </div>
                <div className="hidden md:flex gap-6 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> System Online</span>
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"/> v2.5.0</span>
                </div>
            </header>

            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-32">

                {/* 1. UPLOAD VIEW */}
                {!result && !loading && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center min-h-[60vh]"
                    >
                        <div className="relative mb-8 group">
                            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                            <div className="relative bg-[#0B0F19] border border-white/10 p-6 rounded-3xl shadow-2xl">
                                <ScanFace size={48} className="text-cyan-400" />
                            </div>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black text-center mb-6 tracking-tight text-white">
                            Decrypt Your <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500">
                                Career Future
                            </span>
                        </h1>

                        <p className="text-slate-400 text-center max-w-xl mb-12 text-lg leading-relaxed font-light">
                            Upload your resume to initialize a deep-dive market analysis and generate a personalized strategic roadmap.
                        </p>

                        <div className="relative group w-full max-w-lg cursor-pointer">
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                accept=".pdf"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                            <div className="relative z-10 bg-[#0B0F19] border border-dashed border-slate-700 hover:border-cyan-500/50 rounded-2xl p-10 flex flex-col items-center transition-all duration-300 group-hover:bg-[#111827]">
                                <Binary className="text-slate-500 mb-4 group-hover:text-cyan-400 transition-colors" size={32} />
                                <p className="text-lg font-bold text-white mb-1">
                                    {file ? file.name : "Drop Resume PDF"}
                                </p>
                                <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">
                                    {file ? "Ready to Analyze" : "Max Size: 10MB"}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleUpload}
                            disabled={!file}
                            className={`mt-8 px-10 py-4 rounded-full font-bold text-sm tracking-widest uppercase transition-all flex items-center gap-3
                                ${file
                                ? "bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/25 hover:scale-105"
                                : "bg-slate-800 text-slate-500 cursor-not-allowed"}`}
                        >
                            Initialize Scan <ArrowRight size={16} />
                        </button>
                    </motion.div>
                )}

                {/* 2. LOADING TERMINAL */}
                {loading && (
                    <div className="flex flex-col items-center justify-center min-h-[50vh]">
                        <div className="w-full max-w-2xl bg-[#0B0F19] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                            <div className="bg-[#111827] px-4 py-2 border-b border-white/5 flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                            </div>
                            <div className="p-6 font-mono text-sm h-64 flex flex-col justify-end space-y-2">
                                {logMessages.map((msg, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-cyan-400/80 flex gap-2"
                                    >
                                        <span>➜</span> {msg}
                                    </motion.div>
                                ))}
                                <div className="animate-pulse text-cyan-500 font-bold mt-2">_</div>
                            </div>
                        </div>
                        <p className="mt-6 text-slate-500 text-xs font-mono uppercase tracking-widest animate-pulse">
                            Processing Neural Data...
                        </p>
                    </div>
                )}

                {/* 3. RESULTS DASHBOARD */}
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-8"
                    >
                        {/* Header Card */}
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/40 to-cyan-900/40 border border-white/10 p-8 md:p-12">
                            <div className="absolute top-0 right-0 p-12 opacity-20">
                                <Activity size={120} className="text-white" />
                            </div>
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold uppercase tracking-widest mb-4 border border-cyan-500/30">
                                    <Shield size={10} /> Verified Analysis
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
                                    Strategic Career Roadmap
                                </h2>
                                <p className="text-lg text-slate-300 max-w-2xl">
                                    Your personalized execution plan based on market telemetry and skill gap analysis.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* LEFT COLUMN: MAIN REPORT */}
                            <div className="lg:col-span-2 space-y-8">
                                <div className="bg-[#0B0F19]/60 backdrop-blur-md border border-white/5 rounded-3xl p-8 md:p-10 shadow-xl">
                                    <div className="prose prose-lg prose-invert max-w-none
                                        prose-headings:font-black prose-headings:tracking-tight
                                        prose-h1:text-3xl prose-h1:text-transparent prose-h1:bg-clip-text prose-h1:bg-gradient-to-r prose-h1:from-white prose-h1:to-slate-400
                                        prose-h2:text-2xl prose-h2:text-cyan-400 prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-4 prose-h2:mt-12
                                        prose-h3:text-xl prose-h3:text-indigo-400 prose-h3:mt-8
                                        prose-p:text-slate-300 prose-p:leading-relaxed
                                        prose-strong:text-white prose-strong:font-bold
                                        prose-ul:space-y-2 prose-li:text-slate-300
                                        prose-code:text-cyan-300 prose-code:bg-cyan-950/30 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                                    ">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {result.analysis}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: SIDEBAR */}
                            <div className="space-y-6">
                                {/* ACTION CARD */}
                                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white shadow-2xl">
                                    <Target className="mb-4 text-white/80" size={32} />
                                    <h3 className="text-xl font-bold mb-2">Next Steps</h3>
                                    <p className="text-white/80 text-sm mb-6 leading-relaxed">
                                        Focus on the "Skill Gap" section of your report. Complete 2 projects this month.
                                    </p>
                                    <div className="flex gap-2">
                                        <button className="flex-1 bg-white/20 hover:bg-white/30 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors">
                                            Save PDF
                                        </button>
                                        <button className="flex-1 bg-white text-indigo-700 hover:bg-indigo-50 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors">
                                            Share
                                        </button>
                                    </div>
                                </div>

                                {/* LIVE MARKET DATA */}
                                <div className="bg-[#0B0F19] border border-white/10 rounded-3xl p-6 sticky top-24">
                                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <Globe size={12} /> Live Market Nodes
                                    </h3>

                                    <div className="space-y-4">
                                        {result.live_jobs?.map((job: any, i: number) => (
                                            <a
                                                key={i}
                                                href={job.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/30 p-4 rounded-xl transition-all"
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-bold text-sm text-slate-200 group-hover:text-cyan-400 transition-colors line-clamp-1">
                                                        {job.title}
                                                    </h4>
                                                    <ArrowRight size={14} className="text-slate-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                                </div>
                                                <p className="text-xs text-slate-500 mb-2">{job.company}</p>
                                                <div className="flex items-center gap-2 text-[10px] text-slate-600 font-mono">
                                                    <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{job.location}</span>
                                                </div>
                                            </a>
                                        ))}

                                        {(!result.live_jobs || result.live_jobs.length === 0) && (
                                            <div className="text-center py-8 text-slate-600 text-xs italic">
                                                No direct market signals detected.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}