/**
 * SplitCart – App Dashboard Frontend
 */
import './app.css';
import { initParticles } from './particles.js';

const API = 'http://localhost:3001/api';

// Category emoji mapping
const CATEGORY_EMOJIS = {
  groceries: '🛒', vegetables: '🥬', fruits: '🍎', dairy: '🥛',
  snacks: '🍿', cleaning: '🧹', household: '🏠', beverages: '☕',
  meat: '🍖', general: '📦',
};

// ─── State ────────────────────────────────────────────
let groups = [];
let currentGroupId = null;
let currentGroup = null;

// ─── DOM Elements ─────────────────────────────────────
const $welcome = document.getElementById('app-welcome');
const $dashboard = document.getElementById('app-dashboard');
const $groupsList = document.getElementById('groups-list');
const $panelEmoji = document.getElementById('panel-emoji');
const $panelTitle = document.getElementById('panel-title');
const $statTotal = document.getElementById('stat-total');
const $statMembers = document.getElementById('stat-members');
const $statPerPerson = document.getElementById('stat-per-person');
const $membersGrid = document.getElementById('members-grid');
const $expensesList = document.getElementById('expenses-list');
const $settlementsList = document.getElementById('settlements-list');

// ─── API Helpers ──────────────────────────────────────
async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

// ─── Formatters ───────────────────────────────────────
function formatINR(amount) {
  return '₹' + Math.round(amount).toLocaleString('en-IN');
}

// ─── Load Groups ──────────────────────────────────────
async function loadGroups() {
  try {
    groups = await api('/groups');
    renderGroupsList();

    if (groups.length === 0) {
      $welcome.style.display = 'flex';
      $dashboard.style.display = 'none';
    } else {
      $welcome.style.display = 'none';
      $dashboard.style.display = 'flex';

      if (!currentGroupId || !groups.find(g => g.id === currentGroupId)) {
        selectGroup(groups[0].id);
      } else {
        selectGroup(currentGroupId);
      }
    }
  } catch (err) {
    console.error('Failed to load groups:', err);
    $welcome.style.display = 'flex';
    $dashboard.style.display = 'none';
  }
}

// ─── Render Groups List Sidebar ───────────────────────
function renderGroupsList() {
  $groupsList.innerHTML = groups.map(g => `
    <div class="group-item ${g.id === currentGroupId ? 'active' : ''}" data-id="${g.id}">
      <span class="group-item-emoji">${g.emoji}</span>
      <div class="group-item-info">
        <div class="group-item-name">${g.name}</div>
        <div class="group-item-meta">${g.memberCount} members · ${formatINR(g.totalExpenses)}</div>
      </div>
      <button class="group-delete-btn" data-delete-group="${g.id}" title="Delete group">✕</button>
    </div>
  `).join('');

  // Click handlers
  $groupsList.querySelectorAll('.group-item').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.group-delete-btn')) return;
      selectGroup(parseInt(el.dataset.id));
    });
  });

  $groupsList.querySelectorAll('.group-delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (confirm('Delete this group and all its data?')) {
        await api(`/groups/${btn.dataset.deleteGroup}`, { method: 'DELETE' });
        currentGroupId = null;
        loadGroups();
      }
    });
  });
}

// ─── Select Group ─────────────────────────────────────
async function selectGroup(id) {
  currentGroupId = id;
  try {
    currentGroup = await api(`/groups/${id}`);
    renderGroupDetail();
    renderGroupsList(); // Update active state
  } catch (err) {
    console.error('Failed to load group:', err);
  }
}

// ─── Render Group Detail ──────────────────────────────
function renderGroupDetail() {
  if (!currentGroup) return;

  $panelEmoji.textContent = currentGroup.emoji;
  $panelTitle.textContent = currentGroup.name;
  $statTotal.textContent = formatINR(currentGroup.totalExpenses);
  $statMembers.textContent = currentGroup.members.length;

  const perPerson = currentGroup.members.length > 0
    ? currentGroup.totalExpenses / currentGroup.members.length
    : 0;
  $statPerPerson.textContent = formatINR(perPerson);

  renderMembers();
  renderExpenses();
  renderSettlements();
}

// ─── Render Members ───────────────────────────────────
function renderMembers() {
  if (!currentGroup || currentGroup.members.length === 0) {
    $membersGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="empty-state-icon">👥</div>
        <p>No roommates yet. Add your first roommate to get started!</p>
      </div>`;
    return;
  }

  $membersGrid.innerHTML = currentGroup.members.map(m => `
    <div class="member-card">
      <div class="member-avatar" style="background: ${m.color};">${m.name.charAt(0).toUpperCase()}</div>
      <span class="member-name">${m.name}</span>
      <button class="member-delete" data-delete-member="${m.id}" title="Remove">✕</button>
    </div>
  `).join('');

  $membersGrid.querySelectorAll('.member-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      await api(`/members/${btn.dataset.deleteMember}`, { method: 'DELETE' });
      selectGroup(currentGroupId);
    });
  });
}

// ─── Render Expenses ──────────────────────────────────
function renderExpenses() {
  if (!currentGroup || currentGroup.expenses.length === 0) {
    $expensesList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📊</div>
        <p>No expenses yet. Add an expense to start tracking!</p>
      </div>`;
    return;
  }

  $expensesList.innerHTML = currentGroup.expenses.map(e => {
    const emoji = CATEGORY_EMOJIS[e.category] || '📦';
    const date = new Date(e.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    return `
      <div class="expense-item">
        <div class="expense-icon">${emoji}</div>
        <div class="expense-info">
          <div class="expense-desc">${e.description}</div>
          <div class="expense-meta">Paid by ${e.paid_by_name} · ${date}</div>
        </div>
        <span class="expense-amount">${formatINR(e.amount)}</span>
        <button class="expense-delete" data-delete-expense="${e.id}" title="Delete">✕</button>
      </div>`;
  }).join('');

  $expensesList.querySelectorAll('.expense-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      await api(`/expenses/${btn.dataset.deleteExpense}`, { method: 'DELETE' });
      selectGroup(currentGroupId);
    });
  });
}

