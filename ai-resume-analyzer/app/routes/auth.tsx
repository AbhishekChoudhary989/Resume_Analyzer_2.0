import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { LogIn, UserPlus, Mail, Lock, Sparkles, Eye, EyeOff } from "lucide-react";

const API_URL = "http://localhost:5000/api/auth";

export const meta = () => [{ title: 'AI CareerBoost | Secure Access' }];

const Auth = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const searchParams = new URLSearchParams(location.search);
    const next = searchParams.get('next') || '/';

    useEffect(() => {
        if (localStorage.getItem('token')) navigate(next);
    }, [navigate, next]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate(next);
            } else {
                setError(data.message || "Authorization Failed");
            }
        } catch (err) {
            setError("Server Connection Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-xl mb-4">
                        <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-white">Welcome Back</h1>
                    <p className="text-slate-400 mt-2 text-xs uppercase tracking-wide">Neural Protocol Authorization</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-900/50 border border-red-800 text-red-300 text-xs rounded-lg text-center font-bold">
                                {error}
                            </div>
                        )}

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                            <input
                                className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-800 border-none text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 transition-all"
                                type="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                            <input
                                className="w-full h-12 pl-12 pr-12 rounded-xl bg-slate-800 border-none text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 transition-all"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>

                        <button
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Verifying..." : <><span>Launch Dashboard</span><LogIn className="h-4 w-4" /></>}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-slate-800 flex justify-center">
                        <button className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-bold transition-colors">
                            <UserPlus className="h-4 w-4" />
                            <span>Create Access Link</span>
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Auth;