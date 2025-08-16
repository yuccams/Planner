using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace TaskPlanner.Pages.Tasks
{
    public class EditModel : PageModel
    {
        public IActionResult OnGet()
        {
            return RedirectToPage("/Index");
        }

        public IActionResult OnPost()
        {
            return RedirectToPage("/Index");
        }
    }
}