// ─── Render Settlements ───────────────────────────────
function renderSettlements() {
  if (!currentGroup || currentGroup.settlements.length === 0) {
    $settlementsList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">✅</div>
        <p>${currentGroup && currentGroup.expenses.length > 0
          ? 'All settled! No payments needed.'
          : 'Add expenses to see auto-settlements.'}</p>
      </div>`;
    return;
  }

  $settlementsList.innerHTML = currentGroup.settlements.map(s => `
    <div class="settlement-card">
      <div class="settle-from">
        <div class="settle-avatar" style="background: ${s.from.color};">${s.from.name.charAt(0).toUpperCase()}</div>
        <span class="settle-name">${s.from.name}</span>
      </div>
      <div class="settle-arrow-wrap">
        <span class="settle-amount-badge">${formatINR(s.amount)}</span>
        <div class="settle-arrow-line"></div>
      </div>
      <div class="settle-to">
        <div class="settle-avatar" style="background: ${s.to.color};">${s.to.name.charAt(0).toUpperCase()}</div>
        <span class="settle-name">${s.to.name}</span>
      </div>
    </div>
  `).join('');
}

// ─── Tabs ─────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => { c.style.display = 'none'; c.classList.remove('active'); });
    btn.classList.add('active');
    const tab = document.getElementById(`tab-${btn.dataset.tab}`);
    tab.style.display = 'block';
    tab.classList.add('active');
  });
});

// ─── Modals ───────────────────────────────────────────
function openModal(id) {
  document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

// Close buttons
document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.modal-overlay').style.display = 'none';
  });
});

// Close on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.style.display = 'none';
  });
});

// ─── Create Group ─────────────────────────────────────
let selectedEmoji = '🏠';

document.querySelectorAll('.emoji-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.emoji-opt').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedEmoji = btn.dataset.emoji;
  });
});

document.getElementById('new-group-btn').addEventListener('click', () => openModal('modal-create-group'));
document.getElementById('sidebar-add-group').addEventListener('click', () => openModal('modal-create-group'));
document.getElementById('welcome-create-btn').addEventListener('click', () => openModal('modal-create-group'));

document.getElementById('form-create-group').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('input-group-name').value.trim();
  if (!name) return;
  try {
    const group = await api('/groups', { method: 'POST', body: { name, emoji: selectedEmoji } });
    closeModal('modal-create-group');
    document.getElementById('input-group-name').value = '';
    currentGroupId = group.id;
    loadGroups();
  } catch (err) {
    alert('Failed to create group: ' + err.message);
  }
});

// ─── Add Member ───────────────────────────────────────
document.getElementById('add-member-btn').addEventListener('click', () => openModal('modal-add-member'));

document.getElementById('form-add-member').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('input-member-name').value.trim();
  if (!name || !currentGroupId) return;
  try {
    await api(`/groups/${currentGroupId}/members`, { method: 'POST', body: { name } });
    closeModal('modal-add-member');
    document.getElementById('input-member-name').value = '';
    selectGroup(currentGroupId);
  } catch (err) {
    alert('Failed to add member: ' + err.message);
  }
});

// ─── Add Expense ──────────────────────────────────────
document.getElementById('add-expense-btn').addEventListener('click', () => {
  if (!currentGroup || currentGroup.members.length === 0) {
    alert('Please add at least one roommate first!');
    return;
  }
  // Populate paid_by dropdown
  const select = document.getElementById('input-expense-paidby');
  select.innerHTML = currentGroup.members.map(m =>
    `<option value="${m.id}">${m.name}</option>`
  ).join('');
  openModal('modal-add-expense');
});

document.getElementById('form-add-expense').addEventListener('submit', async (e) => {
  e.preventDefault();
  const description = document.getElementById('input-expense-desc').value.trim();
  const amount = parseFloat(document.getElementById('input-expense-amount').value);
  const category = document.getElementById('input-expense-category').value;
  const paid_by = parseInt(document.getElementById('input-expense-paidby').value);

  if (!description || !amount || !paid_by || !currentGroupId) return;
  try {
    await api('/expenses', {
      method: 'POST',
      body: { group_id: currentGroupId, description, amount, category, paid_by },
    });
    closeModal('modal-add-expense');
    document.getElementById('input-expense-desc').value = '';
    document.getElementById('input-expense-amount').value = '';
    selectGroup(currentGroupId);
  } catch (err) {
    alert('Failed to add expense: ' + err.message);
  }
});

// ─── Initialize ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  loadGroups();
});
