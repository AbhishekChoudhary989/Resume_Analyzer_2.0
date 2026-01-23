import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";

const BACKEND_URL = "http://localhost:5000";

export default function UploadPage() {
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);
    const [jobTitle, setJobTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (!localStorage.getItem("token")) navigate("/auth");
    }, [navigate]);

    const handleAnalyze = async () => {
        setErrorMsg("");
        if (!file || jobTitle.length < 2) return setErrorMsg("Upload a resume and enter a valid Job Title.");

        setLoading(true);
        try {
            // 1. Upload File
            const formData = new FormData();
            formData.append("files", file);
            const uploadRes = await fetch(`${BACKEND_URL}/api/files/upload`, { method: "POST", body: formData });
            if (!uploadRes.ok) throw new Error("Upload failed.");
            const filesData = await uploadRes.json();
            const resumePath = filesData[0]?.url;

            // 2. AI Analysis
            const aiRes = await fetch(`${BACKEND_URL}/api/ai/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: `Target Role: ${jobTitle}. strict JSON return.`,
                    fileUrl: resumePath
                })
            });

            if (!aiRes.ok) throw new Error("AI Analysis Failed.");
            const aiData = await aiRes.json();
            const feedback = JSON.parse(aiData.message.content.replace(/```json|```/g, "").trim());

            // 3. Save
            const newId = Date.now().toString();
            await fetch(`${BACKEND_URL}/api/kv/set`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    key: `resume:${newId}`,
                    value: { id: newId, jobTitle, overallScore: feedback.overallScore || 0, resumePath, feedback, createdAt: new Date() }
                })
            });

            navigate(`/resume/${newId}`);
        } catch (error: any) {
            setErrorMsg(error.message || "Analysis Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-2xl mx-auto pt-24 px-6">
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
                    <h1 className="text-3xl font-black mb-6 text-slate-900">New Analysis</h1>

                    {errorMsg && <div className="p-3 mb-4 bg-red-50 text-red-600 rounded-lg text-sm font-bold">{errorMsg}</div>}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Target Job Title</label>
                            <input
                                type="text"
                                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. Frontend Developer"
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Upload Resume (PDF)</label>
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4">
                                <FileUploader onFileSelect={setFile} />
                            </div>
                        </div>

                        <button
                            onClick={handleAnalyze}
                            disabled={loading}
                            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 transition-all"
                        >
                            {loading ? "Analyzing..." : "Start Analysis"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}