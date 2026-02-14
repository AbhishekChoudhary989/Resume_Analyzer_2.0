import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Terminal, Shield, Activity, Globe, Cpu,
    ArrowRight, Download, Share2, ScanFace, Binary, ArrowLeft,
    CheckCircle2, Sparkles, Target, Zap, Map, BookOpen, Link as LinkIcon, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router';

export default function RoadmapPage() {
    const [file, setFile] = useState<File | null>(null);

    // TWO LOADING STATES
    const [mainLoading, setMainLoading] = useState(false); // For Roadmap (Fast)
    const [jobsLoading, setJobsLoading] = useState(false); // For Sidebar (Slow)

    const [result, setResult] = useState<any>(null);
    const [logMessages, setLogMessages] = useState<string[]>([]);

    useEffect(() => {
        if (mainLoading) {
            const msgs = [
                "> Initializing handshake protocol...",
                "> Uploading to Neural Core...",
                "> Gemini 1.5 Engine: ACTIVE",
                "> Decoding Career DNA...",
                "> Generating Strategic Vector..."
            ];
            let i = 0;
            const interval = setInterval(() => {
                if (i < msgs.length) {
                    setLogMessages(prev => [...prev, msgs[i]]);
                    i++;
                }
            }, 800);
            return () => clearInterval(interval);
        } else {
            setLogMessages([]);
        }
    }, [mainLoading]);

    const handleUpload = async () => {
        if (!file) return;

        // 1. START ROADMAP GEN
        setMainLoading(true);
        setResult(null);

        const formData = new FormData();
        formData.append("resume", file);

        try {
            // A. Get Roadmap (Fast)
            const res = await axios.post("http://localhost:5000/api/roadmap", formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // B. SHOW ROADMAP IMMEDIATELY
            setResult(res.data);
            setMainLoading(false); // Stop main spinner

            // C. START BACKGROUND JOB SEARCH
            if (res.data.searchParams) {
                fetchJobsBackground(res.data.searchParams);
            }

        } catch (err) {
            alert("Analysis failed. Ensure backend is running.");
            setMainLoading(false);
        }
    };

    const fetchJobsBackground = async (params: any) => {
        setJobsLoading(true);
        try {
            console.log("Fetching jobs for:", params);
            const res = await axios.post("http://localhost:5000/api/jobs", {
                job_title: params.job_title,
                location: params.location
            });

            // Update the result with the new jobs
            setResult((prev: any) => ({
                ...prev,
                live_jobs: res.data.live_jobs
            }));

        } catch (error) {
            console.error("Background job fetch failed", error);
        } finally {
            setJobsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#030712] text-slate-300 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            {/* Navbar */}
            <header className="sticky top-0 z-50 bg-[#030712]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <Link to="/home" className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/>
                        Back
                    </Link>
                    <div className="h-6 w-[1px] bg-white/10"></div>
                    <span className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent tracking-wide">
                        PATHGENIE AI
                    </span>
                </div>
            </header>

            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-32">

                {/* 1. UPLOAD VIEW */}
                {!result && !mainLoading && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-[60vh]">
                        <div className="relative mb-8 group">
                            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                            <div className="relative bg-[#0B0F19] border border-white/10 p-6 rounded-3xl shadow-2xl">
                                <ScanFace size={48} className="text-cyan-400" />
                            </div>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black text-center mb-6 tracking-tight text-white">
                            Decrypt Your <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500">Career Future</span>
                        </h1>

                        <div className="relative group w-full max-w-lg cursor-pointer mt-8">
                            <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                            <div className="relative z-10 bg-[#0B0F19] border border-dashed border-slate-700 hover:border-cyan-500/50 rounded-2xl p-10 flex flex-col items-center transition-all duration-300 group-hover:bg-[#111827]">
                                <Binary className="text-slate-500 mb-4 group-hover:text-cyan-400 transition-colors" size={32} />
                                <p className="text-lg font-bold text-white mb-1">{file ? file.name : "Drop Resume PDF"}</p>
                            </div>
                        </div>

                        <button onClick={handleUpload} disabled={!file} className={`mt-8 px-10 py-4 rounded-full font-bold text-sm tracking-widest uppercase transition-all flex items-center gap-3 ${file ? "bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/25 hover:scale-105" : "bg-slate-800 text-slate-500 cursor-not-allowed"}`}>
                            Initialize Scan <ArrowRight size={16} />
                        </button>
                    </motion.div>
                )}

                {/* 2. LOADING TERMINAL */}
                {mainLoading && (
                    <div className="flex flex-col items-center justify-center min-h-[50vh]">
                        <div className="w-full max-w-2xl bg-[#0B0F19] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                            <div className="p-6 font-mono text-sm h-64 flex flex-col justify-end space-y-2">
                                {logMessages.map((msg, idx) => (
                                    <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-cyan-400/80 flex gap-2">
                                        <span>➜</span> {msg}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. RESULTS DASHBOARD */}
                {result && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-8">

                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/40 to-cyan-900/40 border border-white/10 p-8 md:p-12">
                            <div className="relative z-10">
                                <h2 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">Strategic Career Roadmap</h2>
                                <p className="text-lg text-slate-300 max-w-2xl">Your personalized execution plan.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* MAIN REPORT */}
                            <div className="lg:col-span-2 space-y-8">
                                <div className="bg-[#0B0F19]/60 backdrop-blur-md border border-white/5 rounded-3xl p-8 md:p-10 shadow-xl">
                                    {typeof result.analysis === 'string' ? (
                                        <div className="prose prose-lg prose-invert max-w-none">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.analysis}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        <div className="space-y-12 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-white/10">
                                            {result.analysis?.roadmap?.map((step: any, i: number) => (
                                                <div key={i} className="relative pl-12">
                                                    <div className="absolute left-0 top-0 bg-cyan-500 text-black w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-cyan-500/20 z-10">{i + 1}</div>
                                                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-cyan-500/30 transition-colors group">
                                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{step.step}</h3>
                                                        <p className="text-slate-400 leading-relaxed mb-4">{step.description}</p>
                                                        {step.resources && (
                                                            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
                                                                {step.resources.map((res: string, j: number) => (
                                                                    <span key={j} className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold border border-indigo-500/20">
                                                                        <BookOpen size={10} /> {res}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* SIDEBAR (Live Jobs) */}
                            <div className="space-y-6">
                                <div className="bg-[#0B0F19] border border-white/10 rounded-3xl p-6 sticky top-24">
                                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <Globe size={12} /> Live Market Nodes
                                        {jobsLoading && <Loader2 size={12} className="animate-spin text-cyan-400"/>}
                                    </h3>

                                    {jobsLoading && (
                                        <div className="space-y-4">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse border border-white/5" />
                                            ))}
                                            <div className="text-center text-xs text-cyan-400 animate-pulse">Scanning Indeed...</div>
                                        </div>
                                    )}

                                    {!jobsLoading && result.live_jobs?.map((job: any, i: number) => (
                                        <a key={i} href={job.url} target="_blank" rel="noopener noreferrer" className="block group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/30 p-4 rounded-xl transition-all">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-sm text-slate-200 group-hover:text-cyan-400 transition-colors line-clamp-1">{job.title}</h4>
                                                <ArrowRight size={14} className="text-slate-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                            </div>
                                            <p className="text-xs text-slate-500 mb-2">{job.company}</p>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-600 font-mono">
                                                <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{job.location}</span>
                                            </div>
                                        </a>
                                    ))}

                                    {!jobsLoading && (!result.live_jobs || result.live_jobs.length === 0) && (
                                        <div className="text-center py-8 text-slate-600 text-xs italic">
                                            No active nodes found in this sector.
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}