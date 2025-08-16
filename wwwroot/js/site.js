// Task Planner JavaScript functionality

// TempData-based alerts are disabled (use client toasts instead)
document.addEventListener('DOMContentLoaded', function() {
    // no-op: legacy server alerts suppressed to prevent duplicated or wrong-language popups

    // Debug mode: enable verbose logging and cache-busting for page scripts
    try {
        if (localStorage.getItem('debugPlanner') === '1') {
            console.info('[Planner] Debug mode is ON');

            // Cache-bust page scripts to ensure fresh logs after navigation
            const rebust = (pathPart) => {
                const s = Array.from(document.scripts).find(x => x.src && x.src.includes(pathPart));
                if (!s) return false;
                const u = new URL(s.src, window.location.origin);
                u.searchParams.set('v', Date.now().toString());
                const reload = document.createElement('script');
                reload.src = u.toString();
                reload.defer = true;
                s.parentNode && s.parentNode.insertBefore(reload, s.nextSibling);
                console.info('[Planner] Reloaded', pathPart, 'with cache-buster');
                return true;
            };
            rebust('/js/index-page.js');
            rebust('/js/create-page.js');

            // Log navigation and form submits
            document.addEventListener('click', function(e) {
                const a = e.target && e.target.closest ? e.target.closest('a') : null;
                if (a && a.href) {
                    console.debug('[Planner] link click ->', a.href);
                }
            }, true);

            document.addEventListener('submit', function(e) {
                const form = e.target;
                console.debug('[Planner] form submit ->', form && form.action ? form.action : window.location.href);
            }, true);

            window.addEventListener('beforeunload', function() {
                console.debug('[Planner] beforeunload (navigation/refresh)');
            });
        }
    } catch(_) { /* ignore */ }

    // Remove any legacy debug toggle button if present in cached markup
    const staleDebugBtn = document.getElementById('debugToggle');
    if (staleDebugBtn && staleDebugBtn.parentNode) {
        staleDebugBtn.parentNode.removeChild(staleDebugBtn);
    }
});

// Override blocking browser alert with non-blocking toast
(function() {
    const nativeAlert = window.alert;
    window.alert = function(msg) {
        try {
            showAlert(String(msg), 'info');
        } catch (e) {
            // Fallback to native if something goes wrong
            nativeAlert(msg);
        }
    };
})();

function getUiLang() {
    // Prefer header label (immediate UI), then localStorage, then runtime var, then html lang
    try {
        const headerLang = (document.getElementById('currentLang')?.textContent || '').toLowerCase();
        if (headerLang) return headerLang;
    } catch(_) {}
    const ls = (localStorage.getItem('language') || '').toLowerCase();
    if (ls) return ls;
    if (window.currentLanguage) return ('' + window.currentLanguage).toLowerCase();
    try {
        const htmlLang = (document.documentElement.getAttribute('lang') || '').toLowerCase();
        if (htmlLang) return htmlLang;
    } catch(_) {}
    return 'en';
}

