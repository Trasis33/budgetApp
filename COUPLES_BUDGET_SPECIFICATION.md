# CouplesFlow - Budget Management App Specification

**Last Updated:** August 18, 2025  
**Version:** 2.0 - Couples-Focused Restoration

---

## Executive Summary

CouplesFlow is a lightweight, mobile-first web application specifically designed for **couples to manage shared finances, split bills, and track personal spending patterns together**. This specification restores the app's original couples-focused vision while incorporating the advanced features that have been built.

### Core Mission
Replace manual spreadsheet-based expense tracking with an automated, couple-centric financial management system that promotes transparency, fairness, and shared financial goals.

---

## Target Users & Use Cases

### Primary Users
- **Committed couples** (married, cohabitating, or in serious relationships)
- **Swedish market focus** (SEK currency, local financial practices)
- **Mobile-first users** who want quick expense entry on-the-go
- **Privacy-conscious couples** who prefer self-hosted solutions

### Key User Stories
1. **"Quick Split Decision"** - Emma buys groceries for 500 SEK and instantly logs it as 50/50 split
2. **"Monthly Settlement"** - Fredrik and Emma review who owes whom at month-end
3. **"Recurring Bill Setup"** - Set up mortgage payment split once, auto-generate monthly
4. **"Budget Agreement"** - Both partners agree on monthly spending limits per category
5. **"Expense Transparency"** - Either partner can see all shared and personal expenses

---

## Couples-Centric Features

### 1. **Dual-User System**
- **Exactly 2 users per installation** (not scalable multi-user)
- **Partner-aware interface** showing "Your" vs "Partner's" expenses
- **Shared login option** or quick partner switching
- **Joint decision prompts** for budget changes affecting both

### 2. **Intelligent Bill Splitting**
- **Split Types:**
  - **50/50** (default for shared expenses)
  - **Custom ratio** (e.g., 60/40 based on income)
  - **Personal** (100% to one partner)
  - **Bill payer** (utilities paid by one, split automatically)
- **Smart categorization** suggesting split types based on category
- **Settlement calculations** with clear "who owes whom" messaging

### 3. **Shared Financial Dashboard**
- **Partner spending visibility** with permission-based privacy controls
- **Joint budget progress** showing both partners' contributions
- **Monthly balance summary** between partners
- **Shared savings goals** with dual progress tracking

### 4. **Communication & Approval Features**
- **Expense approval system** for large purchases above agreed threshold
- **Comment system** for expense clarification
- **Monthly review workflow** for settlement approval
- **Budget change notifications** requiring partner acknowledgment

---

## Technical Architecture

### Current State Assessment
The app has evolved into a comprehensive personal finance tool but has **lost its couples-specific focus**:

✅ **Well-Built Foundation:**
- React + Node.js + SQLite architecture
- JWT authentication system
- Advanced analytics and visualization
- Budget tracking and management
- Recurring expenses system

❌ **Missing Couples Features:**
- No partner-specific UI elements
- No expense approval workflows
- No shared decision interfaces
- Generic user system (not couple-specific)
- Missing split-aware expense forms

### Database Schema (Enhanced for Couples)

```sql
-- Enhanced Users Table (Limited to 2 users)
users (
  id, name, email, password, 
  partner_id,              -- Links to partner
  income_share_percentage, -- For automatic split ratios
  notification_preferences,
  created_at, updated_at
)

-- Enhanced Expenses Table (Couple-aware)
expenses (
  id, date, amount, description,
  category_id, paid_by_user_id,
  split_type,              -- '50/50', 'custom', 'personal', 'bill'
  split_ratio_user1,       -- Percentage for partner 1
  split_ratio_user2,       -- Percentage for partner 2
  approval_status,         -- 'pending', 'approved', 'disputed'
  approved_by_user_id,     -- If approval was required
  notes, comments,
  recurring_expense_id,
  created_at, updated_at
)

-- Monthly Settlement Tracking
monthly_settlements (
  id, month, year,
  user1_total_paid, user2_total_paid,
  user1_total_owed, user2_total_owed,
  settlement_amount,       -- Who owes how much
  settlement_direction,    -- Which partner owes
  status,                  -- 'calculated', 'reviewed', 'settled'
  settled_date,
  created_at, updated_at
)

-- Shared Budget Goals
shared_budgets (
  id, category_id, month, year,
  budget_amount,
  agreed_by_user1, agreed_by_user2,  -- Both must agree
  user1_contribution_limit,
  user2_contribution_limit,
  created_at, updated_at
)
```

---

## User Experience Design

### Mobile-First Couples Interface

#### 1. **Expense Entry Flow**
```
[Amount Entry] → [Category Select] → [Split Decision] → [Paid By] → [Submit]
                                   ↓
                    "Split with partner?" (Default: 50/50)
                    "Personal expense?" 
                    "Custom split?"
```

#### 2. **Dashboard Layout**
```
+----------------------------------+
|  👫 CouplesFlow          🔔 [3]  |
|  Emma & Fredrik                   |
+----------------------------------+
| 📊 This Month                    |
| Shared: 5,420 SEK               |
| Emma: 2,150 SEK | Fredrik: 980  |
| Settlement: Fredrik owes 585 SEK |
+----------------------------------+
| 🎯 Shared Goals                  |
| Groceries: 1,200/1,500 (80%)    |
| Entertainment: 450/800 (56%)     |
+----------------------------------+
```

