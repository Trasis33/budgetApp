const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const db = require('../db/database');
const auth = require('../middleware/auth');

const normalizeAmount = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const isSharedSplit = (splitType) => {
  if (!splitType) return true;
  const normalized = String(splitType).toLowerCase();
  return !['personal', 'personal_only'].includes(normalized);
};

router.post(
  '/link',
  auth,
  [check('partnerEmail').isEmail().withMessage('Valid partner email required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { partnerEmail } = req.body;
    const currentUserId = req.user.id;

    try {
      const [currentUser, partnerCandidate] = await Promise.all([
        db('users').where('id', currentUserId).first(),
        db('users').where('email', partnerEmail).first(),
      ]);

      if (!currentUser) {
        return res.status(404).json({ message: 'Current user not found' });
      }

      if (!partnerCandidate) {
        return res.status(404).json({ message: 'Partner account not found' });
      }

      if (partnerCandidate.id === currentUserId) {
        return res.status(400).json({ message: 'Cannot link to your own account' });
      }

      if (currentUser.partner_id && currentUser.partner_id !== partnerCandidate.id) {
        return res.status(409).json({ message: 'You are already linked to another partner' });
      }

      if (partnerCandidate.partner_id && partnerCandidate.partner_id !== currentUserId) {
        return res.status(409).json({ message: 'Partner account is already linked to someone else' });
      }

      await db.transaction(async (trx) => {
        await trx('users').where('id', currentUserId).update({ partner_id: partnerCandidate.id });
        await trx('users').where('id', partnerCandidate.id).update({ partner_id: currentUserId });
      });

      return res.json({
        message: 'Partner linked successfully',
        couple: {
          connected: true,
          user: {
            id: currentUserId,
            name: currentUser.name,
            email: currentUser.email,
          },
          partner: {
            id: partnerCandidate.id,
            name: partnerCandidate.name,
            email: partnerCandidate.email,
          },
        },
      });
    } catch (error) {
      console.error('Failed to link partner account', error);
      return res.status(500).json({ message: 'Unable to link partner at this time' });
    }
  }
);

router.get('/summary', auth, async (req, res) => {
  try {
    const currentUser = await db('users').where('id', req.user.id).first();

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    let partner = null;
    if (currentUser.partner_id) {
      partner = await db('users').where('id', currentUser.partner_id).first();
      if (!partner) {
        // If the partner record is missing, clear the dangling reference
        await db('users').where('id', currentUser.id).update({ partner_id: null });
      }
    }

    const payerIds = partner ? [currentUser.id, partner.id] : [currentUser.id];

    const expenses = await db('expenses')
      .select('amount', 'paid_by_user_id', 'split_type')
      .whereIn('paid_by_user_id', payerIds);

    const totals = expenses.reduce(
      (acc, expense) => {
        const amount = normalizeAmount(expense.amount);
        if (expense.paid_by_user_id === currentUser.id) {
          acc.mine += amount;
        }
        if (partner && expense.paid_by_user_id === partner.id) {
          acc.partner += amount;
        }
        if (partner) {
          if (isSharedSplit(expense.split_type)) {
            acc.ours += amount;
          }
        } else {
          acc.ours += amount;
        }
        return acc;
      },
      { ours: 0, mine: 0, partner: 0 }
    );

    const responsePayload = {
      couple: {
        connected: Boolean(partner),
        user: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          color: currentUser.color || null,
        },
        partner: partner
          ? {
              id: partner.id,
              name: partner.name,
              email: partner.email,
              color: partner.color || null,
            }
          : null,
      },
      totals: {
        ours: Number(totals.ours.toFixed(2)),
        mine: Number(totals.mine.toFixed(2)),
        partner: Number(totals.partner.toFixed(2)),
      },
      metadata: {
        currency: 'SEK',
        lastUpdated: new Date().toISOString(),
      },
    };

    return res.json(responsePayload);
  } catch (error) {
    console.error('Failed to load couple summary', error);
    return res.status(500).json({ message: 'Unable to fetch couple summary' });
  }
});

module.exports = router;