function showAlert(message, type = 'info') {
    const currentLang = getUiLang();
    const t = (typeof translations !== 'undefined' && translations[currentLang]) || {};
    let text = message || (currentLang === 'uk' ? 'Операція виконана' : 'Operation completed');
    // Normalize well-known messages to current UI language
    try {
        const knownCreatedUk = 'Завдання успішно створено!';
        const knownCreatedEn = 'Task created successfully!';
        if (type === 'success' && (String(text).includes(knownCreatedUk) || String(text).includes(knownCreatedEn))) {
            const translated = (currentLang === 'uk' ? (t.toastCreated || knownCreatedUk) : (t.toastCreated || knownCreatedEn));
            text = translated;
        }
    } catch(_) {}

    let container = document.getElementById('plannerToastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'plannerToastContainer';
        container.className = 'planner-toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `planner-toast ${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : type === 'danger' ? 'fa-exclamation-triangle' : type === 'warning' ? 'fa-exclamation-circle' : 'fa-info-circle';
    toast.innerHTML = `
        <i class="fas ${icon} icon"></i>
        <span class="text">${text}</span>
        <button class="close-btn" aria-label="${currentLang === 'uk' ? 'Закрити' : 'Close'}">&times;</button>
    `;
    container.appendChild(toast);

    // Close button
    toast.querySelector('.close-btn').addEventListener('click', () => {
        toast.style.animation = 'toastOut .2s ease forwards';
        setTimeout(() => toast.remove(), 180);
    });

    // Auto hide after 2.5s
    setTimeout(() => {
        if (!toast.isConnected) return;
        toast.style.animation = 'toastOut .2s ease forwards';
        setTimeout(() => toast.remove(), 180);
    }, 2500);
}

function createAlertContainer() {
    const container = document.createElement('div');
    container.id = 'alertContainer';
    container.className = 'position-fixed top-0 end-0 p-3';
    container.style.zIndex = '1050';
    document.body.appendChild(container);
    return container;
}

// Confirm delete action
function confirmDelete(message = 'Are you sure you want to delete this item?') {
    const currentLang = getUiLang();
    const t = (typeof translations !== 'undefined' && translations[currentLang]) || null;
    // Dedicated i18n for confirm to avoid partial translations
    const confirmI18n = {
        en: { msg: 'Are you sure you want to delete this task?', cancel: 'Cancel', delete: 'Delete' },
        uk: { msg: 'Ви точно бажаєте видалити завдання?', cancel: 'Скасувати', delete: 'Видалити' }
    };
    const ci = confirmI18n[currentLang] || confirmI18n.en;
    const msg = (t && (t.confirmDeleteMessage || ci.msg)) || message || ci.msg;
    const cancelText = (t && (t.cancel || ci.cancel)) || ci.cancel;
    const deleteText = (t && (t.delete || ci.delete)) || ci.delete;

    return new Promise((resolve) => {
        // Backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'planner-confirm-backdrop';

        // Modal
        const modal = document.createElement('div');
        modal.className = 'planner-confirm';
        modal.innerHTML = `
            <div class="message">${msg}</div>
            <div class="actions">
                <button type="button" class="planner-btn cancel">${cancelText}</button>
                <button type="button" class="planner-btn danger">${deleteText}</button>
            </div>
        `;

        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);

        const cleanup = () => {
            if (backdrop && backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
        };

        modal.querySelector('.cancel').addEventListener('click', () => { cleanup(); resolve(false); });
        modal.querySelector('.danger').addEventListener('click', () => { cleanup(); resolve(true); });
        backdrop.addEventListener('click', (e) => { if (e.target === backdrop) { cleanup(); resolve(false); } });
    });
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Add loading state to buttons
function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Loading...';
    } else {
        button.disabled = false;
        button.innerHTML = button.getAttribute('data-original-text') || 'Submit';
    }
}

// Initialize form buttons
document.addEventListener('DOMContentLoaded', function() {
    const submitButtons = document.querySelectorAll('button[type="submit"]');
    submitButtons.forEach(button => {
        button.setAttribute('data-original-text', button.innerHTML);
        
        // Only add loading state for forms that are submitted via standard POST
        // not for forms with custom JavaScript handlers (AJAX forms)
        const form = button.closest('form');
        if (form && !form.classList.contains('ajax-form')) {
            form.addEventListener('submit', function(e) {
                // Only show loader if form is valid
                if (this.checkValidity()) {
                    // Store original button text
                    const originalText = button.innerHTML;
                    button.setAttribute('data-original-text', originalText);
                    
                    // Show loading state
                    button.disabled = true;
                    button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Loading...';
                    
                    // Set a timeout to prevent infinite loading in case of client-side issues
                    setTimeout(() => {
                        // If we're still on the same page after 10 seconds, restore the button
                        if (button && button.disabled) {
                            button.disabled = false;
                            button.innerHTML = originalText;
                        }
                    }, 10000);
                }
            });
        }
    });
}); 