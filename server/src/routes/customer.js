const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Apply auth to all customer routes
router.use(requireAuth);

// GET /api/customers/me - Get full user profile with active plan
router.get('/me', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: {
                currentPlan: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.currentPlan) {
            user.currentPlan.features = JSON.parse(user.currentPlan.features);
        }

        // Don't send back the password hash
        const { passwordHash, ...safeUser } = user;
        res.json(safeUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

// GET /api/customers/plans - Get all ACTIVE plans
router.get('/plans', async (req, res) => {
    try {
        const plans = await prisma.plan.findMany({
            where: { isActive: true },
            orderBy: { price: 'asc' }
        });

        const formattedPlans = plans.map(p => ({
            ...p,
            features: JSON.parse(p.features)
        }));

        res.json(formattedPlans);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch available plans' });
    }
});

// GET /api/customers/history - Get plan change history for the logged-in user
router.get('/history', async (req, res) => {
    try {
        const history = await prisma.planChange.findMany({
            where: { userId: req.user.userId },
            orderBy: { changedAt: 'desc' },
            take: 5,
            include: {
                toPlan: { select: { name: true } }
            }
        });

        // To get the 'Changed From' name, we look at the previous record
        // In a robust system, we would store fromPlan correctly on the record itself
        // Or we fetch all history and map it. For simplicity in UI mock, we'll format it:

        const formattedHistory = history.map((record) => {
            return {
                id: record.id,
                date: record.changedAt,
                toPlan: record.toPlan.name,
                reason: record.reason
            };
        });

        res.json(formattedHistory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch plan history' });
    }
});

// POST /api/customers/change-plan
router.post('/change-plan', async (req, res) => {
    const { planId } = req.body;
    const userId = req.user.userId;

    try {
        // 1. Verify plan exists and is active
        const targetPlan = await prisma.plan.findUnique({
            where: { id: parseInt(planId) }
        });

        if (!targetPlan || !targetPlan.isActive) {
            return res.status(400).json({ error: 'Selected plan is not available.' });
        }

        // 2. Wrap in transaction: update user's current plan and create history record
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: userId }
            });

            if (user.currentPlanId === targetPlan.id) {
                throw new Error('You are already subscribed to this plan.');
            }

            await tx.user.update({
                where: { id: userId },
                data: { currentPlanId: targetPlan.id }
            });

            const planChange = await tx.planChange.create({
                data: {
                    userId: userId,
                    fromPlanId: user.currentPlanId,
                    toPlanId: targetPlan.id,
                    reason: 'Customer initiated switch'
                }
            });

            return { user, planChange, targetPlan };
        });

        res.json({
            success: true,
            message: `Successfully switched to ${result.targetPlan.name} plan!`,
            newPlanId: result.targetPlan.id
        });
    } catch (error) {
        console.error(error);
        if (error.message === 'You are already subscribed to this plan.') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to change plan' });
    }
});

module.exports = router;
