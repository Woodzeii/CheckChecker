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
    
    [HttpGet("all")]
    public async Task<IActionResult> GetAllExpenses(CancellationToken ct)
    {
        var userId = User.GetUserId();
    
        var receipts = await _context.Receipts
            .Where(r => r.UserId == userId)
            .Include(r => r.Items)
            .Select(r => new UnifiedExpenseDto(
                r.Id,
                r.DateTime,
                r.StoreName,
                r.Items.FirstOrDefault().Category ?? "Не определена",
                r.TotalSum,
                r.Items.Count,
                "receipt"
            ))
            .ToListAsync(ct);
    
        var manual = await _context.ManualExpenses
            .Include(m => m.Category)
            .Where(m => m.UserId == userId)
            .Select(m => new UnifiedExpenseDto(
                m.Id,
                m.DateTime,
                null,
                m.Category.Name,
                m.Amount,
                1,
                "manual"
            ))
            .ToListAsync(ct);
    
        var all = receipts
            .Concat(manual)
            .OrderByDescending(x => x.DateTime)
            .ToList();
    
        return Ok(all);
    }

    
    [HttpDelete("manual/{id:int}")]  // DELETE /api/expenses/manual/123
    public async Task<IActionResult> DeleteManual(int id, CancellationToken ct)
    {
        var userId = User.GetUserId();
    
        var expense = await _context.ManualExpenses
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId, ct);
    
        if (expense == null)
            return NotFound("Ручной расход не найден");
    
        _context.ManualExpenses.Remove(expense);
        await _context.SaveChangesAsync(ct);
    
        return NoContent();
    }
}
