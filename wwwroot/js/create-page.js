console.info('[Planner] create-page.js loaded');

// Global variables for error handling and button state
let formSubmissionInProgress = false;

// Button state management
function setButtonLoading(button, isLoading, originalText = null) {
    console.log(`[Planner] setButtonLoading called: ${isLoading}`);
    if (isLoading) {
        button.disabled = true;
        button.setAttribute('data-original-text', originalText || button.innerHTML);
        button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Loading...';
        
    } else {
        button.disabled = false;
        const originalText = button.getAttribute('data-original-text');
        if (originalText) {
            button.innerHTML = originalText;
        }
        
    }
}

// Form validation
function validateForm() {
    console.log('[Planner] validateForm called');
    const taskName = document.getElementById('taskName');
    const taskDueDate = document.getElementById('taskDueDate');
    
    let isValid = true;
    const errors = [];
    
    // Validate task name
    if (!taskName.value.trim()) {
        errors.push('Task name is required');
        taskName.classList.add('is-invalid');
        isValid = false;
    } else {
        taskName.classList.remove('is-invalid');
    }
    
    // Validate due date (simplified - only check if not empty)
    if (!taskDueDate.value) {
        errors.push('Due date is required');
        taskDueDate.classList.add('is-invalid');
        isValid = false;
    } else {
        taskDueDate.classList.remove('is-invalid');
    }
    
    // Log validation results
    if (errors.length > 0) {
        
    } else {
        
    }
    
    return isValid;
}

// AJAX form submission to prevent page reload
function handleFormSubmit(event) {
    
    
    // PREVENT the default form submission to avoid page reload
    event.preventDefault();
    
    
    // Only prevent double submission
    if (formSubmissionInProgress) {
        
        return false;
    }
    
    // Set loading state
    formSubmissionInProgress = true;
    const submitButton = event.target.querySelector('button[type="submit"]');
    
    if (submitButton) {
        setButtonLoading(submitButton, true, submitButton.innerHTML);
    }
    
    
    
    // Get form data
    const form = event.target;
    const formData = new FormData(form);
    
    // Submit via AJAX
    fetch(form.action || window.location.pathname, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        
        
        if (response.ok) {
            
            // Redirect to index page after successful creation
            window.location.href = '/';
        } else {
            // Handle validation errors by reloading the page to show server errors
            
            window.location.reload();
        }
    })
    .catch(error => {
        
        console.error('Form submission error:', error);
        
        // Reset form state on error
        formSubmissionInProgress = false;
        if (submitButton) {
            setButtonLoading(submitButton, false);
        }
    });
    
    return false;
}

document.addEventListener('DOMContentLoaded', function() {
    console.info('[Planner] DOMContentLoaded (Create)');
    
    // Check if this page was loaded after a form submission
    const wasFormSubmitted = sessionStorage.getItem('taskCreated') === 'true';
    if (wasFormSubmitted) {
        
        sessionStorage.removeItem('taskCreated'); // Clear the flag
    }
    
    // Set default due date
    const dueDateInput = document.getElementById('taskDueDate');
    if (dueDateInput && !dueDateInput.value) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        dueDateInput.value = tomorrow.toISOString().slice(0, 16);
        
    }

    // Enhanced form handling
    const form = document.querySelector('form[method="post"]');
    if (form) {
        
        form.addEventListener('submit', handleFormSubmit);
        
        // Real-time validation
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                if (input.value.trim() !== '') {
                    input.classList.remove('is-invalid');
                    
                }
            });
            
            input.addEventListener('input', () => {
                if (input.classList.contains('is-invalid') && input.value.trim() !== '') {
                    input.classList.remove('is-invalid');
                    
                }
            });
        });
        
        
    } else {
        console.error('[Planner] Form not found!');
        
    }
    
    // Check for existing errors on page load (always check, not just in debug mode)
    const validationSpans = document.querySelectorAll('span.text-danger');
    let errorCount = 0;
    let totalSpans = 0;
    
    if (validationSpans.length > 0) {
        validationSpans.forEach(span => {
            totalSpans++;
            const message = (span.textContent || '').trim();
            
            // Debug: log all spans to understand what's happening
            const isDebug = false;
            
            // Only process spans that actually have error messages
            if (message.length > 0) {
                const hasErrorClass = span.classList.contains('field-validation-error');
                const hasValidClass = span.classList.contains('field-validation-valid');
                
                // Log detailed information about each span only if there's content and in debug mode
                
                
                
                errorCount++;
                
                // Highlight the corresponding input field
                const fieldName = span.getAttribute('data-valmsg-for');
                if (fieldName) {
                    const input = document.querySelector(`[name="${fieldName}"]`);
                    if (input) {
                        input.classList.add('is-invalid');
                        
                    }
                }
            }
        });
    }
    
    // Only log summary if there are actual errors or in debug mode
    
    
    // Monitor for navigation away from page
    window.addEventListener('beforeunload', function() {
        
    });
    
    // Debug mode support
    
    
    // Initialize debug toggle button state
    
});

// Debug mode toggle function
// Removed debug toggle and overlay


