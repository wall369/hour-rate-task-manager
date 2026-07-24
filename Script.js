// Estado da Aplicação
let tasks = JSON.parse(localStorage.getItem('hourrate_tasks')) || [];
let hourlyRate = parseFloat(localStorage.getItem('hourrate_rate')) || 20;

// Elementos do DOM
const taskForm = document.getElementById('taskForm');
const taskTitleInput = document.getElementById('taskTitle');
const taskHoursInput = document.getElementById('taskHours');
const taskList = document.getElementById('taskList');
const hourlyRateInput = document.getElementById('hourlyRate');

// Configuração Inicial do Input de Taxa
hourlyRateInput.value = hourlyRate;

// Atualizar Taxa Horária
hourlyRateInput.addEventListener('input', (e) => {
  const value = parseFloat(e.target.value);
  hourlyRate = isNaN(value) ? 0 : value;
  localStorage.setItem('hourrate_rate', hourlyRate);
  updateDashboard();
  renderTasks();
});

// Adicionar Nova Tarefa
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = taskTitleInput.value.trim();
  const hours = parseFloat(taskHoursInput.value);

  if (!title || isNaN(hours) || hours <= 0) return;

  const newTask = {
    id: Date.now(),
    title: title,
    hours: hours,
    completed: false
  };

  tasks.push(newTask);
  saveAndRender();

  // Limpar formulário
  taskTitleInput.value = '';
  taskHoursInput.value = '';
  taskTitleInput.focus();
});

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

// Salvar no LocalStorage e Reordenar/Renderizar
function saveAndRender() {
  localStorage.setItem('hourrate_tasks', JSON.stringify(tasks));
  updateDashboard();
  renderTasks();
}

// Atualizar Cartões de Métricas
function updateDashboard() {
  const totalTasks = tasks.length;
  const totalHours = tasks.reduce((sum, task) => sum + task.hours, 0);
  const totalValue = totalHours * hourlyRate;
  const completedTasks = tasks.filter(t => t.completed).length;

  document.getElementById('totalTasks').textContent = totalTasks;
  document.getElementById('totalHours').textContent = `${totalHours}h`;
  document.getElementById('totalValue').textContent = `R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById('completedCounter').textContent = `${completedTasks} de ${totalTasks} concluídas`;
}

// Renderizar Lista de Tarefas no DOM
function renderTasks() {
  taskList.innerHTML = '';

  if (tasks.length === 0) {
    taskList.innerHTML = `<li class="empty-state">Nenhuma tarefa cadastrada. Adicione uma tarefa acima para começar!</li>`;
    return;
  }

  tasks.forEach(task => {
    const taskValue = task.hours * hourlyRate;
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;

    li.innerHTML = `
      <div class="task-info">
        <div class="task-title">${escapeHtml(task.title)}</div>
        <div class="task-meta">${task.hours}h estimada(s) • R$ ${taskValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
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

// Função de Segurança para Evitar Código Malicioso no Input
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Inicializar na Carga da Página
updateDashboard();
renderTasks();
