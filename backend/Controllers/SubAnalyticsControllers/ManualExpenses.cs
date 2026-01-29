using backend.Infrastructure;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExpensesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ExpensesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("manual")]  // POST /api/expenses/manual
    public async Task<IActionResult> CreateManual([FromBody] CreateManualExpenseRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userId = User.GetUserId();

        var category = await _context.UserCategories
            .FirstOrDefaultAsync(c => c.UserId == userId && c.Id == request.UserCategoryId);
        if (category == null) return BadRequest("Категория не найдена");

        var expense = new ManualExpense
        {
            UserId = userId,
            DateTime = request.DateTime,
            Amount = request.Amount,
            UserCategoryId = request.UserCategoryId,
            Description = request.Description ?? ""
        };

        _context.ManualExpenses.Add(expense);
        await _context.SaveChangesAsync();

        return Ok(new { id = expense.Id, success = true });
    }

    [HttpGet]  // GET /api/expenses?year=2026&month=2
    public async Task<List<ManualExpenseDto>> GetExpenses(int? year = null, int? month = null)
    {
        var userId = User.GetUserId();
        var query = _context.ManualExpenses
            .Include(x => x.Category)
            .Where(x => x.UserId == userId);

        if (year.HasValue && month.HasValue)
        {
            var start = new DateTime(year.Value, month.Value, 1);
            var end = start.AddMonths(1);
            query = query.Where(x => x.DateTime >= start && x.DateTime < end);
        }

        return await query
            .OrderByDescending(x => x.DateTime)
            .Select(x => new ManualExpenseDto
            {
                Id = x.Id,
                DateTime = x.DateTime,
                Amount = x.Amount,
                CategoryName = x.Category.Name,
                Description = x.Description
            })
            .ToListAsync();
    }
}
