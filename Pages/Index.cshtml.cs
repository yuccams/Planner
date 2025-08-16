using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using TaskPlanner.Models;
using TaskPlanner.Services;

namespace TaskPlanner.Pages
{
    public class IndexModel : PageModel
    {
        private readonly ITaskService _taskService;

        public IndexModel(ITaskService taskService)
        {
            _taskService = taskService;
        }

        public List<TaskPlanner.Models.Task> Tasks { get; set; } = new();

        public async System.Threading.Tasks.Task OnGetAsync()
        {
            Tasks = await _taskService.GetAllTasksAsync();
        }

        // Базовий POST handler для діагностики
        public async System.Threading.Tasks.Task<IActionResult> OnPost()
        {
            string handler = Request.Form["handler"];
            if (handler == "ToggleCompletion")
            {
                return await OnPostToggleCompletion();
            }
            else if (handler == "Delete")
            {
                return await OnPostDelete();
            }
            
            return RedirectToPage();
        }
        
        public async System.Threading.Tasks.Task<IActionResult> OnGetGetTasksAsync()
        {
            var tasks = await _taskService.GetAllTasksAsync();
            var taskData = tasks.Select(t => new {
                Id = t.Id,
                Name = t.Name,
                Description = t.Description,
                DueDate = t.DueDate.ToString("MMM dd, yyyy HH:mm"),
                IsCompleted = t.IsCompleted
            }).ToArray();
            
            return new JsonResult(taskData);
        }

        // Реальний handler для переключення статусу
        public async System.Threading.Tasks.Task<IActionResult> OnPostToggleCompletion()
        {
            string idString = Request.Form["id"];
            
            if (Guid.TryParse(idString, out Guid id))
            {
                try
                {
                    await _taskService.ToggleTaskCompletionAsync(id);
                    TempData["Message"] = "Task status updated successfully.";
                    TempData["MessageType"] = "success";
                }
                catch (Exception ex)
                {
                    TempData["Message"] = "Error updating task status.";
                    TempData["MessageType"] = "danger";
                }
            }
            else
            {
                TempData["Message"] = "Invalid task ID.";
                TempData["MessageType"] = "danger";
            }
            
            return RedirectToPage();
        }

        public async System.Threading.Tasks.Task<IActionResult> OnPostToggleCompletionAsync(Guid id)
        {
            try
            {
                await _taskService.ToggleTaskCompletionAsync(id);
                TempData["Message"] = "Task status updated successfully.";
                TempData["MessageType"] = "success";
            }
            catch (Exception ex)
            {
                TempData["Message"] = "Error updating task status.";
                TempData["MessageType"] = "danger";
            }

            return RedirectToPage();
        }

        // Реальний handler для видалення
        public async System.Threading.Tasks.Task<IActionResult> OnPostDelete()
        {
            string idString = Request.Form["id"];
            
            if (Guid.TryParse(idString, out Guid id))
            {
                try
                {
                    var result = await _taskService.DeleteTaskAsync(id);
                    if (result)
                    {
                        TempData["Message"] = "Task deleted successfully.";
                        TempData["MessageType"] = "success";
                    }
                    else
                    {
                        TempData["Message"] = "Task not found.";
                        TempData["MessageType"] = "warning";
                    }
                }
                catch (Exception ex)
                {
                    TempData["Message"] = "Error deleting task.";
                    TempData["MessageType"] = "danger";
                }
            }
            else
            {
                TempData["Message"] = "Invalid task ID.";
                TempData["MessageType"] = "danger";
            }
            
            return RedirectToPage();
        }

        public async System.Threading.Tasks.Task<IActionResult> OnPostDeleteAsync(Guid id)
        {
            try
            {
                var result = await _taskService.DeleteTaskAsync(id);
                if (result)
                {
                    TempData["Message"] = "Task deleted successfully.";
                    TempData["MessageType"] = "success";
                }
                else
                {
                    TempData["Message"] = "Task not found.";
                    TempData["MessageType"] = "warning";
                }
            }
            catch (Exception ex)
            {
                TempData["Message"] = "Error deleting task.";
                TempData["MessageType"] = "danger";
            }

            return RedirectToPage();
        }
    }
} 