using Microsoft.EntityFrameworkCore;
using TaskPlanner.Models;

namespace TaskPlanner.Services
{
    public class TaskService : ITaskService
    {
        private readonly ILogger<TaskService> _logger;
        private readonly AppDbContext _db;

        public TaskService(ILogger<TaskService> logger, IWebHostEnvironment environment, AppDbContext db)
        {
            _logger = logger;
            _db = db;
        }

        public async System.Threading.Tasks.Task<List<Models.Task>> GetAllTasksAsync()
        {
            var tasks = await _db.Tasks.AsNoTracking().OrderByDescending(t => t.CreatedAt).ToListAsync();
            return tasks;
        }

        public async System.Threading.Tasks.Task<Models.Task?> GetTaskByIdAsync(Guid id)
        {
            return await _db.Tasks.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id);
        }

        public async System.Threading.Tasks.Task<Models.Task> CreateTaskAsync(Models.Task task)
        {
            Console.WriteLine($"TaskService.CreateTaskAsync called with task: {task.Name}");
            Console.WriteLine($"Current tasks count before adding: {await _db.Tasks.CountAsync()}");
            task.Id = Guid.NewGuid();
            task.CreatedAt = DateTime.UtcNow;
            await _db.Tasks.AddAsync(task);
            await _db.SaveChangesAsync();
            Console.WriteLine($"Task saved successfully with ID: {task.Id}");
            return task;
        }

        public async System.Threading.Tasks.Task<Models.Task> UpdateTaskAsync(Models.Task task)
        {
            var existingTask = await _db.Tasks.FirstOrDefaultAsync(t => t.Id == task.Id);
            
            if (existingTask == null)
            {
                throw new ArgumentException("Task not found");
            }

            existingTask.Name = task.Name;
            existingTask.Description = task.Description;
            existingTask.DueDate = task.DueDate;
            existingTask.IsCompleted = task.IsCompleted;
            existingTask.CompletedAt = task.CompletedAt;

            await _db.SaveChangesAsync();
            return existingTask;
        }

        public async System.Threading.Tasks.Task<bool> DeleteTaskAsync(Guid id)
        {
            var taskToDelete = await _db.Tasks.FirstOrDefaultAsync(t => t.Id == id);
            
            if (taskToDelete == null)
            {
                return false;
            }

            _db.Tasks.Remove(taskToDelete);
            await _db.SaveChangesAsync();
            return true;
        }

        public async System.Threading.Tasks.Task<Models.Task> ToggleTaskCompletionAsync(Guid id)
        {
            var task = await _db.Tasks.FirstOrDefaultAsync(t => t.Id == id);
            
            if (task == null)
            {
                throw new ArgumentException("Task not found");
            }

            task.IsCompleted = !task.IsCompleted;
            task.CompletedAt = task.IsCompleted ? DateTime.UtcNow : null;

            await _db.SaveChangesAsync();
            return task;
        }
    }
} 