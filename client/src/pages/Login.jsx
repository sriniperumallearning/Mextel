import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import useAuthStore from '../store/authStore';
import Logo from '../components/ui/Logo';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('CUSTOMER');
    const [showPassword, setShowPassword] = useState(false);
    const [formError, setFormError] = useState('');
    const [isShaking, setIsShaking] = useState(false);

    const { login, isLoading, error, isAuthenticated, user } = useAuthStore();
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated && user) {
            navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard');
        }
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        if (!email || !password) {
            setFormError('Please fill in all fields');
            triggerShake();
            return;
        }

        try {
            const loggedInUser = await login(email, password, role);
            navigate(loggedInUser.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard');
        } catch (err) {
            triggerShake();
        }
    };

    const triggerShake = () => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-surface overflow-hidden">

            {/* Left Half: Branding & Wave Background */}
            <div className="relative w-full md:w-1/2 bg-primary flex flex-col justify-center items-center p-8 overflow-hidden">
                {/* Animated Waves */}
                <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-20">
                    <div className="absolute w-[300px] h-[300px] rounded-full border-[1px] border-accent animate-wave" style={{ animationDuration: '4s', animationDelay: '0s', transformOrigin: 'top left' }}></div>
                    <div className="absolute w-[300px] h-[300px] rounded-full border-[2px] border-accent animate-wave" style={{ animationDuration: '4s', animationDelay: '1s', transformOrigin: 'top left' }}></div>
                    <div className="absolute w-[300px] h-[300px] rounded-full border-[1px] border-accent animate-wave" style={{ animationDuration: '4s', animationDelay: '2s', transformOrigin: 'top left' }}></div>
                    <div className="absolute w-[300px] h-[300px] rounded-full border-[3px] border-accent animate-wave" style={{ animationDuration: '4s', animationDelay: '3s', transformOrigin: 'top left' }}></div>
                </div>

                {/* Content */}
                <div className="relative z-10 text-center max-w-md">
                    <div className="bg-white/5 p-8 rounded-3xl backdrop-blur-sm border border-white/10 shadow-2xl">
                        <Logo className="justify-center mb-6 scale-150 transform transition-transform" />
                        <p className="text-gray-300 tracking-widest text-sm uppercase font-semibold mb-8">
                            Always Connected. Always You.
                        </p>
                        <h1 className="text-3xl font-display font-bold text-white mb-4">
                            Welcome to the Future of Telecom
                        </h1>
                        <p className="text-gray-400 font-body">
                            Manage your plans, track your usage, and stay connected with MEXTEL's new self-service portal.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Half: Login Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-bg relative">
                <div className={`w-full max-w-md ${isShaking ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>

                    <div className="glass p-8 rounded-card shadow-card">
                        <h2 className="text-2xl font-display font-bold text-primary mb-6">Sign In</h2>

                        {/* Role Toggle Pill */}
                        <div className="flex bg-black/5 rounded-pill p-1 mb-6">
                            <button
                                type="button"
                                onClick={() => setRole('CUSTOMER')}
                                className={`flex-1 py-2 text-sm font-medium rounded-pill transition-all ${role === 'CUSTOMER' ? 'bg-white text-primary shadow flex-shrink-0' : 'text-muted hover:text-text'
                                    }`}
                            >
                                Customer
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('ADMIN')}
                                className={`flex-1 py-2 text-sm font-medium rounded-pill transition-all ${role === 'ADMIN' ? 'bg-white text-primary shadow flex-shrink-0' : 'text-muted hover:text-text'
                                    }`}
                            >
                                Administrator
                            </button>
                        </div>

                        {/* Display Errors */}
                        {(error || formError) && (
                            <div className="bg-danger/10 text-danger border border-danger/20 rounded-md p-3 mb-6 text-sm flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                {formError || error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text mb-1 pointer-events-none">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-btn border border-black/10 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all placeholder-muted/50"
                                    placeholder={role === 'CUSTOMER' ? "customer@mextel.mx" : "admin@mextel.mx"}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text mb-1 pointer-events-none">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 rounded-btn border border-black/10 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all placeholder-muted/50"
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary p-1"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end mb-6">
                                <a href="#" className="text-sm font-medium text-accent hover:text-accent-hover transition-colors">
                                    Forgot Password?
                                </a>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-3 px-4 rounded-btn shadow-lg shadow-accent/30 transition-all hover:-translate-y-[1px] flex justify-center items-center disabled:opacity-70 disabled:hover:translate-y-0"
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-xs text-muted">
                            Auto-login hints: <br />
                            Customer: customer@mextel.mx / Customer@1234 <br />
                            Admin: admin@mextel.mx / Admin@1234
                        </div>

                    </div>
                </div>
            </div>

            <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
      `}</style>
        </div>
    );
};

export default Login;
