import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
// ✅ IMPORT THE COMPONENT
import LinkedInOptimizer from "~/components/LinkedInOptimizer";

const BACKEND_URL = "http://localhost:5000";

export default function Resume() {
    const { id } = useParams();
    const [feedback, setFeedback] = useState<any | null>(null);
    const [rawText, setRawText] = useState("");
    const [loading, setLoading] = useState(true);
    const [resumeUrl, setResumeUrl] = useState("");

    useEffect(() => {
        if (!id) return;
        fetch(`${BACKEND_URL}/api/kv/get/resume:${id}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) {
                    if (data.resumePath) setResumeUrl(data.resumePath.startsWith("http") ? data.resumePath : `${BACKEND_URL}${data.resumePath}`);

                    // Parse feedback
                    setFeedback(typeof data.feedback === 'string' ? JSON.parse(data.feedback) : data.feedback);

                    // Use the feedback data as context for the LinkedIn Optimizer
                    // (Since we don't have the raw PDF text saved, this uses the AI's summary of you)
                    setRawText(JSON.stringify(data.feedback));
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
            {/* Left Side: PDF Viewer */}
            <div className="w-full md:w-1/2 bg-slate-200 h-[50vh] md:h-screen sticky top-0 border-r border-slate-300">
                <div className="absolute top-4 left-4 z-10">
                    <Link to="/" className="bg-white/90 px-3 py-1 rounded-md text-sm font-bold text-slate-700 shadow-sm hover:bg-white">← Back</Link>
                </div>
                {resumeUrl ? <iframe src={resumeUrl} className="w-full h-full" title="Resume" /> : <div className="h-full flex items-center justify-center text-slate-500">Loading PDF...</div>}
            </div>

            {/* Right Side: Analysis */}
            <div className="w-full md:w-1/2 p-6 md:p-10 overflow-y-auto">
                <h1 className="text-3xl font-black text-slate-900 mb-6">Neural Review</h1>

                {loading ? (
                    <div className="text-center py-10 text-slate-500">Analyzing data...</div>
                ) : feedback ? (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <Summary feedback={feedback} />
                        <ATS score={feedback.ATS?.score || 0} suggestions={feedback.ATS?.tips || []} />
                        <Details feedback={feedback} />

                        {/* ✅ THIS IS WHERE THE LINKEDIN FEATURE APPEARS */}
                        <LinkedInOptimizer resumeText={rawText} />
                    </div>
                ) : (
                    <div className="p-6 bg-red-50 text-red-600 rounded-xl border border-red-100 text-center font-medium">
                        Analysis unavailable. Please retry.
                    </div>
                )}
            </div>
        </div>
    );
}