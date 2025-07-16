// DOM Elements
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const themeToggle = document.getElementById('theme-toggle');
const datetime = document.getElementById('datetime');
const themeIcon = document.getElementById('theme-icon');

// Storage keys
const TODOS_KEY = 'todos';
const THEME_KEY = 'theme';

// Helpers
function renderTodos(todos) {
  todoList.innerHTML = '';
  const emptyState = document.getElementById('empty-state');
  if (todos.length === 0) {
    emptyState.style.display = 'flex';
  } else {
    emptyState.style.display = 'none';
  }
  todos.forEach((todo, idx) => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.completed ? ' completed' : '');
    li.setAttribute('data-idx', idx);
    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => toggleTodo(idx));
    // Text or input
    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = todo.text;
    if (!todo.completed) {
      span.tabIndex = 0;
      span.title = 'Click to edit';
      span.addEventListener('click', () => startEditTodo(idx, todo.text, li));
      span.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          startEditTodo(idx, todo.text, li);
        }
      });
    }
    // Delete button
    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.innerHTML = '&times;';
    delBtn.title = 'Delete task';
    delBtn.addEventListener('click', () => animateDeleteTodo(idx, li));
    // Compose
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(delBtn);
    todoList.appendChild(li);
    setTimeout(() => li.classList.add('fade-in'), 10);
  });
}

function saveTodos(todos) {
  chrome.storage.sync.set({ [TODOS_KEY]: todos });
}

function loadTodos() {
  chrome.storage.sync.get([TODOS_KEY], (result) => {
    const todos = result[TODOS_KEY] || [];
    renderTodos(todos);
  });
}

function addTodo(text) {
  chrome.storage.sync.get([TODOS_KEY], (result) => {
    const todos = result[TODOS_KEY] || [];
    todos.unshift({ text, completed: false });
    saveTodos(todos);
    renderTodos(todos);
  });
}

function toggleTodo(idx) {
  chrome.storage.sync.get([TODOS_KEY], (result) => {
    const todos = result[TODOS_KEY] || [];
    todos[idx].completed = !todos[idx].completed;
    saveTodos(todos);
    renderTodos(todos);
  });
}

function deleteTodo(idx) {
  chrome.storage.sync.get([TODOS_KEY], (result) => {
    const todos = result[TODOS_KEY] || [];
    todos.splice(idx, 1);
    saveTodos(todos);
    renderTodos(todos);
  });
}

function animateDeleteTodo(idx, li) {
  li.classList.add('deleting');
  setTimeout(() => deleteTodo(idx), 300);
}

function startEditTodo(idx, text, li) {
  li.innerHTML = '';
  const input = document.createElement('input');
  input.type = 'text';
  input.value = text;
  input.className = 'todo-edit-input';
  input.maxLength = 100;
  input.style.flex = '1';
  input.style.fontSize = '1.05rem';
  input.style.borderRadius = '10px';
  input.style.padding = '7px 10px';
  input.style.marginRight = '8px';
  input.autofocus = true;
  // Save button
  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.className = 'edit-save-btn';
  saveBtn.style.marginRight = '6px';
  // Cancel button
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.className = 'edit-cancel-btn';
  // Handlers
  saveBtn.addEventListener('click', () => finishEditTodo(idx, input.value));
  cancelBtn.addEventListener('click', () => renderTodosFromStorage());
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') finishEditTodo(idx, input.value);
    if (e.key === 'Escape') renderTodosFromStorage();
  });
  li.appendChild(input);
  li.appendChild(saveBtn);
  li.appendChild(cancelBtn);
  input.focus();
}
function finishEditTodo(idx, newText) {
  chrome.storage.sync.get([TODOS_KEY], (result) => {
    const todos = result[TODOS_KEY] || [];
    if (newText.trim()) {
      todos[idx].text = newText.trim();
      saveTodos(todos);
      renderTodos(todos);
    } else {
      // If empty, delete
      todos.splice(idx, 1);
      saveTodos(todos);
      renderTodos(todos);
    }
  });
}
function renderTodosFromStorage() {
  chrome.storage.sync.get([TODOS_KEY], (result) => {
    const todos = result[TODOS_KEY] || [];
    renderTodos(todos);
  });
}

// Theme
function getSunSVG() {
  return `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><g><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></g></svg>`;
}
function getMoonSVG() {
  return `<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 0111.21 3c0 .34.02.67.05 1A7 7 0 0020 13.74c.33.03.66.05 1 .05.27 0 .54-.01.8-.03z"/></svg>`;
}
function updateThemeIcon() {
  const isDark = document.body.classList.contains('dark');
  themeIcon.innerHTML = isDark ? getSunSVG() : getMoonSVG();
  themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
}
function setTheme(theme) {
  document.body.classList.toggle('dark', theme === 'dark');
  chrome.storage.sync.set({ [THEME_KEY]: theme });
  updateThemeIcon();
}
function loadTheme() {
  chrome.storage.sync.get([THEME_KEY], (result) => {
    const theme = result[THEME_KEY] || 'light';
    setTheme(theme);
  });
}
themeToggle.addEventListener('click', () => {
  const isDark = document.body.classList.contains('dark');
  setTheme(isDark ? 'light' : 'dark');
});

// Date/Time
function updateDateTime() {
  const now = new Date();
  const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
  const dateStr = now.toLocaleDateString(undefined, options);
  const timeStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  datetime.textContent = `${dateStr} \u2014 ${timeStr}`;
}
setInterval(updateDateTime, 1000);
updateDateTime();

// Form submit
if (todoForm) {
  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (text) {
      addTodo(text);
      todoInput.value = '';
    }
  });
}

// Initial load
loadTodos();
loadTheme();
updateThemeIcon(); 