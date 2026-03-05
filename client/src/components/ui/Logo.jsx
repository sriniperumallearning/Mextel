import React from 'react';

const Logo = ({ className = "" }) => {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* Wordmark */}
            <div className="font-display font-black tracking-tighter text-2xl flex">
                <span className="text-primary">MEX</span>
                <span className="text-accent">TEL</span>
            </div>

            {/* Arc Icon */}
            <svg
                width="28"
                height="28"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="ml-1"
            >
                <path d="M4 28C4 14.7452 14.7452 4 28 4" stroke="url(#paint0_linear)" strokeWidth="4" strokeLinecap="round" />
                <path d="M12 28C12 19.1634 19.1634 12 28 12" stroke="url(#paint1_linear)" strokeWidth="4" strokeLinecap="round" />
                <path d="M20 28C20 23.5817 23.5817 20 28 20" stroke="url(#paint2_linear)" strokeWidth="4" strokeLinecap="round" />
                <circle cx="28" cy="28" r="4" fill="#00AAFF" />
                <defs>
                    <linearGradient id="paint0_linear" x1="4" y1="28" x2="28" y2="4" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#00E5CC" />
                        <stop offset="1" stopColor="#00AAFF" />
                    </linearGradient>
                    <linearGradient id="paint1_linear" x1="12" y1="28" x2="28" y2="12" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#00E5CC" />
                        <stop offset="1" stopColor="#00AAFF" />
                    </linearGradient>
                    <linearGradient id="paint2_linear" x1="20" y1="28" x2="28" y2="20" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#00E5CC" />
                        <stop offset="1" stopColor="#00AAFF" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};

export default Logo;
