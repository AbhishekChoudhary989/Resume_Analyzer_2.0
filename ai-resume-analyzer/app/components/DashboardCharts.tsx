import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Loader2, TrendingUp } from 'lucide-react';

// Default Dummy Data (Shown when no history exists)
const dummyScoreHistory = [
    { date: 'Start', score: 50 },
    { date: 'Now', score: 50 }
];

const activityData = [
    { day: 'M', problems: 2 }, { day: 'T', problems: 5 },
    { day: 'W', problems: 1 }, { day: 'T', problems: 6 },
    { day: 'F', problems: 8 }, { day: 'S', problems: 3 },
    { day: 'S', problems: 4 },
];

export default function DashboardCharts() {
    const [scoreHistory, setScoreHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [growth, setGrowth] = useState(0);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/kv/history");
            const data = await res.json();

            if (data && data.length > 0) {
                setScoreHistory(data);

                // Calculate Growth Logic
                if (data.length > 1) {
                    const first = data[0].score || 1; // Prevent division by zero
                    const last = data[data.length - 1].score;
                    const growthPercent = Math.round(((last - first) / first) * 100);
                    setGrowth(growthPercent);
                } else {
                    setGrowth(0); // No growth if only 1 scan
                }
            } else {
                setScoreHistory(dummyScoreHistory);
            }
        } catch (error) {
            console.error("Failed to load chart data", error);
            setScoreHistory(dummyScoreHistory);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700">

            {/* Chart 1: Resume Progress (REAL DATA) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            Score Trajectory
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                            {loading ? "Syncing..." : "Based on your analysis history"}
                        </p>
                    </div>
                    {!loading && (
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border 
                            ${growth >= 0 ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                            <TrendingUp size={14} className={growth < 0 ? "rotate-180" : ""} />
                            {growth >= 0 ? `+${growth}% Growth` : `${growth}% Change`}
                        </div>
                    )}
                </div>
                <div className="h-64 w-full relative">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="animate-spin text-slate-300" size={32} />
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={scoreHistory}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    domain={[0, 100]}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ color: '#fff' }}
                                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#4f46e5"
                                    strokeWidth={4}
                                    dot={{ r: 4, fill: '#fff', stroke: '#4f46e5', strokeWidth: 2 }}
                                    activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
                                    animationDuration={1500}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Chart 2: CodeQuest Activity (Static for now) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Coding Streak</h3>
                        <p className="text-xs text-slate-500 font-medium">Daily Problems Solved</p>
                    </div>
                    <div className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
                        29 Solved
                    </div>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={activityData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                            />
                            <Bar
                                dataKey="problems"
                                fill="#10b981"
                                radius={[6, 6, 0, 0]}
                                barSize={24}
                                className="hover:opacity-80 transition-opacity"
                                animationDuration={1500}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}