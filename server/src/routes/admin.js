const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

const router = express.Router();
const prisma = new PrismaClient();

// Apply auth and admin role guard to all admin routes
router.use(requireAuth);
router.use(requireRole('ADMIN'));

// GET /api/admin/dashboard - KPI stats
router.get('/dashboard', async (req, res) => {
    try {
        const totalCustomers = await prisma.user.count({ where: { role: 'CUSTOMER' } });
        const totalActivePlans = await prisma.plan.count({ where: { isActive: true } });

        // Changes this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const planChangesThisMonth = await prisma.planChange.count({
            where: { changedAt: { gte: startOfMonth } }
        });

        // Customers by Plan for Chart
        const customersByPlan = await prisma.plan.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                _count: {
                    select: { subscribers: true }
                }
            }
        });

        // Formatted for Recharts
        const chartData = customersByPlan.map(plan => ({
            name: plan.name,
            customers: plan._count.subscribers,
        }));

        // Find most popular plan
        const mostPopularPlan = chartData.reduce((prev, current) =>
            (prev.customers > current.customers) ? prev : current
            , { name: 'N/A', customers: 0 });

        const recentChanges = await prisma.planChange.findMany({
            take: 10,
            orderBy: { changedAt: 'desc' },
            include: {
                user: { select: { fullName: true, email: true } },
                toPlan: { select: { name: true } }
            }
        });

        // Format recent changes for frontend table
        const formattedRecentChanges = recentChanges.map(change => ({
            id: change.id,
            customerName: change.user.fullName,
            email: change.user.email,
            toPlan: change.toPlan.name,
            date: change.changedAt
        }));

        res.json({
            kpis: {
                totalCustomers,
                totalActivePlans,
                planChangesThisMonth,
                mostPopularPlan: mostPopularPlan.name
            },
            customersByPlan: chartData,
            recentChanges: formattedRecentChanges
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to load dashboard data' });
    }
});

// GET /api/admin/plans
router.get('/plans', async (req, res) => {
    try {
        const plans = await prisma.plan.findMany({
            include: {
                _count: {
                    select: { subscribers: true }
                }
            },
            orderBy: { price: 'asc' }
        });

        const formattedPlans = plans.map(p => ({
            ...p,
            features: JSON.parse(p.features),
            subscribersCount: p._count.subscribers
        }));

        res.json(formattedPlans);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch plans' });
    }
});

// POST /api/admin/plans
router.post('/plans', async (req, res) => {
    const { name, price, dataGB, callMinutes, smsCount, features, isActive } = req.body;
    try {
        const newPlan = await prisma.plan.create({
            data: {
                name,
                price,
                dataGB,
                callMinutes,
                smsCount,
                features: JSON.stringify(features || []),
                isActive: isActive !== undefined ? isActive : true
            }
        });

        res.status(201).json({ ...newPlan, features: JSON.parse(newPlan.features) });
    } catch (error) {
        console.error(error);
        if (error.code === 'P2002') return res.status(400).json({ error: 'Plan name already exists' });
        res.status(500).json({ error: 'Failed to create plan' });
    }
});

// PUT /api/admin/plans/:id
router.put('/plans/:id', async (req, res) => {
    const { id } = req.params;
    const { name, price, dataGB, callMinutes, smsCount, features, isActive } = req.body;

    try {
        const plan = await prisma.plan.update({
            where: { id: parseInt(id) },
            data: {
                name,
                price,
                dataGB,
                callMinutes,
                smsCount,
                features: features ? JSON.stringify(features) : undefined,
                isActive
            }
        });

        res.json({ ...plan, features: JSON.parse(plan.features) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update plan' });
    }
});

// DELETE /api/admin/plans/:id (Soft delete)
router.delete('/plans/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const plan = await prisma.plan.update({
            where: { id: parseInt(id) },
            data: { isActive: false }
        });

        res.json({ message: 'Plan deactivated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete plan' });
    }
});

// GET /api/admin/export - Return full audit data for export
router.get('/export', async (req, res) => {
    try {
        const changes = await prisma.planChange.findMany({
            include: {
                user: { select: { fullName: true, email: true, phone: true } },
                toPlan: { select: { name: true, price: true } }
            },
            orderBy: { changedAt: 'desc' }
        });

        const exportData = changes.map(c => ({
            ChangeID: c.id,
            Date: c.changedAt,
            CustomerName: c.user.fullName,
            CustomerEmail: c.user.email,
            Phone: c.user.phone || 'N/A',
            NewPlan: c.toPlan.name,
            MonthlyPrice: c.toPlan.price,
            Reason: c.reason || 'N/A'
        }));

        res.json(exportData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate export data' });
    }
});

module.exports = router;
