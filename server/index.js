/**
 * SplitCart – Express API Server
 */
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ─── GROUPS ───────────────────────────────────────────

app.post('/api/groups', (req, res) => {
  try {
    const { name, emoji } = req.body;
    if (!name) return res.status(400).json({ error: 'Group name is required' });
    const group = db.createGroup(name, emoji || '🏠');
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/groups', (req, res) => {
  try {
    res.json(db.getGroups());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/groups/:id', (req, res) => {
  try {
    const group = db.getGroup(parseInt(req.params.id));
    if (!group) return res.status(404).json({ error: 'Group not found' });
    const members = db.getMembers(group.id);
    const expenses = db.getExpenses(group.id);
    const total = db.getGroupTotal(group.id);
    const settlements = db.calculateSettlements(group.id);
    res.json({ ...group, members, expenses, totalExpenses: total, settlements });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/groups/:id', (req, res) => {
  try {
    db.deleteGroup(parseInt(req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── MEMBERS ──────────────────────────────────────────

app.post('/api/groups/:id/members', (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name) return res.status(400).json({ error: 'Member name is required' });
    const group = db.getGroup(parseInt(req.params.id));
    if (!group) return res.status(404).json({ error: 'Group not found' });
    db.addMember(parseInt(req.params.id), name, color);
    res.status(201).json(db.getMembers(parseInt(req.params.id)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/members/:id', (req, res) => {
  try {
    db.deleteMember(parseInt(req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── EXPENSES ─────────────────────────────────────────

app.post('/api/expenses', (req, res) => {
  try {
    const { group_id, description, amount, category, paid_by, split_type } = req.body;
    if (!group_id || !description || !amount || !paid_by) {
      return res.status(400).json({ error: 'group_id, description, amount, and paid_by are required' });
    }
    db.addExpense(group_id, description, amount, category, paid_by, split_type);
    const expenses = db.getExpenses(group_id);
    const settlements = db.calculateSettlements(group_id);
    res.status(201).json({ expenses, settlements });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/expenses/:id', (req, res) => {
  try {
    db.deleteExpense(parseInt(req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── SETTLEMENTS ──────────────────────────────────────

app.get('/api/groups/:id/settlements', (req, res) => {
  try {
    const settlements = db.calculateSettlements(parseInt(req.params.id));
    res.json(settlements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── START ────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n  🛒 SplitCart API running at http://localhost:${PORT}\n`);
});
