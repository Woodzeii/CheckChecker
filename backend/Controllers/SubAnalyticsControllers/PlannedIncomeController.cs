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

    public PlannedIncomeController(AppDbContext context)
    {
        _context = context;
    }

    public class UpsertMonthlyPlannedIncomeRequest
    {
        public int Year { get; set; }
        public int Month { get; set; }

        public decimal PlannedAmount { get; set; }
        public string? Description { get; set; }

        public bool SaveAsRecurring { get; set; }
    }

    [HttpPost]
    public async Task<IActionResult> Upsert([FromBody] UpsertMonthlyPlannedIncomeRequest request)
    {
        var userId = User.GetUserId();

        var monthly = await _context.MonthlyPlannedIncomes
            .SingleOrDefaultAsync(x =>
                x.UserId == userId &&
                x.Year == request.Year &&
                x.Month == request.Month &&
                x.Description ==request.Description);

        if (monthly is null)
        {
            monthly = new MonthlyPlannedIncome
            {
                UserId = userId,
                Year = request.Year,
                Month = request.Month,
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

        if (request.SaveAsRecurring)
        {
            var recurring = await _context.RecurringIncomes
                .SingleOrDefaultAsync(x =>
                    x.UserId == userId &&
                    x.Category == null);

            if (recurring is null)
            {
                recurring = new RecurringIncome
                {
                    UserId = userId,
                    Amount = request.PlannedAmount,
                    Category = null,
                    Description = request.Description ?? "Плановый доход",
                    IsActive = true
                };
                _context.RecurringIncomes.Add(recurring);
            }
            else
            {
                recurring.Amount = request.PlannedAmount;
                recurring.IsActive = true;
            }
        }

        await _context.SaveChangesAsync();
        return Ok();
    }

    
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MonthlyPlannedIncome>>> Get(int year, int month)
    {
        var userId = User.GetUserId();

        var items = await _context.MonthlyPlannedIncomes
            .Where(x =>
                x.UserId == userId &&
                x.Year == year &&
                x.Month == month)
            .ToListAsync();

        return Ok(items);
    }
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = User.GetUserId();

        var item = await _context.MonthlyPlannedIncomes
            .SingleOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        if (item is null)
            return NotFound();

        _context.MonthlyPlannedIncomes.Remove(item);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

