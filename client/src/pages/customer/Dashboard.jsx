import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Smartphone, Wifi, MessageSquare, PhoneCall, ArrowRight, Loader2, Zap } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';

const ProgressRing = ({ percentage, color, icon: Icon, label, value }) => {
    const radius = 35;
    const stroke = 6;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative flex items-center justify-center">
                <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
                    <circle
                        stroke="rgba(0,0,0,0.05)"
                        fill="transparent"
                        strokeWidth={stroke}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                    <circle
                        stroke={color}
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
                        strokeLinecap="round"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                </svg>
                <div className="absolute flex items-center justify-center bg-white rounded-full shadow-sm p-2">
                    <Icon size={20} style={{ color }} />
                </div>
            </div>
            <div className="text-center">
                <p className="text-sm font-bold text-text">{value}</p>
                <p className="text-xs text-muted font-medium">{label}</p>
            </div>
        </div>
    );
};

const CustomerDashboard = () => {
    const { user, updateUser } = useAuthStore();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, historyRes] = await Promise.all([
                    api.get('/customers/me'),
                    api.get('/customers/history')
                ]);
                setProfile(profileRes.data);
                updateUser(profileRes.data);
                setHistory(historyRes.data);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <Loader2 className="animate-spin text-accent" size={32} />
            </div>
        );
    }

    const plan = profile?.currentPlan;
    // Mock usage data
    const dataUsagePct = plan?.dataGB === -1 ? 100 : 65;
    const dataValue = plan?.dataGB === -1 ? 'Unlimited' : `${(plan?.dataGB * 0.65).toFixed(1)} / ${plan?.dataGB} GB`;

    const minutesUsagePct = plan?.callMinutes === -1 ? 100 : 40;
    const minutesValue = plan?.callMinutes === -1 ? 'Unlimited' : `${Math.round(plan?.callMinutes * 0.4)} / ${plan?.callMinutes}`;

    const smsUsagePct = plan?.smsCount === -1 ? 100 : 15;
    const smsValue = plan?.smsCount === -1 ? 'Unlimited' : `${Math.round(plan?.smsCount * 0.15)} / ${plan?.smsCount}`;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-primary">Overview</h1>
                    <p className="text-muted mt-1">Manage your line and track usage.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Top Section - My Plan Hero */}
                <div className="lg:col-span-2 glass rounded-2xl overflow-hidden shadow-card border border-accent/10 relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-20 -mt-20"></div>

                    <div className="p-8 relative z-10 flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full mb-3 tracking-wide uppercase">
                                    <Zap size={14} /> Current Plan
                                </div>
                                <h2 className="text-3xl font-display font-black text-primary mb-1">
                                    {plan?.name || 'No Active Plan'}
                                </h2>
                                <p className="text-muted font-medium">
                                    Renews {format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'MMM dd, yyyy')}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-4xl font-black text-accent">${plan?.price}</span>
                                <span className="text-muted text-sm font-medium"> /mo</span>
                            </div>
                        </div>

                        <div className="flex justify-around items-center bg-white/60 p-6 rounded-xl border border-white/50 mb-8 backdrop-blur-sm shadow-sm">
                            <ProgressRing
                                percentage={dataUsagePct}
                                color="#00AAFF"
                                icon={Wifi}
                                label="Data Used"
                                value={dataValue}
                            />
                            <ProgressRing
                                percentage={minutesUsagePct}
                                color="#22C55E"
                                icon={PhoneCall}
                                label="Minutes"
                                value={minutesValue}
                            />
                            <ProgressRing
                                percentage={smsUsagePct}
                                color="#F59E0B"
                                icon={MessageSquare}
                                label="SMS Sent"
                                value={smsValue}
                            />
                        </div>

                        <button
                            onClick={() => navigate('/plans')}
                            className="w-full bg-primary hover:bg-primary/90 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                        >
                            Explore Upgrade Options
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Account Summary */}
                <div className="glass rounded-2xl p-6 shadow-card flex flex-col">
                    <h3 className="text-lg font-bold font-display text-primary mb-6 flex items-center gap-2">
                        <Smartphone size={20} className="text-accent" />
                        Line Details
                    </h3>

                    <div className="space-y-5 flex-1">
                        <div>
                            <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-1">Phone Number</p>
                            <p className="text-lg font-bold text-text bg-black/5 inline-block px-3 py-1.5 rounded-md">
                                {profile?.phone || 'Not Assigned'}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-1">Account Holder</p>
                            <p className="font-medium text-text">{profile?.fullName}</p>
                        </div>

                        <div>
                            <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-1">Email</p>
                            <p className="font-medium text-text">{profile?.email}</p>
                        </div>

                        <div>
                            <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-1">Status</p>
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-success/10 text-success rounded-md text-sm font-semibold">
                                <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                                Active
                            </div>
                        </div>

                        <div className="pt-4 border-t border-black/5 mt-auto">
                            <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-1">Member Since</p>
                            <p className="font-medium text-text">{profile?.createdAt ? format(new Date(profile.createdAt), 'MMMM yyyy') : 'N/A'}</p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Recent Activity Table */}
            <div className="glass rounded-2xl overflow-hidden shadow-card">
                <div className="p-6 border-b border-black/5 bg-white/40">
                    <h3 className="text-lg font-bold font-display text-primary">Recent Activity</h3>
                </div>

                {history.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-4">
                            <Smartphone size={32} />
                        </div>
                        <p className="text-lg font-medium text-text">No recent changes</p>
                        <p className="text-muted text-sm mt-1">Your plan history will appear here.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-black/5 text-xs uppercase tracking-wider text-muted font-semibold">
                                    <th className="p-4 pl-6">Date</th>
                                    <th className="p-4">Action</th>
                                    <th className="p-4">Plan Selected</th>
                                    <th className="p-4 pr-6 rounded-tr-lg">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5">
                                {history.map((record) => (
                                    <tr key={record.id} className="hover:bg-white/50 transition-colors">
                                        <td className="p-4 pl-6 text-sm font-medium text-text">
                                            {format(new Date(record.date), 'MMM dd, yyyy')}
                                        </td>
                                        <td className="p-4 text-sm">
                                            <span className="inline-flex items-center px-2 py-1 rounded bg-accent/10 text-accent font-medium text-xs">
                                                Plan Change
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm font-bold text-primary">
                                            {record.toPlan}
                                        </td>
                                        <td className="p-4 pr-6 text-sm text-muted">
                                            {record.reason || 'Customer initiated'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

        </div>
    );
};

export default CustomerDashboard;
