using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using TaskPlanner.Models;
using TaskPlanner.Services;
using System.Globalization;

namespace TaskPlanner.Pages.Tasks
{
    public class CreateModel : PageModel
    {
        private readonly ITaskService _taskService;

        public CreateModel(ITaskService taskService)
        {
            _taskService = taskService;
        }

        [BindProperty]
        public TaskPlanner.Models.Task Task { get; set; } = new();

        public void OnGet()
        {
            // Initialize with default values
            Task.DueDate = DateTime.Today.AddDays(1).AddHours(9); // Tomorrow at 9 AM
        }

        public async System.Threading.Tasks.Task<IActionResult> OnPostAsync()
        {

            
            // Ensure Task is not null
            if (Task == null)
            {
                Task = new Models.Task();
            }
            

            
            // Normalize date input and keep validation
            // Remove only existing entry to re-parse, but we will re-validate model later
            ModelState.Remove("Task.DueDate");
            
            // Try to parse the date from the request if it exists
            var dueDateString = Request.Form["Task.DueDate"].ToString();
            
            if (!string.IsNullOrEmpty(dueDateString))
            {
                if (DateTime.TryParse(dueDateString, CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsedDate))
                {
                    Task.DueDate = parsedDate;
                }
                else
                {
                    // Try alternative parsing
                    if (DateTime.TryParse(dueDateString, out parsedDate))
                    {
                        Task.DueDate = parsedDate;
                    }
                    else
                    {
                        Task.DueDate = DateTime.Today.AddDays(1).AddHours(9);
                    }
                }
            }
            else
            {
                Task.DueDate = DateTime.Today.AddDays(1).AddHours(9);
            }
            
            // Re-validate after fixing the date
            ModelState.Remove("Task.DueDate");
            
            if (!TryValidateModel(Task))
            {
                return Page();
            }

            try
            {
                await _taskService.CreateTaskAsync(Task);
                return RedirectToPage("/Index");
            }
            catch (Exception ex)
            {
                ModelState.AddModelError("", "Error creating task. Please try again.");
                return Page();
            }
        }
    }
} 