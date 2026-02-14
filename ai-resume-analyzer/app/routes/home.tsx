import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import DashboardCharts from "~/components/DashboardCharts";
import LinkedInOptimizer from "~/components/LinkedInOptimizer";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Code2 } from "lucide-react";

const BACKEND_URL = "http://localhost:5000";

export function meta({}: Route.MetaArgs) {
    return [{ title: "AICARRER | Dashboard" }];
}

export default function Home() {
    const navigate = useNavigate();
    const [resumes, setResumes] = useState<any[]>([]);
    const [loadingResumes, setLoadingResumes] = useState(true);
    const [latestResumeText, setLatestResumeText] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/auth");
            return;
        }

        const loadResumes = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/kv/list`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pattern: 'resume:*' })
                });
                if (res.ok) {
                    const data = await res.json();
                    const sortedData = data.reverse();
                    setResumes(sortedData);

                    // ✅ ROBUST DATA EXTRACTION
                    if (sortedData.length > 0) {
                        const latest = sortedData[0];

                        // Try to find the best source of text for the AI
                        // 1. Feedback object (best)
                        // 2. Raw text (if saved)
                        // 3. Stringify the whole object (fallback)
                        const contentToOptimize = latest.feedback || latest.summary || latest;
                        setLatestResumeText(JSON.stringify(contentToOptimize));
                    }
                }
            } catch (error) {
                console.error("Failed to load resumes");
            } finally {
                setLoadingResumes(false);
            }
        };
        loadResumes();
    }, [navigate]);

    return (
        <main className="min-h-screen w-full bg-slate-50 text-gray-900">
            <Navbar />

            <section className="pt-24 pb-12 px-6 text-center max-w-5xl mx-auto">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-100">
                    AI-Powered Career Intelligence
                </div>
                <h1 className="mb-4 text-4xl sm:text-6xl font-black text-slate-900 tracking-tight">
                    Master Your <span className="text-blue-600">Job Applications</span>
                </h1>
                <p className="mb-8 text-lg text-slate-600 font-medium max-w-2xl mx-auto">
                    Upload your resume, get instant AI feedback, and track your progress.
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                    <Link to="/upload" className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold hover:bg-slate-800 transition-transform hover:scale-105">
                        Analyze New Resume
                    </Link>
                    <Link to="/roadmap" className="bg-indigo-600 text-white px-6 py-3 rounded-full font-bold hover:bg-indigo-500 transition-transform hover:scale-105 flex items-center gap-2">
                        <span>Career Roadmap</span> ⚡
                    </Link>
                    <Link to="/codequest" className="bg-emerald-600 text-white px-6 py-3 rounded-full font-bold hover:bg-emerald-500 transition-transform hover:scale-105 flex items-center gap-2">
                        <span>CodeQuest</span> <Code2 size={18} />
                    </Link>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 pb-20">
                {/* 1. DASHBOARD CHARTS */}
                <DashboardCharts />

                {/* 2. LINKEDIN OPTIMIZER (Centered) */}
                <div className="my-12 max-w-3xl mx-auto">
                    <LinkedInOptimizer resumeText={latestResumeText} />
                </div>

                {/* 3. RESUME GRID */}
                <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        Your Resumes <span className="bg-slate-200 text-xs px-2 py-1 rounded-full">{resumes.length}</span>
                    </h2>

                    {loadingResumes ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-slate-200 rounded-3xl animate-pulse" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Link to="/upload" className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed border-slate-300 rounded-3xl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group">
                                <div className="h-14 w-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <span className="text-3xl font-light">+</span>
                                </div>
                                <span className="font-bold text-slate-700 text-lg">New Analysis</span>
                                <span className="text-sm text-slate-400 mt-1">Check another resume</span>
                            </Link>

                            {resumes.map((resume: any, index: number) => (
                                <ResumeCard key={resume.id || index} resume={resume} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}