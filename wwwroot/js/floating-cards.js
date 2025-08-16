console.info('[Planner] floating-cards.js loaded');

let floatingTasks = [];
let floatingContainer = null;
let nextTaskId = 1;

// Керуємо «сесіями» рендеру та відкладеними таймерами, щоб уникнути дублювань при частих кліках
let renderSessionId = 0;
let pendingTimers = [];

function clearPendingTimers() {
    if (pendingTimers.length === 0) return;
    pendingTimers.forEach(id => clearTimeout(id));
    pendingTimers = [];
}

function initFloatingCards() {
    console.debug('[Planner] Initializing floating cards');
    floatingContainer = document.getElementById('floating-tasks-container');
    
    if (!floatingContainer) {
        console.error('Floating tasks container not found');
        return;
    }

    // Завантажуємо існуючі завдання
    loadTasksAsFloatingCards();
    
    // Запускаємо періодичне оновлення позицій
    setInterval(updateFloatingPositions, 8000);
}

let usedPositions = [];

function getRandomPosition() {
    const margin = 60;
    const cardWidth = 300;
    const cardHeight = 240;
    const spacing = 40; // Більша відстань між картками
    
    const maxX = window.innerWidth - cardWidth - margin;
    const maxY = window.innerHeight - cardHeight - margin;
    
    let attempts = 0;
    let position;
    
    // Намагаємося знайти позицію, що не перекривається
    do {
        // Додаємо більше варіативності в позиціонування
        const zoneX = Math.floor(Math.random() * 3); // 3 зони по горизонталі
        const zoneY = Math.floor(Math.random() * 2); // 2 зони по вертикалі
        
        const zoneWidth = maxX / 3;
        const zoneHeight = maxY / 2;
        
        position = {
            x: zoneX * zoneWidth + Math.random() * (zoneWidth - cardWidth) + margin,
            y: zoneY * zoneHeight + Math.random() * (zoneHeight - cardHeight) + margin
        };
        attempts++;
    } while (attempts < 50 && isPositionTooClose(position, cardWidth, cardHeight, spacing));
    
    usedPositions.push(position);
    
    // Очищуємо старі позиції якщо їх занадто багато
    if (usedPositions.length > 8) {
        usedPositions = usedPositions.slice(-4);
    }
    
    return position;
}

function isPositionTooClose(newPos, cardWidth, cardHeight, spacing) {
    return usedPositions.some(usedPos => {
        const distanceX = Math.abs(newPos.x - usedPos.x);
        const distanceY = Math.abs(newPos.y - usedPos.y);
        
        return distanceX < (cardWidth + spacing) && distanceY < (cardHeight + spacing);
    });
}

function clearUsedPositions() {
    usedPositions = [];
}

