console.info('[Planner] index-page.js loaded');
let tasks = [];
let antiForgeryToken = '';
let autoRefreshInterval = null;

function getCurrentLanguage() {
    return (typeof window !== 'undefined' && window.currentLanguage) || localStorage.getItem('language') || 'en';
}

function getAntiForgeryToken() {
    const tokenInput = document.querySelector('input[name="__RequestVerificationToken"]');
    return tokenInput ? tokenInput.value : '';
}

function loadTasks() {
    console.debug('[Planner] loadTasks() called');
    const taskDataElement = document.getElementById('task-data');
    if (taskDataElement) {
        try {
            const rawTasks = JSON.parse(taskDataElement.textContent);
            console.debug('[Planner] rawTasks from server:', rawTasks);
            tasks = rawTasks.filter(task =>
                task && (task.Name || task.name) && (task.Name || task.name).trim() !== '' && (task.Name || task.name) !== 'undefined'
            );
            console.debug('[Planner] tasks after filter:', tasks);
            try { window.tasks = tasks; } catch(_) {}
            updateCounters();
        } catch (e) {
            console.error('[Planner] Error parsing task data:', e);
            tasks = [];
            updateCounters();
        }
    }
}

async function refreshTasks() {
    const activeStatItem = document.querySelector('.clickable-stat.active');
    if (activeStatItem) {
        console.log('Refresh cancelled - task list is active');
        return;
    }

    try {
        const response = await fetch('/?handler=GetTasks', {
            method: 'GET',
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });
        if (response.ok) {
            const newTasks = await response.json();
            const oldCount = tasks.length;
            const filteredTasks = newTasks.filter(task =>
                task && (task.Name || task.name) && (task.Name || task.name).trim() !== '' && (task.Name || task.name) !== 'undefined'
            );
            if (filteredTasks.length > 0 || filteredTasks.length !== oldCount) {
                tasks = filteredTasks;
                try { window.tasks = tasks; } catch(_) {}
                updateCounters();
                const activeItem = document.querySelector('.clickable-stat.active');
                if (activeItem) {
                    const taskType = activeItem.getAttribute('data-task-type');
                    showTasks(taskType);
                }
            }
        }
    } catch (error) {
        console.error('[Planner] Error refreshing tasks:', error);
    }
}

async function refreshTasksFromPage() {
    try {
        const response = await fetch('/');
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newTaskDataElement = doc.getElementById('task-data');
        if (newTaskDataElement) {
            const rawTasks = JSON.parse(newTaskDataElement.textContent);
            tasks = rawTasks.filter(task => task && (task.Name || task.name) && (task.Name || task.name).trim() !== '' && (task.Name || task.name) !== 'undefined');
            try { window.tasks = tasks; } catch(_) {}
            updateCounters();
            const activeItem = document.querySelector('.clickable-stat.active');
            if (activeItem) {
                const taskType = activeItem.getAttribute('data-task-type');
                showTasks(taskType);
            }
        }
    } catch (error) {
        console.error('[Planner] Error refreshing tasks from page:', error);
    }
}

function updateCounters() {
    const totalElement = document.querySelector('[data-task-type="active"] .stat-number');
    const completedElement = document.querySelector('[data-task-type="completed"] .stat-number');
    console.debug('[Planner] updateCounters() with', tasks.length, 'tasks');
    if (totalElement) {
        const activeCount = tasks.filter(task => !(task.IsCompleted || task.isCompleted)).length;
        totalElement.textContent = activeCount;
    }
    if (completedElement) {
        const completedCount = tasks.filter(task => task.IsCompleted || task.isCompleted).length;
        completedElement.textContent = completedCount;
    }
    const currentLang = getCurrentLanguage();
    const t = typeof translations !== 'undefined' ? translations[currentLang] : null;
    // Ensure language label matches current translations
    try {
        const langLabel = document.getElementById('currentLang');
        if (langLabel) langLabel.textContent = currentLang.toUpperCase();
    } catch(_) {}
    document.title = `TaskPlanner - ${tasks.length} ${t ? t.tasks : 'tasks'}`;
}

