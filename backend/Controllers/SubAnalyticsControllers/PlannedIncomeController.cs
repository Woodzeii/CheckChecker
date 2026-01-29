using backend;
using backend.Infrastructure;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


using backend; // ...
[ApiController][Route("api/[controller]")][Authorize]
public class PlannedIncomeController : ControllerBase
{
    private readonly AppDbContext _context;
    public PlannedIncomeController(AppDbContext context) => _context = context;
    public class PlannedIncomeDto  // ← добавь
    {
        public int Id { get; set; }
        public string CategoryName { get; set; } = null!;
        public decimal PlannedAmount { get; set; }
        public string? Description { get; set; }
    }
    public class UpsertMonthlyPlannedIncomeRequest
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public string CategoryName { get; set; } = null!;  // ← добавь как в расходах
        public decimal PlannedAmount { get; set; }
        public string? Description { get; set; }
        public bool SaveAsRecurring { get; set; }
    }

    [HttpPost]
    public async Task<IActionResult> Upsert([FromBody] UpsertMonthlyPlannedIncomeRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);  // ← добавь

        var userId = User.GetUserId();

        // Найди категорию
        var category = await _context.UserCategories
            .FirstOrDefaultAsync(c => c.UserId == userId && c.Name == request.CategoryName);  // ← добавь
        if (category == null) return BadRequest("Категория не найдена");

        // Monthly по категории (как расходы)
        var monthly = await _context.MonthlyPlannedIncomes
            .FirstOrDefaultAsync(x =>  // ← FirstOrDefaultAsync
                x.UserId == userId &&
                x.Year == request.Year &&
                x.Month == request.Month &&
                x.UserCategoryId == category.Id);  // ← по Id

        if (monthly is null)
        {
            monthly = new MonthlyPlannedIncome
            {
                UserId = userId,
                Year = request.Year,
                Month = request.Month,
                UserCategoryId = category.Id,  // ← FK
                PlannedAmount = request.PlannedAmount,
                Description = request.Description
            };
            _context.MonthlyPlannedIncomes.Add(monthly);
        }
        else
        {
            monthly.PlannedAmount = request.PlannedAmount;
            monthly.Description = request.Description;
        }

        // Recurring
        if (request.SaveAsRecurring)
        {
            var recurring = await _context.RecurringIncomes  // ← RecurringPlannedIncomes?
                .FirstOrDefaultAsync(x =>
                    x.UserId == userId &&
                    x.UserCategoryId == category.Id);  // ← по категории

            if (recurring is null)
            {
                recurring = new RecurringIncome  // ← правильная модель?
                {
                    UserId = userId,
                    UserCategoryId = category.Id,
                    Amount = request.PlannedAmount,  // Amount → PlannedAmount?
                    Description = request.Description ?? "Плановый доход",
                    IsActive = true
                };
                _context.RecurringIncomes.Add(recurring);  // DbSet?
            }
            else
            {
                recurring.Amount = request.PlannedAmount;
                recurring.IsActive = true;
            }
        }

        await _context.SaveChangesAsync();
        return Ok(new { success = true });
    }

    [HttpGet("monthly")]
    public async Task<ActionResult<List<PlannedIncomeDto>>> Get(int year, int month)  // query params
    {
        var userId = User.GetUserId();
        var items = await _context.MonthlyPlannedIncomes
            .Include(x => x.Category)  // ← для имени
            .Where(x => x.UserId == userId && x.Year == year && x.Month == month)
            .Select(x => new PlannedIncomeDto  // DTO
            {
                Id = x.Id,
                CategoryName = x.Category.Name,
                PlannedAmount = x.PlannedAmount,
                Description = x.Description
            })
            .ToListAsync();
        return Ok(items);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = User.GetUserId();
        var item = await _context.MonthlyPlannedIncomes
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);  // ← First

        if (item == null) return NotFound();
        _context.MonthlyPlannedIncomes.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

