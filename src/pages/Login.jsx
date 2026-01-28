import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-blue-900/40">
                        <Lock className="text-white" size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Admin Access</h1>
                    <p className="text-gray-400 text-sm mt-2">Enter credentials to manage the universe</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <input
                            className="w-full bg-black/40 border border-white/10 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition text-white"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <input
                            className="w-full bg-black/40 border border-white/10 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition text-white"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold p-3 rounded-lg transition shadow-lg shadow-blue-900/20 disabled:opacity-50 flex justify-center"
                        disabled={loading}
                    >
                        {loading ? 'Verifying...' : 'Enter Console'}
                    </button>
                </form>
            </div>
        </div>
    );
}
