import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabase';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [cardRotation, setCardRotation] = useState({ x: 0, y: 0 });
    const navigate = useNavigate();
    const cardRef = useRef(null);

    // 3D Card tilt effect
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!cardRef.current) return;

            const rect = cardRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const rotateX = (e.clientY - centerY) / 20;
            const rotateY = (e.clientX - centerX) / 20;

            setCardRotation({ x: rotateX, y: rotateY });
            setMousePos({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            navigate('/admin'); // Redirect to admin after login
        } catch (error) {
            alert(error.error_description || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 overflow-hidden relative">
            {/* Animated gradient mesh background */}
            <div className="absolute inset-0 animate-gradient-shift opacity-30">
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
            </div>

            {/* Floating geometric shapes */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 left-20 w-16 h-16 border border-blue-500/30 rotate-45 animate-float" />
                <div className="absolute bottom-32 right-32 w-12 h-12 border border-purple-500/30 rounded-full animate-float" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/3 right-1/4 w-8 h-8 bg-pink-500/20 rotate-45 animate-float" style={{ animationDelay: '3s' }} />
            </div>

            {/* Mouse-following spotlight */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `radial-gradient(circle 400px at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.08) 0%, transparent 70%)`
                }}
            />

            {/* Login Card with 3D tilt */}
            <div
                ref={cardRef}
                className="relative z-10 w-full max-w-md animate-fade-scale-in"
                style={{
                    transform: `perspective(1000px) rotateX(${-cardRotation.x}deg) rotateY(${cardRotation.y}deg)`,
                    transition: 'transform 0.1s ease-out'
                }}
            >
                <div className="glass-card p-8 rounded-2xl shadow-2xl hover:shadow-neon-blue transition duration-300">
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative mb-4">
                            <div className="absolute inset-0 bg-blue-600 rounded-full blur-xl animate-pulse-slow" />
                            <div className="relative w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                <Lock className="text-white" size={28} />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            Admin Access
                        </h1>
                        <p className="text-gray-400 text-sm">Enter credentials to manage the universe</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="relative group">
                            <input
                                className="w-full bg-black/40 border border-white/10 p-4 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition text-white peer"
                                type="email"
                                placeholder=" "
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <label className="absolute left-4 top-4 text-gray-500 transition-all duration-200 pointer-events-none peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-blue-400 peer-focus:bg-black peer-focus:px-2 peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:left-2 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:bg-black peer-not-placeholder-shown:px-2">
                                Email
                            </label>
                        </div>
                        <div className="relative group">
                            <input
                                className="w-full bg-black/40 border border-white/10 p-4 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition text-white peer"
                                type="password"
                                placeholder=" "
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <label className="absolute left-4 top-4 text-gray-500 transition-all duration-200 pointer-events-none peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-blue-400 peer-focus:bg-black peer-focus:px-2 peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:left-2 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:bg-black peer-not-placeholder-shown:px-2">
                                Password
                            </label>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold p-4 rounded-lg transition shadow-lg shadow-blue-900/20 disabled:opacity-50 flex justify-center items-center gap-2 transform hover:scale-105 active:scale-95 group"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    Enter Console
                                    <Lock size={18} className="group-hover:translate-x-1 transition" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Decorative elements */}
                    <div className="absolute -top-10 -right-10 w-20 h-20 border border-blue-500/20 rounded-full animate-spin-slow" />
                    <div className="absolute -bottom-10 -left-10 w-16 h-16 border border-purple-500/20 rotate-45 animate-float" />
                </div>
            </div>
        </div>
    );
}
