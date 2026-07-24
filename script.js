// Estado da Aplicação
let tasks = [];

// Tenta carregar as tarefas com tratamento de erro
try {
  const savedTasks = localStorage.getItem('hourrate_tasks');
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
  }
} catch (e) {
  console.error('Erro ao carregar do localStorage:', e);
  tasks = [];
}

// Elementos do DOM
const taskForm = document.getElementById('taskForm');
const taskTitleInput = document.getElementById('taskTitle');
const taskHoursInput = document.getElementById('taskHours');
const taskRateInput = document.getElementById('taskRate');
const taskList = document.getElementById('taskList');

// Adicionar Nova Tarefa
if (taskForm) {
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = taskTitleInput.value.trim();
    const hours = parseFloat(taskHoursInput.value);
    const rate = parseFloat(taskRateInput.value);

    // Validação dos dados digitados
    if (!title || isNaN(hours) || hours <= 0 || isNaN(rate) || rate <= 0) {
      alert('Por favor, preencha todos os campos com valores válidos.');
      return;
    }

    const newTask = {
      id: Date.now(),
      title: title,
      hours: hours,
      rate: rate,
      completed: false
    };

    tasks.push(newTask);
    saveAndRender();

    // Limpar campos
    taskTitleInput.value = '';
    taskHoursInput.value = '';
    taskRateInput.value = '20';
    taskTitleInput.focus();
  });
}

// Alternar Conclusão
function toggleTask(id) {
  tasks = tasks.map(task => 
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveAndRender();
}

// Deletar Tarefa
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveAndRender();
}

// Salvar no LocalStorage e Renderizar
function saveAndRender() {
  try {
    localStorage.setItem('hourrate_tasks', JSON.stringify(tasks));
  } catch (e) {
    console.error('Erro ao salvar no localStorage:', e);
  }
  updateDashboard();
  renderTasks();
}

// Atualizar Cartões de Métricas
function updateDashboard() {
  const totalTasksEl = document.getElementById('totalTasks');
  const totalHoursEl = document.getElementById('totalHours');
  const totalValueEl = document.getElementById('totalValue');
  const completedCounterEl = document.getElementById('completedCounter');

  if (!totalTasksEl || !totalHoursEl || !totalValueEl) return;

  const totalTasks = tasks.length;
  const totalHours = tasks.reduce((sum, task) => sum + (Number(task.hours) || 0), 0);
  const totalValue = tasks.reduce((sum, task) => {
    const hours = Number(task.hours) || 0;
    const rate = Number(task.rate) || 20;
    return sum + (hours * rate);
  }, 0);
  
  const completedTasks = tasks.filter(t => t.completed).length;

  totalTasksEl.textContent = totalTasks;
  totalHoursEl.textContent = `${totalHours}h`;
  totalValueEl.textContent = `R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (completedCounterEl) {
    completedCounterEl.textContent = `${completedTasks} de ${totalTasks} concluídas`;
  }
}

// Renderizar Lista de Tarefas no DOM
function renderTasks() {
  if (!taskList) return;
  taskList.innerHTML = '';

  if (tasks.length === 0) {
    taskList.innerHTML = `<li class="empty-state">Nenhuma tarefa cadastrada. Adicione uma tarefa acima para começar!</li>`;
    return;
  }

  tasks.forEach(task => {
    const hours = Number(task.hours) || 0;
    const rate = Number(task.rate) || 20;
    const taskValue = hours * rate;

    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;

    li.innerHTML = `
      <div class="task-info">
        <div class="task-title">${escapeHtml(task.title)}</div>
        <div class="task-meta">${hours}h • R$ ${rate.toFixed(2)}/h • Total: R$ ${taskValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      </div>
      <div class="task-actions">
        <button class="btn-action btn-toggle" onclick="toggleTask(${task.id})">
          ${task.completed ? 'Desfazer' : 'Concluir'}
        </button>
        <button class="btn-action btn-delete" onclick="deleteTask(${task.id})">
          Excluir
        </button>
      </div>
    `;

    taskList.appendChild(li);
  });
}

// Segurança básica de texto
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  updateDashboard();
  renderTasks();
});
