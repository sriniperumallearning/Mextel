import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import useAuthStore from '../../store/authStore';

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useAuthStore();

    // Get initials for avatar
    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <div className="min-h-screen flex bg-bg text-text">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col md:pl-64 transition-all duration-300 min-w-0">

                {/* Top Header */}
                <header className="h-20 bg-surface/80 backdrop-blur-md border-b border-black/5 flex items-center justify-between px-6 sticky top-0 z-10 w-full">
                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden text-muted hover:text-text p-2 -ml-2"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open modern menu"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="hidden md:block">
                        {/* Optional breadcrumbs or page title could go here */}
                    </div>

                    {/* Right side User Menu */}
                    <div className="flex items-center gap-4 ml-auto">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold">{user?.fullName || 'User'}</p>
                            <p className="text-xs text-muted capitalize">{(user?.role || 'Customer').toLowerCase()}</p>
                        </div>

                        {/* Avatar Circle */}
                        <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold">
                            {getInitials(user?.fullName)}
                        </div>
                    </div>
                </header>

                {/* Page Content Outlet */}
                <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
                    <Outlet />
                </main>

            </div>
        </div>
    );
};

export default MainLayout;
