import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Users, Loader2, Search, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import PlanDrawer from '../../components/ui/PlanDrawer';

const ManagePlans = () => {
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);

    const [deleteModalPlan, setDeleteModalPlan] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/admin/plans');
            setPlans(res.data);
        } catch (error) {
            console.error('Failed to fetch plans', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDrawer = (plan = null) => {
        setEditingPlan(plan);
        setDrawerOpen(true);
    };

    const handleSavePlan = (savedPlan, action) => {
        if (action === 'create') {
            // Re-fetch to get correct _count
            fetchPlans();
        } else {
            setPlans(plans.map(p => p.id === savedPlan.id ? { ...savedPlan, subscribersCount: p.subscribersCount } : p));
        }
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            await api.delete(`/admin/plans/${deleteModalPlan.id}`);
            setPlans(plans.map(p => p.id === deleteModalPlan.id ? { ...p, isActive: false } : p));
            setDeleteModalPlan(null);
        } catch (error) {
            console.error('Failed to delete plan', error);
            alert('Failed to deactivate plan');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredPlans = plans.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <Loader2 className="animate-spin text-accent" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-primary">Manage Plans</h1>
                    <p className="text-muted mt-1">Create, edit, and orchestrate all telecom offerings.</p>
                </div>

                <button
                    onClick={() => handleOpenDrawer()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-hover text-white font-bold rounded-btn transition-all shadow-lg hover:-translate-y-[1px]"
                >
                    <Plus size={18} />
                    Add New Plan
                </button>
            </div>

            <div className="glass rounded-2xl shadow-card overflow-hidden flex flex-col">
                <div className="p-4 border-b border-black/5 bg-white/40 flex items-center justify-between">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search plans by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white rounded-md border border-black/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm transition-all"
                        />
                    </div>
                    <div className="text-sm font-semibold text-muted ml-4">
                        Total Plans: {plans.length}
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-black/5 text-xs uppercase tracking-wider text-muted font-semibold">
                                <th className="p-4 pl-6">Plan Info</th>
                                <th className="p-4">Price</th>
                                <th className="p-4">Data</th>
                                <th className="p-4">Minutes</th>
                                <th className="p-4">Subscribers</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 pr-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 text-sm">
                            {filteredPlans.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-12 text-center text-muted">
                                        No plans found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredPlans.map((plan) => (
                                    <tr key={plan.id} className={`hover:bg-white/50 transition-colors ${!plan.isActive ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                                        <td className="p-4 pl-6">
                                            <div className="font-display font-bold text-primary text-base mb-1">{plan.name}</div>
                                            <div className="text-xs text-muted flex gap-1">
                                                <span className="truncate max-w-[200px]">{plan.features.length} features configured</span>
                                            </div>
                                        </td>
                                        <td className="p-4 font-black text-text">${plan.price}</td>
                                        <td className="p-4 font-medium text-muted">{plan.dataGB === -1 ? 'Unlimited' : `${plan.dataGB} GB`}</td>
                                        <td className="p-4 font-medium text-muted">{plan.callMinutes === -1 ? 'Unlimited' : plan.callMinutes}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1.5 font-bold text-accent">
                                                <Users size={16} />
                                                {plan.subscribersCount || 0}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            {plan.isActive ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-success/10 text-success font-bold text-xs">
                                                    <CheckCircle2 size={12} /> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded bg-black/10 text-muted font-bold text-xs">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenDrawer(plan)}
                                                    className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors tooltip"
                                                    title="Edit Plan"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteModalPlan(plan)}
                                                    disabled={!plan.isActive}
                                                    className="p-2 text-danger hover:bg-danger/10 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                                    title="Deactivate Plan"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <PlanDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                plan={editingPlan}
                onSave={handleSavePlan}
            />

            {/* Delete Confirmation Modal */}
            {deleteModalPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteModalPlan(null)}></div>
                    <div className="relative bg-surface w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200 text-center">

                        <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={32} />
                        </div>

                        <h3 className="text-xl font-display font-bold text-primary mb-2">Deactivate Plan?</h3>
                        <p className="text-muted text-sm mb-6">
                            Are you sure you want to deactivate <strong>{deleteModalPlan.name}</strong>?
                            This will not affect existing subscribers, but it will hide the plan from new customers.
                        </p>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setDeleteModalPlan(null)}
                                disabled={isDeleting}
                                className="flex-1 py-2.5 bg-black/5 hover:bg-black/10 text-text font-bold rounded-btn transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="flex-1 py-2.5 bg-danger hover:bg-danger/90 text-white font-bold rounded-btn transition-colors shadow-lg disabled:opacity-70 flex justify-center items-center"
                            >
                                {isDeleting ? <Loader2 size={18} className="animate-spin" /> : 'Yes, Deactivate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ManagePlans;