function showTasks(type) {
    console.debug('[Planner] showTasks()', { type });
    const container = document.getElementById('task-list-container');
    const titleText = document.getElementById('panel-title-text');
    const subtitle = document.getElementById('panel-subtitle');
    let filteredTasks = [];
    let title = '';
    const currentLang = getCurrentLanguage();
    const t = typeof translations !== 'undefined' ? translations[currentLang] : null;
    
    if (type === 'active') {
        filteredTasks = tasks
            .filter(task => !(task.IsCompleted || task.isCompleted))
            .sort((a, b) => new Date(a.DueDate || a.dueDate) - new Date(b.DueDate || b.dueDate));
        title = t ? t.allTasks : 'Active Tasks';
        subtitle.textContent = t ? `${t.showing} ${filteredTasks.length} ${t.tasks}` : `Showing ${filteredTasks.length} task(s)`;
    } else if (type === 'completed') {
        filteredTasks = tasks
            .filter(task => task.IsCompleted || task.isCompleted)
            .sort((a, b) => new Date(a.DueDate || a.dueDate) - new Date(b.DueDate || b.dueDate));
        title = t ? t.completedTasks : 'Completed Tasks';
        subtitle.textContent = t ? `${t.showing} ${filteredTasks.length} ${t.completedTasksCount}` : `Showing ${filteredTasks.length} completed task(s)`;
    }
    
    titleText.textContent = title;
    
    renderTasksList(filteredTasks, type);
}

async function forceRefreshTasks() {
    console.debug('[Planner] forceRefreshTasks()');
    const oldTasks = [...tasks];
    try {
        const response = await fetch('/?handler=GetTasks', { method: 'GET', headers: { 'X-Requested-With': 'XMLHttpRequest' } });
        if (response.ok) {
            const newTasks = await response.json();
            const filteredTasks = newTasks.filter(task => task && (task.Name || task.name) && (task.Name || task.name).trim() !== '' && (task.Name || task.name) !== 'undefined');
            tasks = filteredTasks;
            try { window.tasks = tasks; } catch(_) {}
            updateCounters();
            const activeItem = document.querySelector('.clickable-stat.active');
            if (activeItem) {
                const taskType = activeItem.getAttribute('data-task-type');
                showTasks(taskType);
            }
        }
    } catch (error) {
        console.error('Force refresh failed, restoring tasks:', error);
        tasks = oldTasks;
        updateCounters();
    }
}

let autoRefreshEnabled = false; // Disabled by default
document.addEventListener('DOMContentLoaded', function () {
    console.info('[Planner] DOMContentLoaded');
    loadTasks();
    const clickableStats = document.querySelectorAll('.clickable-stat');
    clickableStats.forEach(stat => {
        stat.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const taskType = this.getAttribute('data-task-type');
            clickableStats.forEach(s => s.classList.remove('active'));
            this.classList.add('active');
            if (autoRefreshInterval) { clearInterval(autoRefreshInterval); autoRefreshInterval = null; }
            showTasks(taskType);
        });
    });

    // Show list by default: highlight Active and render immediately
    const defaultActive = document.querySelector('[data-task-type="active"]');
    if (defaultActive) {
        clickableStats.forEach(s => s.classList.remove('active'));
        defaultActive.classList.add('active');
    }
    showTasks('active');

    // Remove legacy auto-refresh button if still present in cached HTML
    const autoRefreshBtn = document.getElementById('autoRefreshToggle');
    if (autoRefreshBtn && autoRefreshBtn.parentNode) {
        autoRefreshBtn.parentNode.removeChild(autoRefreshBtn);
    }

    // Defensive: avoid ReferenceError if stale inline onclick remains
    if (!window.toggleAutoRefresh) {
        window.toggleAutoRefresh = function () { return false; };
    }

    // Attach custom confirm to delete forms
    document.body.addEventListener('submit', async function(e) {
        const form = e.target;
        if (form && form.matches('form[data-confirm-delete="1"]')) {
            e.preventDefault();
            const ok = await confirmDelete();
            if (ok) form.submit();
        }
    }, true);

    // Respond to language switch without full page reload
    function refreshListLanguage() {
        const activeItem = document.querySelector('.clickable-stat.active');
        const taskType = activeItem ? activeItem.getAttribute('data-task-type') : 'active';
        showTasks(taskType);
    }
    window.onLanguageChanged = refreshListLanguage;
    window.addEventListener('languageChanged', refreshListLanguage);
    window.addEventListener('storage', function(e) {
        if (e.key === 'language') refreshListLanguage();
    });

    // Fallback: react to header language label changes
    const langLabel = document.getElementById('currentLang');
    if (langLabel && typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver(() => refreshListLanguage());
        observer.observe(langLabel, { childList: true, characterData: true, subtree: true });
    }
});