function createFloatingCard(task, isNew = false) {
    const isCompleted = task.IsCompleted || task.isCompleted;
    const position = getRandomPosition();
    
    const cardElement = document.createElement('div');
    cardElement.className = `floating-task-card ${isCompleted ? 'completed' : ''} ${isNew ? 'just-created' : ''}`;
    cardElement.style.left = position.x + 'px';
    cardElement.style.top = position.y + 'px';
    cardElement.dataset.taskId = task.Id || task.id;
    
    // Додаємо випадковий колір для активних завдань
    if (!isCompleted) {
        const colors = ['primary', 'info', 'warning-soft', 'success-soft'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        cardElement.classList.add(`card-${randomColor}`);
    }
    
    // Додаємо плавання через рандомну затримку
    setTimeout(() => {
        cardElement.classList.add('gentle-float');
    }, Math.random() * 3000 + 1000);
    
    // Форматуємо дату
    let formattedDate = 'Немає терміну';
    if (task.DueDate || task.dueDate) {
        try {
            const date = new Date(task.DueDate || task.dueDate);
            formattedDate = date.toLocaleDateString('uk-UA', { 
                day: '2-digit', 
                month: 'short', 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } catch (e) {
            formattedDate = task.DueDate || task.dueDate;
        }
    }
    
    cardElement.innerHTML = `
        <div class="floating-task-header">
            <div class="floating-task-title">${task.Name || task.name}</div>
            <div class="floating-task-status ${isCompleted ? 'completed' : 'active'}">
                <i class="fas ${isCompleted ? 'fa-check-circle' : 'fa-clock'}"></i>
            </div>
        </div>
        ${(task.Description || task.description) && (task.Description || task.description) !== 'undefined' ? 
            `<div class="floating-task-desc">${task.Description || task.description}</div>` : ''}
        <div class="floating-task-date">
            <i class="fas fa-calendar-alt"></i>
            <span>${formattedDate}</span>
        </div>
        <div class="floating-task-actions">
            <form method="post" class="d-inline">
                <input name="__RequestVerificationToken" type="hidden" value="${getAntiForgeryToken()}" />
                <input type="hidden" name="handler" value="ToggleCompletion" />
                <input type="hidden" name="id" value="${task.Id || task.id}" />
                <button type="submit" class="btn btn-sm ${isCompleted ? 'btn-outline-warning' : 'btn-outline-success'}" 
                        title="${isCompleted ? '↩️ Позначити як невиконане' : '✅ Позначити як виконане'}">
                    <i class="fas ${isCompleted ? 'fa-undo' : 'fa-check'}"></i>
                </button>
            </form>
            
            <form method="post" class="d-inline" onsubmit="return confirm('🗑️ Ви впевнені, що хочете видалити це завдання?');">
                <input name="__RequestVerificationToken" type="hidden" value="${getAntiForgeryToken()}" />
                <input type="hidden" name="handler" value="Delete" />
                <input type="hidden" name="id" value="${task.Id || task.id}" />
                <button type="submit" class="btn btn-sm btn-outline-danger" title="🗑️ Видалити">
                    <i class="fas fa-trash"></i>
                </button>
            </form>
        </div>
    `;
    
    // Додаємо інтерактивність
    cardElement.addEventListener('mouseenter', () => {
        cardElement.style.transform = 'translateY(-8px) scale(1.05)';
        cardElement.style.zIndex = '1000';
    });
    
    cardElement.addEventListener('mouseleave', () => {
        cardElement.style.transform = '';
        cardElement.style.zIndex = '';
    });
    
    return cardElement;
}

function loadTasksAsFloatingCards() {
    if (!window.tasks || !Array.isArray(window.tasks)) {
        console.log('No tasks data available for floating cards');
        return;
    }
    
    // Не показуємо всі завдання автоматично
    // Вони будуть показані тільки коли користувач клікне на лічильник
    console.log('Floating cards ready, waiting for user interaction');
}

function showFloatingCardsForTasks(tasksToShow) {
    // Позначаємо нову сесію рендеру та скасовуємо всі попередні відкладені дії
    renderSessionId++;
    const sessionId = renderSessionId;
    clearPendingTimers();

    // Очищуємо контейнер
    clearFloatingCards();

    // Очищуємо використані позиції для нового розміщення (після невеликої паузи)
    const afterClearTimer = setTimeout(() => {
        // Якщо за цей час почалася нова сесія — припиняємо
        if (sessionId !== renderSessionId) return;

        clearUsedPositions();

        // Додаємо кожне завдання як окрему плаваючу картку з прогресивною анімацією
        tasksToShow.forEach((task, index) => {
            const baseDelay = 200;
            const randomDelay = Math.random() * 400;
            const totalDelay = index * baseDelay + randomDelay;

            const addTimer = setTimeout(() => {
                // Якщо сталася нова сесія — ігноруємо запізнілі додавання
                if (sessionId !== renderSessionId) return;

                const cardElement = createFloatingCard(task);
                floatingContainer.appendChild(cardElement);
                floatingTasks.push({
                    element: cardElement,
                    task: task,
                    id: task.Id || task.id
                });

                cardElement.style.animationDelay = `${Math.random() * 0.3}s`;
            }, totalDelay);

            pendingTimers.push(addTimer);
        });
    }, 200);

    pendingTimers.push(afterClearTimer);
}

function clearFloatingCards() {
    // Скасовуємо всі відкладені додавання карток, щоб не накопичувались «зайві вікна»
    clearPendingTimers();
    
    // Анімація зникнення для всіх карток
    floatingTasks.forEach((floatingTask, index) => {
        setTimeout(() => {
            if (floatingTask.element && floatingTask.element.parentNode) {
                floatingTask.element.classList.add('removing');
                setTimeout(() => {
                    if (floatingTask.element.parentNode) {
                        floatingTask.element.parentNode.removeChild(floatingTask.element);
                    }
                }, 600);
            }
        }, index * 100);
    });
    
    // Очищуємо масив і позиції після анімації
    setTimeout(() => {
        floatingTasks = [];
        clearUsedPositions();
    }, floatingTasks.length * 100 + 600);
}

function addNewFloatingTask(task) {
    console.log('Adding new floating task:', task);
    
    const cardElement = createFloatingCard(task, true);
    floatingContainer.appendChild(cardElement);
    
    floatingTasks.push({
        element: cardElement,
        task: task,
        id: task.Id || task.id
    });
    
    // Оновлюємо лічильники
    if (window.updateCounters) {
        window.updateCounters();
    }
}

function removeFloatingTask(taskId) {
    const taskIndex = floatingTasks.findIndex(ft => ft.id === taskId);
    
    if (taskIndex !== -1) {
        const floatingTask = floatingTasks[taskIndex];
        
        // Додаємо анімацію видалення
        floatingTask.element.classList.add('removing');
        
        // Видаляємо після анімації
        setTimeout(() => {
            if (floatingTask.element.parentNode) {
                floatingTask.element.parentNode.removeChild(floatingTask.element);
            }
            floatingTasks.splice(taskIndex, 1);
        }, 600);
    }
}

function updateFloatingPositions() {
    console.log('Updating floating positions');
    
    floatingTasks.forEach((floatingTask, index) => {
        setTimeout(() => {
            const newPosition = getRandomPosition();
            const element = floatingTask.element;
            
            // Smooth transition to new position
            element.style.transition = 'left 3s ease-in-out, top 3s ease-in-out';
            element.style.left = newPosition.x + 'px';
            element.style.top = newPosition.y + 'px';
            
            // Скидаємо transition після анімації
            setTimeout(() => {
                element.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            }, 3000);
        }, index * 500);
    });
}

function getAntiForgeryToken() {
    const tokenInput = document.querySelector('input[name="__RequestVerificationToken"]');
    return tokenInput ? tokenInput.value : '';
}

// Додаємо функції до window для доступу з інших файлів
window.addNewFloatingTask = addNewFloatingTask;
window.removeFloatingTask = removeFloatingTask;
window.loadTasksAsFloatingCards = loadTasksAsFloatingCards;
window.showFloatingCardsForTasks = showFloatingCardsForTasks;
window.clearFloatingCards = clearFloatingCards;

// Ініціалізація плаваючих карток вимкнена за замовчуванням
if (window && window.ENABLE_FLOATING_CARDS) {
    document.addEventListener('DOMContentLoaded', initFloatingCards);
}

// Оновлюємо позиції при зміні розміру вікна
window.addEventListener('resize', () => {
    setTimeout(updateFloatingPositions, 500);
});
