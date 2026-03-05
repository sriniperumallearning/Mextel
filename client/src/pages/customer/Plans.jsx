import React, { useState, useEffect } from 'react';
import { Check, X, Smartphone, Wifi, MessageSquare, ArrowRight, Loader2 } from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const PlanCard = ({ plan, currentPlanId, onSelect, isPopular }) => {
    const isCurrent = plan.id === currentPlanId;

    return (
        <div className={`relative glass rounded-2xl p-6 shadow-card transition-all duration-300 hover:shadow-card-hover group border-2 ${isCurrent ? 'border-primary' : isPopular ? 'border-accent' : 'border-transparent'}`}>

            {isPopular && !isCurrent && (
                <div className="absolute top-0 right-6 -translate-y-1/2 bg-accent text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    Most Popular
                </div>
            )}

            {isCurrent && (
                <div className="absolute top-0 right-6 -translate-y-1/2 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    Current Plan
                </div>
            )}

            <h3 className="text-2xl font-display font-black text-primary mb-2">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-accent">${plan.price}</span>
                <span className="text-muted text-sm font-medium">MXN /mo</span>
            </div>

            <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                        <Wifi size={16} />
                    </div>
                    <span className="font-medium text-text">{plan.dataGB === -1 ? 'Unlimited' : `${plan.dataGB} GB`} Data</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center text-success">
                        <Smartphone size={16} />
                    </div>
                    <span className="font-medium text-text">{plan.callMinutes === -1 ? 'Unlimited' : plan.callMinutes} Minutes</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center text-warning">
                        <MessageSquare size={16} />
                    </div>
                    <span className="font-medium text-text">{plan.smsCount === -1 ? 'Unlimited' : plan.smsCount} SMS</span>
                </div>
            </div>

            <div className="space-y-3 mb-8">
                <p className="text-sm font-bold text-primary border-b border-black/5 pb-2">Features</p>
                {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                        <Check size={16} className="text-accent mt-0.5 shrink-0" />
                        <span className="text-sm text-muted">{feature}</span>
                    </div>
                ))}
            </div>

            <button
                onClick={() => onSelect(plan)}
                disabled={isCurrent}
                className={`w-full py-3 rounded-btn font-bold transition-all flex items-center justify-center gap-2
          ${isCurrent
                        ? 'bg-black/5 text-muted cursor-not-allowed'
                        : 'bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                    }`}
            >
                {isCurrent ? 'Active Plan' : 'Select Plan'}
                {!isCurrent && <ArrowRight size={16} />}
            </button>

        </div>
    );
};

const ConfirmModal = ({ isOpen, onClose, onConfirm, fromPlan, toPlan, isLoading }) => {
    if (!isOpen) return null;

    const priceDiff = toPlan.price - (fromPlan?.price || 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative glass w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">

                <button onClick={onClose} className="absolute right-4 top-4 text-muted hover:text-text">
                    <X size={20} />
                </button>

                <h3 className="text-2xl font-display font-bold text-primary mb-2">Confirm Plan Change</h3>
                <p className="text-muted text-sm mb-6">You are switching from {fromPlan?.name || 'No Plan'} to {toPlan.name}.</p>

                <div className="bg-bg rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-medium text-text">New Monthly Price</span>
                        <span className="text-2xl font-black text-primary">${toPlan.price}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm border-t border-black/5 pt-3">
                        <span className="text-muted">Price Difference</span>
                        <span className={`font-bold ${priceDiff > 0 ? 'text-warning' : priceDiff < 0 ? 'text-success' : 'text-muted'}`}>
                            {priceDiff > 0 ? '+' : ''}{priceDiff} MXN /mo
                        </span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 py-3 bg-black/5 hover:bg-black/10 text-text font-bold rounded-btn transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 py-3 bg-accent hover:bg-accent-hover text-white font-bold rounded-btn transition-all shadow-lg flex items-center justify-center disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Confirm Change'}
                    </button>
                </div>

            </div>
        </div>
    );
};

