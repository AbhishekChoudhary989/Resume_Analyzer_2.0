import { useState } from "react";
import { Linkedin, Copy, Loader2, Sparkles, Check, AlertTriangle } from "lucide-react";

export default function LinkedInOptimizer({ resumeText }: { resumeText: string }) {
    const [data, setData] = useState<{ headlines: string[], about: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const generate = async () => {
        // Reset states
        setError("");
        setLoading(true);

        // 1. Validation Check (Show error if no data)
        if (!resumeText || resumeText === "{}" || resumeText.length < 5) {
            setError("No resume data found. Please analyze a new resume first.");
            setLoading(false);
            return;
        }

        try {
            // 2. Send Request
            const res = await fetch('http://localhost:5000/api/ai/linkedin-optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeText })
            });

            // 3. Handle Server Errors
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Server failed to generate profile");
            }

            const json = await res.json();
            setData(json.result);
        } catch (e: any) {
            console.error("LinkedIn Error:", e);
            setError(e.message || "Failed to connect to AI server.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm relative overflow-hidden mb-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -z-10" />

            <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-200">
                    <Linkedin className="text-white" size={20} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">LinkedIn Optimizer</h3>
                    <p className="text-sm text-gray-500">Based on your latest resume analysis</p>
                </div>
            </div>

            {!data ? (
                <div className="text-center py-6">
                    <button
                        onClick={generate}
                        disabled={loading}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold transition-all flex justify-center items-center gap-2 shadow-xl shadow-slate-200 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <><Sparkles size={18} /> Generate Profile</>}
                    </button>

                    {/* ✅ ERROR MESSAGE DISPLAY */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center justify-center gap-2 font-medium animate-in fade-in">
                            <AlertTriangle size={16} /> {error}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div>
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Viral Headlines</h4>
                        <div className="space-y-3">
                            {data.headlines.map((headline, i) => (
                                <div key={i} onClick={() => copyToClipboard(headline, i)} className="group bg-slate-50 hover:bg-blue-50 border border-slate-200 p-4 rounded-xl cursor-pointer flex justify-between items-center transition-all">
                                    <p className="text-slate-700 font-medium text-sm pr-4">{headline}</p>
                                    <div className="text-slate-400 group-hover:text-blue-600">{copiedIndex === i ? <Check size={16} /> : <Copy size={16} />}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">About Summary</h4>
                        <div className="relative bg-slate-50 border border-slate-200 p-5 rounded-xl group">
                            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{data.about}</p>
                            <button onClick={() => copyToClipboard(data.about, 99)} className="absolute top-3 right-3 p-2 bg-white rounded-lg shadow-sm text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all">
                                {copiedIndex === 99 ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>

                    <button onClick={() => setData(null)} className="w-full text-center text-sm text-slate-500 font-bold hover:text-blue-600 transition-colors">
                        Optimize Another Resume
                    </button>
                </div>
            )}
        </div>
    );
}