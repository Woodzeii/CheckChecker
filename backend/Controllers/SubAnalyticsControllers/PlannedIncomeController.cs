using backend;
using backend.Infrastructure;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PlannedIncomeController : ControllerBase
{
    private readonly AppDbContext _context;
    public PlannedIncomeController(AppDbContext context) => _context = context;

    public class PlannedIncomeDto
    {
        public int Id { get; set; }
        public string? CategoryName { get; set; }   // как у Income
        public decimal PlannedAmount { get; set; }
        public string? Description { get; set; }
    }

    public class UpsertMonthlyPlannedIncomeRequest
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public string? CategoryName { get; set; }   // строка, как у Income
        public decimal PlannedAmount { get; set; }
        public string? Description { get; set; }
        public bool SaveAsRecurring { get; set; }
    }

    [HttpPost]
    public async Task<IActionResult> Upsert([FromBody] UpsertMonthlyPlannedIncomeRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userId = User.GetUserId();

        // считаем, сколько разных категорий уже есть в этом месяце
        var categoriesCount = await _context.MonthlyPlannedIncomes
            .Where(x => x.UserId == userId &&
                        x.Year == request.Year &&
                        x.Month == request.Month)
            .Select(x => x.CategoryName)
            .Distinct()
            .CountAsync();

        // если добавляем НОВУЮ категорию, а не обновляем существующую
        var existsForThisCategory = await _context.MonthlyPlannedIncomes
            .AnyAsync(x => x.UserId == userId &&
                           x.Year == request.Year &&
                           x.Month == request.Month &&
                           x.CategoryName == request.CategoryName);

        if (!existsForThisCategory && categoriesCount >= 10)
        {
            return BadRequest("На один месяц можно задать не более 10 категорий доходов.");
        }

        // ищем запись по (user, year, month, category string)
        var monthly = await _context.MonthlyPlannedIncomes
            .FirstOrDefaultAsync(x =>
                x.UserId == userId &&
                x.Year == request.Year &&
                x.Month == request.Month &&
                x.CategoryName == request.CategoryName);

        if (monthly is null)
        {
            monthly = new MonthlyPlannedIncome
            {
                UserId = userId,
                Year = request.Year,
                Month = request.Month,
                CategoryName = request.CategoryName,
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

        // сохраняем ещё и в RecurringIncomes, как у реальных
        if (request.SaveAsRecurring)
        {
            var recurring = await _context.RecurringIncomes
                .SingleOrDefaultAsync(x =>
                    x.UserId == userId &&
                    x.CategoryName == request.CategoryName);

            if (recurring is null)
            {
                recurring = new RecurringIncome
                {
                    UserId = userId,
                    Amount = request.PlannedAmount,
                    CategoryName = request.CategoryName,
                    Description = request.Description ?? "Плановый доход",
                    IsActive = true
                };
                _context.RecurringIncomes.Add(recurring);
            }
            else
            {
                recurring.Amount = request.PlannedAmount;
                recurring.Description = request.Description;
                recurring.IsActive = true;
            }
        }

        await _context.SaveChangesAsync();
        return Ok(new { success = true });
    }

    [HttpGet("monthly")]
    public async Task<ActionResult<List<PlannedIncomeDto>>> Get(int year, int month)
    {
        var userId = User.GetUserId();

        var items = await _context.MonthlyPlannedIncomes
            .Where(x => x.UserId == userId && x.Year == year && x.Month == month)
            .OrderBy(x => x.CategoryName)
            .Select(x => new PlannedIncomeDto
            {
                Id = x.Id,
                CategoryName = x.CategoryName,
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
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        if (item == null) return NotFound();
        _context.MonthlyPlannedIncomes.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