const BrowsePlans = () => {
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
    const [selectedPlanModal, setSelectedPlanModal] = useState(null);
    const [isChangingPlan, setIsChangingPlan] = useState(false);
    const [toastMap, setToastMap] = useState(null);

    const { user, updateUser } = useAuthStore();
    const currentPlanId = user?.currentPlanId;
    const currentPlan = user?.currentPlan;

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await api.get('/customers/plans');
                setPlans(response.data);
            } catch (error) {
                console.error("Failed to fetch plans", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const handleSelectPlan = (plan) => {
        setSelectedPlanModal(plan);
    };

    const confirmPlanChange = async () => {
        setIsChangingPlan(true);
        try {
            const res = await api.post('/customers/change-plan', { planId: selectedPlanModal.id });

            // Show short toast
            setToastMap({ type: 'success', message: res.data.message });

            // Update local storage / global state
            updateUser({
                currentPlanId: selectedPlanModal.id,
                currentPlan: selectedPlanModal
            });

            setTimeout(() => setToastMap(null), 4000);
            setSelectedPlanModal(null);
        } catch (error) {
            setToastMap({ type: 'error', message: error.response?.data?.error || 'Failed to change plan' });
            setTimeout(() => setToastMap(null), 4000);
        } finally {
            setIsChangingPlan(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <Loader2 className="animate-spin text-accent" size={32} />
            </div>
        );
    }

    // Extract all unique features across all plans for the comparison table
    const allFeaturesSet = new Set();
    plans.forEach(p => p.features.forEach(f => allFeaturesSet.add(f)));
    const allFeatures = Array.from(allFeaturesSet);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Toast Notification */}
            {toastMap && (
                <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${toastMap.type === 'success' ? 'bg-success text-white' : 'bg-danger text-white'
                    }`}>
                    {toastMap.type === 'success' ? <Check size={20} /> : <X size={20} />}
                    <span className="font-bold">{toastMap.message}</span>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-primary">Browse Plans</h1>
                    <p className="text-muted mt-1">Find the perfect plan for your needs.</p>
                </div>

                {/* View Toggle */}
                <div className="flex bg-black/5 p-1 rounded-pill w-fit">
                    <button
                        onClick={() => setViewMode('cards')}
                        className={`px-4 py-1.5 text-sm font-bold rounded-pill transition-all ${viewMode === 'cards' ? 'bg-white text-primary shadow' : 'text-muted hover:text-text'
                            }`}
                    >
                        Grid
                    </button>
                    <button
                        onClick={() => setViewMode('table')}
                        className={`px-4 py-1.5 text-sm font-bold rounded-pill transition-all ${viewMode === 'table' ? 'bg-white text-primary shadow' : 'text-muted hover:text-text'
                            }`}
                    >
                        Compare
                    </button>
                </div>
            </div>

            {viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                    {plans.map(plan => (
                        <PlanCard
                            key={plan.id}
                            plan={plan}
                            currentPlanId={currentPlanId}
                            onSelect={handleSelectPlan}
                            isPopular={plan.name === 'Estándar'}
                        />
                    ))}
                </div>
            ) : (
                /* Comparison Table View */
                <div className="glass rounded-2xl overflow-hidden shadow-card overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr>
                                <th className="p-6 bg-black/5 w-1/4"></th>
                                {plans.map(plan => (
                                    <th key={plan.id} className={`p-6 bg-black/5 ${plan.name === 'Estándar' ? 'border-t-4 border-accent' : ''}`}>
                                        <div className="text-sm text-accent font-bold mb-1 tracking-wider uppercase">
                                            {plan.name === 'Estándar' ? 'Popular' : ''}
                                            {currentPlanId === plan.id && !('Estándar' === plan.name) ? 'Active' : ''}
                                            {currentPlanId === plan.id && 'Estándar' === plan.name ? ' • Active' : ''}
                                        </div>
                                        <div className="text-xl font-display font-bold text-primary">{plan.name}</div>
                                        <div className="mt-2 text-2xl font-black text-text">${plan.price}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 text-sm">
                            <tr>
                                <td className="p-4 pl-6 font-bold text-primary bg-white/40">Data</td>
                                {plans.map(plan => (
                                    <td key={plan.id} className="p-4 font-medium text-text bg-white/40">
                                        {plan.dataGB === -1 ? 'Unlimited' : `${plan.dataGB} GB`}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="p-4 pl-6 font-bold text-primary">Minutes</td>
                                {plans.map(plan => (
                                    <td key={plan.id} className="p-4 font-medium text-text">
                                        {plan.callMinutes === -1 ? 'Unlimited' : plan.callMinutes}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="p-4 pl-6 font-bold text-primary bg-white/40">SMS</td>
                                {plans.map(plan => (
                                    <td key={plan.id} className="p-4 font-medium text-text bg-white/40">
                                        {plan.smsCount === -1 ? 'Unlimited' : plan.smsCount}
                                    </td>
                                ))}
                            </tr>
                            {/* Dynamic Features Rows */}
                            {allFeatures.map((feature, idx) => (
                                <tr key={idx} className={idx % 2 === 0 ? '' : 'bg-white/40'}>
                                    <td className="p-4 pl-6 text-muted">{feature}</td>
                                    {plans.map(plan => (
                                        <td key={plan.id} className="p-4 text-center text-text">
                                            {plan.features.includes(feature)
                                                ? <Check size={20} className="text-success mx-auto" />
                                                : <X size={20} className="text-muted/30 mx-auto" />
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            <tr>
                                <td className="p-6 bg-black/5"></td>
                                {plans.map(plan => (
                                    <td key={plan.id} className="p-6 bg-black/5">
                                        <button
                                            onClick={() => handleSelectPlan(plan)}
                                            disabled={currentPlanId === plan.id}
                                            className={`w-full py-2.5 rounded-btn font-bold transition-all text-sm
                        ${currentPlanId === plan.id
                                                    ? 'bg-black/10 text-muted cursor-not-allowed'
                                                    : 'bg-primary hover:bg-primary/90 text-white shadow-md hover:-translate-y-[1px]'
                                                }`}
                                        >
                                            {currentPlanId === plan.id ? 'Active' : 'Select'}
                                        </button>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {selectedPlanModal && (
                <ConfirmModal
                    isOpen={true}
                    onClose={() => setSelectedPlanModal(null)}
                    onConfirm={confirmPlanChange}
                    fromPlan={currentPlan}
                    toPlan={selectedPlanModal}
                    isLoading={isChangingPlan}
                />
            )}

        </div>
    );
};

export default BrowsePlans;
