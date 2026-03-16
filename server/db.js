/**
 * SplitCart – Database Layer (JSON file-based storage)
 */
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data.json');

// Default data structure
const DEFAULT_DATA = {
  groups: [],
  members: [],
  expenses: [],
  nextGroupId: 1,
  nextMemberId: 1,
  nextExpenseId: 1,
};

function loadData() {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    }
  } catch (err) {
    console.error('Error loading data, starting fresh:', err.message);
  }
  return { ...DEFAULT_DATA };
}

function saveData(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

let data = loadData();

// ─── Groups ───────────────────────────────────────────

function createGroup(name, emoji = '🏠') {
  const group = {
    id: data.nextGroupId++,
    name,
    emoji,
    created_at: new Date().toISOString(),
  };
  data.groups.push(group);
  saveData(data);
  return group;
}

function getGroups() {
  return data.groups.map(g => ({
    ...g,
    memberCount: data.members.filter(m => m.group_id === g.id).length,
    totalExpenses: data.expenses
      .filter(e => e.group_id === g.id)
      .reduce((sum, e) => sum + e.amount, 0),
  }));
}

function getGroup(id) {
  return data.groups.find(g => g.id === id) || null;
}

function deleteGroup(id) {
  data.groups = data.groups.filter(g => g.id !== id);
  data.members = data.members.filter(m => m.group_id !== id);
  data.expenses = data.expenses.filter(e => e.group_id !== id);
  saveData(data);
}

// ─── Members ──────────────────────────────────────────

function addMember(groupId, name, color) {
  const hue = Math.floor(Math.random() * 360);
  const member = {
    id: data.nextMemberId++,
    group_id: groupId,
    name,
    color: color || `hsl(${hue}, 70%, 50%)`,
    created_at: new Date().toISOString(),
  };
  data.members.push(member);
  saveData(data);
  return member;
}

function getMembers(groupId) {
  return data.members.filter(m => m.group_id === groupId);
}

function deleteMember(id) {
  data.members = data.members.filter(m => m.id !== id);
  saveData(data);
}

// ─── Expenses ─────────────────────────────────────────

function addExpense(groupId, description, amount, category, paidBy, splitType) {
  const expense = {
    id: data.nextExpenseId++,
    group_id: groupId,
    description,
    amount,
    category: category || 'general',
    paid_by: paidBy,
    split_type: splitType || 'equal',
    created_at: new Date().toISOString(),
  };
  data.expenses.push(expense);
  saveData(data);
  return expense;
}

function getExpenses(groupId) {
  return data.expenses
    .filter(e => e.group_id === groupId)
    .map(e => {
      const payer = data.members.find(m => m.id === e.paid_by);
      return { ...e, paid_by_name: payer ? payer.name : 'Unknown' };
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function deleteExpense(id) {
  data.expenses = data.expenses.filter(e => e.id !== id);
  saveData(data);
}

function getGroupTotal(groupId) {
  return data.expenses
    .filter(e => e.group_id === groupId)
    .reduce((sum, e) => sum + e.amount, 0);
}

// ─── Settlement Algorithm ─────────────────────────────

function calculateSettlements(groupId) {
  const members = getMembers(groupId);
  const expenses = getExpenses(groupId);

  if (members.length === 0 || expenses.length === 0) return [];

  // Calculate net balance per member
  const balances = {};
  members.forEach(m => {
    balances[m.id] = { id: m.id, name: m.name, color: m.color, balance: 0 };
  });

  expenses.forEach(exp => {
    const splitCount = members.length;
    const share = exp.amount / splitCount;

    balances[exp.paid_by].balance += exp.amount - share;
    members.forEach(m => {
      if (m.id !== exp.paid_by) {
        balances[m.id].balance -= share;
      }
    });
  });

  // Separate into creditors and debtors
  const creditors = [];
  const debtors = [];

  Object.values(balances).forEach(b => {
    if (b.balance > 0.01) creditors.push({ ...b });
    else if (b.balance < -0.01) debtors.push({ ...b });
  });

  creditors.sort((a, b) => b.balance - a.balance);
  debtors.sort((a, b) => a.balance - b.balance);

  // Greedy settlement
  const settlements = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(-debtors[i].balance, creditors[j].balance);
    if (amount > 0.01) {
      settlements.push({
        from: { id: debtors[i].id, name: debtors[i].name, color: debtors[i].color },
        to: { id: creditors[j].id, name: creditors[j].name, color: creditors[j].color },
        amount: Math.round(amount * 100) / 100,
      });
    }
    debtors[i].balance += amount;
    creditors[j].balance -= amount;
    if (Math.abs(debtors[i].balance) < 0.01) i++;
    if (Math.abs(creditors[j].balance) < 0.01) j++;
  }

  return settlements;
}

module.exports = {
  createGroup, getGroups, getGroup, deleteGroup,
  addMember, getMembers, deleteMember,
  addExpense, getExpenses, deleteExpense, getGroupTotal,
  calculateSettlements,
};
