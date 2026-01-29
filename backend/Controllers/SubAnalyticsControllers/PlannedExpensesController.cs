using backend;
using backend.Infrastructure;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PlannedExpensesController : ControllerBase
{
    private readonly AppDbContext _context;

    public PlannedExpensesController(AppDbContext context)
    {
        _context = context;
    }

    public class UpsertMonthlyPlannedExpenseRequest
    {
        public int Year { get; set; }
        public int Month { get; set; }

        public string CategoryName { get; set; }
        public decimal PlannedAmount { get; set; }

        public bool SaveAsRecurring { get; set; }
    }

    [HttpPost]
public async Task<IActionResult> Upsert([FromBody] UpsertMonthlyPlannedExpenseRequest request)
{
    if (!ModelState.IsValid) 
        return BadRequest(ModelState);
    
    var userId = User.GetUserId();

    // 1. Находим категорию пользователя по имени
    var category = await _context.UserCategories
        .FirstOrDefaultAsync(c =>
            c.UserId == userId &&
            c.Name == request.CategoryName);

    if (category is null)
    {
        return BadRequest($"Категория '{request.CategoryName}' не найдена у пользователя.");
    }

    // 2. Месячный план по этой категории
    var monthly = await _context.MonthlyPlannedExpenses
        .FirstOrDefaultAsync(x =>
            x.UserId == userId &&
            x.Year == request.Year &&
            x.Month == request.Month &&
            x.UserCategoryId == category.Id);

    if (monthly is null)
    {
        monthly = new MonthlyPlannedExpense
        {
            UserId = userId,
            Year = request.Year,
            Month = request.Month,
            UserCategoryId = category.Id,
            PlannedAmount = request.PlannedAmount
        };
        _context.MonthlyPlannedExpenses.Add(monthly);
    }
    else
    {
        monthly.PlannedAmount = request.PlannedAmount;
    }

    // 3. Recurring, если нужно
    if (request.SaveAsRecurring)
    {
        var recurring = await _context.RecurringPlannedExpenses
            .FirstOrDefaultAsync(x =>
                x.UserId == userId &&
                x.UserCategoryId == category.Id);

        if (recurring is null)
        {
            recurring = new RecurringPlannedExpense
            {
                UserId = userId,
                UserCategoryId = category.Id,
                PlannedAmount = request.PlannedAmount,
                IsActive = true
            };
            _context.RecurringPlannedExpenses.Add(recurring);
        }
        else
        {
            recurring.PlannedAmount = request.PlannedAmount;
            recurring.IsActive = true;
        }
    }

    await _context.SaveChangesAsync();
    return Ok();
}

    // Все плановые расходы по категориям за месяц
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MonthlyPlannedExpense>>> Get(int year, int month)
    {
        var userId = User.GetUserId();

        var items = await _context.MonthlyPlannedExpenses
            .Include(x => x.Category)
            .Where(x =>
                x.UserId == userId &&
                x.Year == year &&
                x.Month == month)
            .ToListAsync();

        return Ok(items);
    }
}