#### 3. **Settlement Screen**
```
+----------------------------------+
| 💰 Monthly Settlement            |
| August 2025                      |
+----------------------------------+
| Shared Expenses: 4,320 SEK      |
| Emma paid: 2,150 SEK (50%)      |
| Fredrik paid: 980 SEK (23%)     |
|                                  |
| 🎯 RESULT:                      |
| Fredrik owes Emma 585 SEK       |
|                                  |
| [💬 Add Note] [✅ Approve]      |
+----------------------------------+
```

### Key UI/UX Principles

1. **Partner Visibility**: Always show both partners' data side by side
2. **Split-First Design**: Every expense entry assumes partner involvement
3. **Transparency by Default**: No hidden expenses unless explicitly personal
4. **Settlement Clarity**: Clear, unambiguous "who owes whom" language
5. **Shared Decision Making**: Important changes require both partners' input

---

## Implementation Roadmap

### Phase 1: Couples Foundation (Weeks 1-2)
**Priority: Critical - Restore Core Mission**

#### A. Enhanced User System
- [ ] **Limit system to exactly 2 users**
- [ ] **Add partner linking in user profiles**
- [ ] **Create partner-switching interface**
- [ ] **Add partner notification system**

#### B. Couples-Aware Expense Entry
- [ ] **Redesign AddExpense form with split-first UI**
- [ ] **Add "paid by partner" quick selection**
- [ ] **Implement split type decision tree**
- [ ] **Create expense approval workflow for large amounts**

#### C. Enhanced Settlement System
- [ ] **Restore and improve BillSplitter page**
- [ ] **Create monthly settlement approval flow**
- [ ] **Add settlement history and trends**
- [ ] **Build "settle up" confirmation system**

### Phase 2: Shared Decision Making (Weeks 3-4)
**Priority: High - Collaborative Features**

#### A. Budget Collaboration
- [ ] **Shared budget setting interface**
- [ ] **Partner approval for budget changes**
- [ ] **Joint savings goals system**
- [ ] **Spending limit notifications**

#### B. Communication Features  
- [ ] **Expense comment system**
- [ ] **Monthly review workflow**
- [ ] **Expense dispute resolution**
- [ ] **Partner notification preferences**

### Phase 3: Advanced Couples Analytics (Weeks 5-6)
**Priority: Medium - Enhanced Insights**

#### A. Couples-Specific Analytics
- [ ] **Partner spending comparison charts**
- [ ] **Fair share analysis over time**
- [ ] **Joint vs personal expense trends**
- [ ] **Settlement history visualization**

#### B. Financial Health for Couples
- [ ] **Couples savings rate tracking**
- [ ] **Joint financial goal progress**
- [ ] **Spending pattern compatibility analysis**
- [ ] **Budget fairness metrics**

---

## Success Metrics

### Quantitative Goals
- **Daily active usage by both partners**
- **<30 seconds average expense entry time**
- **Monthly settlement review completion rate >90%**
- **Zero manual calculation errors**
- **Settlement disputes <5% of transactions**

### Qualitative Goals
- **"We don't argue about money anymore"** - Transparency reduces conflict
- **"It's faster than our old Numbers spreadsheet"** - Efficiency improvement
- **"We both know where our money goes"** - Shared visibility
- **"Fair splits happen automatically"** - Trust in the system

---

## Key Differentiators

### What makes CouplesFlow unique:

1. **Couples-First Design**: Built specifically for 2-person households, not adapted from general personal finance apps

2. **Split-Aware by Default**: Every expense assumes potential partner involvement, rather than treating splitting as an afterthought

3. **Transparency Without Judgment**: Partners can see each other's spending without controlling it

4. **Settlement Automation**: Eliminates manual calculation and "who paid for what" arguments

5. **Collaborative Budget Management**: Both partners must agree on spending limits, fostering communication

6. **Mobile-Optimized for Real Usage**: Quick expense entry while grocery shopping, not desktop-focused analysis

---

## Technical Migration Plan

### Current State → Couples-Focused State

1. **Database Enhancements**
   - Add partner relationship fields
   - Enhance expense tracking for approvals
   - Create settlement tracking tables

2. **UI/UX Overhaul**
   - Redesign all forms to be split-aware
   - Add partner-specific dashboard elements
   - Create settlement and approval interfaces

3. **API Enhancements**
   - Add partner-aware endpoints
   - Implement approval workflows
   - Create settlement calculation services

4. **Feature Restoration**
   - Bring back and improve BillSplitter
   - Enhance recurring expenses for couples
   - Create partner notification system

---

## Conclusion

CouplesFlow represents a return to the original vision: **a purpose-built tool for couples to manage money together transparently and fairly**. By focusing on the unique needs of 2-person households, we can create something much more valuable than generic personal finance software.

The app should feel like **"our money management system"** rather than **"a finance app we both use"**.

**Next Steps**: Begin Phase 1 implementation to restore couples-specific features while preserving the advanced analytics and visualization capabilities that have been built.
