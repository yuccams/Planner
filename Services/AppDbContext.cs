using Microsoft.EntityFrameworkCore;
using TaskPlanner.Models;

namespace TaskPlanner.Services
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<TaskPlanner.Models.Task> Tasks => Set<TaskPlanner.Models.Task>();
    }
}


