import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Users, Loader2 } from 'lucide-react';
import api from '../../services/api';

const PlanDrawer = ({ isOpen, onClose, plan, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        dataGB: '',
        callMinutes: '',
        smsCount: '',
        features: [],
        isActive: true
    });

    const [featureInput, setFeatureInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (plan) {
            setFormData({
                ...plan,
                dataGB: plan.dataGB === -1 ? '' : plan.dataGB,
                callMinutes: plan.callMinutes === -1 ? '' : plan.callMinutes,
                smsCount: plan.smsCount === -1 ? '' : plan.smsCount,
            });
        } else {
            setFormData({
                name: '', price: '', dataGB: '', callMinutes: '', smsCount: '', features: [], isActive: true
            });
        }
        setFeatureInput('');
    }, [plan, isOpen]);

    const handleAddFeature = (e) => {
        if (e.key === 'Enter' && featureInput.trim() !== '') {
            e.preventDefault();
            setFormData({ ...formData, features: [...formData.features, featureInput.trim()] });
            setFeatureInput('');
        }
    };

    const handleRemoveFeature = (index) => {
        const newFeatures = [...formData.features];
        newFeatures.splice(index, 1);
        setFormData({ ...formData, features: newFeatures });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Convert empty fields to -1 (Unlimited)
        const payload = {
            ...formData,
            price: parseFloat(formData.price),
            dataGB: formData.dataGB === '' ? -1 : parseInt(formData.dataGB),
            callMinutes: formData.callMinutes === '' ? -1 : parseInt(formData.callMinutes),
            smsCount: formData.smsCount === '' ? -1 : parseInt(formData.smsCount),
        };

        try {
            if (plan?.id) {
                const res = await api.put(`/admin/plans/${plan.id}`, payload);
                onSave(res.data, 'update');
            } else {
                const res = await api.post('/admin/plans', payload);
                onSave(res.data, 'create');
            }
            onClose();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Failed to save plan');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />
            <div className={`fixed right-0 top-0 bottom-0 w-full max-w-md bg-surface z-50 shadow-[0_0_40px_rgba(0,0,0,0.1)] transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                <div className="flex items-center justify-between p-6 border-b border-black/5">
                    <h2 className="text-xl font-display font-bold text-primary">
                        {plan ? 'Edit Plan' : 'Add New Plan'}
                    </h2>
                    <button onClick={onClose} className="p-2 text-muted hover:text-text rounded-full hover:bg-black/5 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <form id="plan-form" onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-text mb-1.5">Plan Name</label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-btn border border-black/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                                placeholder="e.g. Básico"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-text mb-1.5">Monthly Price (MXN)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-muted font-medium">$</span>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full pl-8 pr-4 py-2.5 rounded-btn border border-black/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-text mb-1.5 flex justify-between">
                                    Data (GB) <span className="text-muted font-normal text-xs">(Leave empty = Unlimited)</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.dataGB}
                                    onChange={(e) => setFormData({ ...formData, dataGB: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-btn border border-black/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                                    placeholder="Unlimited"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-text mb-1.5">Call Minutes</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.callMinutes}
                                    onChange={(e) => setFormData({ ...formData, callMinutes: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-btn border border-black/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                                    placeholder="Unlimited"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-text mb-1.5">SMS Count</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.smsCount}
                                    onChange={(e) => setFormData({ ...formData, smsCount: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-btn border border-black/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                                    placeholder="Unlimited"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-text mb-1.5">
                                Features <span className="text-muted font-normal text-xs">(Press Enter to add)</span>
                            </label>

                            <div className="flex flex-wrap gap-2 mb-3">
                                {formData.features.map((feature, idx) => (
                                    <span key={idx} className="bg-accent/10 border border-accent/20 text-accent text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5">
                                        {feature}
                                        <button type="button" onClick={() => handleRemoveFeature(idx)} className="hover:text-danger hover:bg-danger/10 rounded-full p-0.5 transition-colors">
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>

                            <input
                                type="text"
                                value={featureInput}
                                onChange={(e) => setFeatureInput(e.target.value)}
                                onKeyDown={handleAddFeature}
                                className="w-full px-4 py-2.5 rounded-btn border border-black/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                                placeholder="Type feature and press Enter"
                            />
                        </div>

                        <div className="pt-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-5 h-5 accent-accent"
                                />
                                <span className="font-semibold text-text">Plan is Active</span>
                            </label>
                            <p className="text-xs text-muted ml-8 mt-1">Inactive plans are hidden from customers.</p>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-black/5 flex gap-3 bg-bg">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 font-semibold text-text bg-black/5 hover:bg-black/10 rounded-btn transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="plan-form"
                        disabled={isSubmitting}
                        className="flex-1 py-3 font-semibold text-white bg-accent hover:bg-accent-hover shadow-lg rounded-btn transition-all hover:-translate-y-[1px] disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center"
                    >
                        {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : 'Save Plan'}
                    </button>
                </div>
            </div>
        </>
    );
};

export default PlanDrawer;