// Рендер звичайного списку завдань у панелі
function renderTasksList(items, type) {
    const container = document.getElementById('task-list-container');
    const token = getAntiForgeryToken();
    const currentLang = getCurrentLanguage();
    const t = typeof translations !== 'undefined' ? translations[currentLang] : null;

    if (!items || items.length === 0) {
        const emptyMessage = type === 'completed' ? (t ? t.noCompletedTasks : 'No completed tasks found') : (t ? t.noTasks : 'No tasks found');
        container.innerHTML = `<div class="empty-tasks-panel"><i class="fas fa-clipboard-list fa-3x text-muted mb-3"></i><p>${emptyMessage}</p></div>`;
        return;
    }

    const listHtml = items.map(task => {
        const isCompleted = task.IsCompleted || task.isCompleted;
        let formattedDate = '';
        try {
            const d = new Date(task.DueDate || task.dueDate);
            const locale = getCurrentLanguage() === 'uk' ? 'uk-UA' : 'en-US';
            formattedDate = d.toLocaleDateString(locale, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
        } catch {
            formattedDate = task.DueDate || task.dueDate || '';
        }

        return `
            <div class="task-row ${isCompleted ? 'completed' : ''}">
                <div class="task-main">
                    <div class="task-title">${task.Name || task.name}</div>
                    ${task.Description || task.description ? `<div class="task-desc">${task.Description || task.description}</div>` : ''}
                    <div class="task-date"><i class="fas fa-calendar-alt"></i> ${formattedDate}</div>
                </div>
                <div class="task-actions">
                    <form method="post" class="d-inline">
                        <input name="__RequestVerificationToken" type="hidden" value="${token}" />
                        <input type="hidden" name="handler" value="ToggleCompletion" />
                        <input type="hidden" name="id" value="${task.Id || task.id}" />
                        <button type="submit" class="btn btn-sm ${isCompleted ? 'btn-outline-warning' : 'btn-outline-success'}" title="${isCompleted ? (t ? t.markPending : 'Mark as pending') : (t ? t.markCompleted : 'Mark as completed')}">
                            <i class="fas ${isCompleted ? 'fa-undo' : 'fa-check'}"></i>
                        </button>
                    </form>
                    
                    <form method="post" class="d-inline" onsubmit="return false;" data-confirm-delete="1">
                        <input name="__RequestVerificationToken" type="hidden" value="${token}" />
                        <input type="hidden" name="handler" value="Delete" />
                        <input type="hidden" name="id" value="${task.Id || task.id}" />
                        <button type="submit" class="btn btn-sm btn-outline-danger" title="${t ? t.delete : 'Delete'}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </form>
                </div>
            </div>`;
    }).join('');

    container.innerHTML = `<div class="task-list">${listHtml}</div>`;
}

