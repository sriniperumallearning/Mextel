import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    Home,
    Smartphone,
    Settings,
    Users,
    Settings2,
    BarChart3,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import Logo from '../ui/Logo';

const customerLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Browse Plans', path: '/plans', icon: Smartphone },
    { name: 'Account Settings', path: '/settings', icon: Settings },
];

const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: BarChart3 },
    { name: 'Manage Plans', path: '/admin/plans', icon: Settings2 },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const links = user?.role === 'ADMIN' ? adminLinks : customerLinks;

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navClass = ({ isActive }) =>
        `flex items-center gap-3 px-6 py-4 transition-colors relative ${isActive
            ? 'text-accent bg-accent/10 border-l-4 border-accent font-semibold flex-shrink-0'
            : 'text-muted hover:text-text hover:bg-black/5 border-l-4 border-transparent flex-shrink-0'
        }`;

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar sidebar */}
            <aside className={`fixed inset-y-0 left-0 bg-surface border-r border-black/5 w-64 flex flex-col z-30 transform transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                {/* Brand Area */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-black/5">
                    <Logo className="scale-90 origin-left" />
                    <button
                        className="md:hidden text-muted hover:text-text"
                        onClick={() => setIsOpen(false)}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-1">
                    {links.map((link) => {
                        const Icon = link.icon;
                        return (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                className={navClass}
                                onClick={() => setIsOpen(false)}
                                end={link.path.endsWith('dashboard') || link.path.endsWith('plans')} // exact match for active class
                            >
                                <Icon size={20} />
                                <span>{link.name}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Bottom User Area */}
                <div className="p-6 border-t border-black/5">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 text-muted hover:text-danger transition-colors w-full"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
