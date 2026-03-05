import React, { useEffect, useState } from 'react';
import { Download, Users, Smartphone, TrendingUp, Activity, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import api from '../../services/api';

const KPICard = ({ title, value, icon: Icon, trend }) => (
    <div className="glass p-6 rounded-2xl shadow-card relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent/5 rounded-full blur-xl group-hover:bg-accent/10 transition-colors"></div>
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
                <p className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">{title}</p>
                <h3 className="text-3xl font-display font-black text-primary">{value}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <Icon size={24} />
            </div>
        </div>
        {trend && (
            <div className="text-xs font-semibold text-success flex items-center gap-1">
                <TrendingUp size={14} />
                {trend}
            </div>
        )}
    </div>
);

const AdminDashboard = () => {
    const [data, setData] = useState({
        kpis: null,
        customersByPlan: [],
        recentChanges: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [exportType, setExportType] = useState(null); // 'csv' or 'xlsx'

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await api.get('/admin/dashboard');
                setData(response.data);
            } catch (error) {
                console.error("Failed to load admin dashboard", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const handleExport = async (type) => {
        setIsExporting(true);
        setExportType(type);

        try {
            const response = await api.get('/admin/export');
            const exportData = response.data;

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Plan Changes");

            const fileExtension = type === 'xlsx' ? 'xlsx' : 'csv';
            const fileName = `mextel-plan-changes-${format(new Date(), 'yyyy-MM-dd')}.${fileExtension}`;

            if (type === 'csv') {
                const csvContent = XLSX.utils.sheet_to_csv(worksheet);
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                saveAs(blob, fileName);
            } else {
                const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
                const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
                saveAs(blob, fileName);
            }

        } catch (error) {
            console.error("Export failed", error);
            alert("Failed to export data. Please try again.");
        } finally {
            setIsExporting(false);
            setExportType(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <Loader2 className="animate-spin text-accent" size={32} />
            </div>
        );
    }

    // Pre-defined colors matching brand for the chart bars
    const colors = ['#0A1F44', '#00AAFF', '#00E5CC', '#22C55E', '#F59E0B'];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-primary">Admin Dashboard</h1>
                    <p className="text-muted mt-1">Platform overview and recent customer activity.</p>
                </div>

                {/* Export Dropdown (Simplified as two buttons for UI clarity) */}
                <div className="flex gap-2">
                    <button
                        onClick={() => handleExport('csv')}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-4 py-2 bg-black/5 hover:bg-black/10 text-text font-semibold rounded-btn transition-colors disabled:opacity-50 text-sm"
                    >
                        {isExporting && exportType === 'csv' ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        Export CSV
                    </button>
                    <button
                        onClick={() => handleExport('xlsx')}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white font-semibold rounded-btn transition-all shadow-md hover:-translate-y-[1px] disabled:opacity-70 disabled:hover:translate-y-0 text-sm"
                    >
                        {isExporting && exportType === 'xlsx' ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        Export Excel
                    </button>
                </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total Customers"
                    value={data.kpis?.totalCustomers}
                    icon={Users}
                    trend="+5.2% this week"
                />
                <KPICard
                    title="Total Active Plans"
                    value={data.kpis?.totalActivePlans}
                    icon={Smartphone}
                />
                <KPICard
                    title="Changes This Month"
                    value={data.kpis?.planChangesThisMonth}
                    icon={Activity}
                    trend="+12% vs last month"
                />
                <KPICard
                    title="Top Plan"
                    value={data.kpis?.mostPopularPlan}
                    icon={TrendingUp}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Customers by Plan Chart */}
                <div className="glass rounded-2xl p-6 shadow-card lg:col-span-1 border border-transparent hover:border-accent/10 transition-colors">
                    <h3 className="text-lg font-bold font-display text-primary mb-6">Subscribers by Plan</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data.customersByPlan}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 600 }}
                                    width={80}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="customers" radius={[0, 4, 4, 0]} barSize={24}>
                                    {data.customersByPlan.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Plan Changes Table */}
                <div className="glass rounded-2xl shadow-card lg:col-span-2 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-black/5 bg-white/40">
                        <h3 className="text-lg font-bold font-display text-primary">Recent Plan Upgrades/Downgrades</h3>
                    </div>

                    <div className="overflow-x-auto flex-1 p-0">
                        {data.recentChanges.length === 0 ? (
                            <div className="p-12 text-center text-muted">No recent changes recorded.</div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-black/5 text-xs uppercase tracking-wider text-muted font-semibold">
                                        <th className="p-4 pl-6">Customer</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Switched To</th>
                                        <th className="p-4 pr-6">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/5 text-sm">
                                    {data.recentChanges.map((change) => (
                                        <tr key={change.id} className="hover:bg-white/50 transition-colors">
                                            <td className="p-4 pl-6 font-bold text-text">{change.customerName}</td>
                                            <td className="p-4 text-muted">{change.email}</td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center px-2 py-1 rounded bg-success/10 text-success font-bold text-xs">
                                                    {change.toPlan}
                                                </span>
                                            </td>
                                            <td className="p-4 pr-6 text-muted font-medium">
                                                {format(new Date(change.date), 'MMM dd, yyyy - h:mm a')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

            </div>

        </div>
    );
};

export default AdminDashboard;
