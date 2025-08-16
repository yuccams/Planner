using TaskPlanner.Models;

namespace TaskPlanner.Services
{
    public interface ITaskService
    {
        System.Threading.Tasks.Task<List<Models.Task>> GetAllTasksAsync();
        System.Threading.Tasks.Task<Models.Task?> GetTaskByIdAsync(Guid id);
        System.Threading.Tasks.Task<Models.Task> CreateTaskAsync(Models.Task task);
        System.Threading.Tasks.Task<Models.Task> UpdateTaskAsync(Models.Task task);
        System.Threading.Tasks.Task<bool> DeleteTaskAsync(Guid id);
        System.Threading.Tasks.Task<Models.Task> ToggleTaskCompletionAsync(Guid id);
    }
} 