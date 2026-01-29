using backend.Infrastructure;
using backend.Models;
using backend;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AnalyticsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AnalyticsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("monthly")]
    public async Task<ActionResult<MonthlyAnalyticsResponse>> GetMonthly(int year, int month)
    {
        var userId = User.GetUserId();

        var start = new DateTime(year, month, 1);
        var end = start.AddMonths(1);

        // 1. Бюджет
        var budget = await _context.MonthlyBudgets
            .SingleOrDefaultAsync(b =>
                b.UserId == userId &&
                b.Year == year &&
                b.Month == month);

        var initialBudget = budget?.InitialAmount ?? 0m;

        // 2. Плановый доход
        var monthlyPlannedIncomes = await _context.MonthlyPlannedIncomes
            .Where(x =>
                x.UserId == userId &&
                x.Year == year &&
                x.Month == month)
            .ToListAsync();

        var plannedIncomeTotal = monthlyPlannedIncomes.Sum(x => x.PlannedAmount);

        // 3. Фактические доходы
        var incomes = await _context.Incomes
            .Where(x =>
                x.UserId == userId &&
                x.Date >= start &&
                x.Date < end)
            .ToListAsync();

        var actualIncome = incomes.Sum(x => x.Amount);

        // 4. Фактические расходы по чекам (предполагаем, что у тебя есть таблица Receipts)
        var receipts = await _context.Receipts
            .Where(x =>
                x.UserId == userId &&
                x.DateTime >= start &&
                x.DateTime < end)
            .ToListAsync();

        var actualExpensesTotal = await (from ri in _context.ReceiptItems
            join r in _context.Receipts on ri.ReceiptId equals r.Id
            where r.UserId == userId && r.DateTime >= start && r.DateTime < end
            select ri.Sum).SumAsync();

        actualExpensesTotal += await (from me in _context.ManualExpenses
            where me.UserId == userId && me.DateTime >= start && me.DateTime < end
            select me.Amount).SumAsync(); // подстроить под твоё поле суммы

        // Позиции чеков за месяц
    var receiptItems = await _context.ReceiptItems
        .Include(x => x.Receipt)
        .Where(x =>
            x.Receipt.UserId == userId &&
            x.Receipt.DateTime >= start &&
            x.Receipt.DateTime < end)
        .ToListAsync();

    // Группировка по строковому Category
    var actualByCategory = receiptItems
        .GroupBy(x => x.Category ?? "Без категории")
        .Select(g => new
        {
            CategoryName = g.Key,
            Actual = g.Sum(i => i.Sum)
        })
        .ToList();



        var plannedByCategory = await _context.MonthlyPlannedExpenses
            .Include(x => x.Category)
            .Where(x =>
                x.UserId == userId &&
                x.Year == year &&
                x.Month == month)
            .ToListAsync();

// допустим, в MonthlyPlannedExpense вместо CategoryId сейчас есть CategoryName (string)
var byCategory = new List<CategoryAnalyticsItem>();

foreach (var p in plannedByCategory)
{
    // безопасно берём имя категории
    var categoryName = string.IsNullOrWhiteSpace(p.Category?.Name)
        ? "Без категории"
        : p.Category.Name;

    var actual = actualByCategory
        .FirstOrDefault(a => a.CategoryName == categoryName);

    var actualValue = actual?.Actual ?? 0m;

    byCategory.Add(new CategoryAnalyticsItem
    {
        CategoryId = 0,
        CategoryName = categoryName,
        Planned = p.PlannedAmount,
        Actual = actualValue,
        Difference = actualValue - p.PlannedAmount
    });
}

// категории, у которых есть только факт
foreach (var a in actualByCategory)
{
    if (!byCategory.Any(x => x.CategoryName == a.CategoryName))
    {
        byCategory.Add(new CategoryAnalyticsItem
        {
            CategoryId = 0,
            CategoryName = a.CategoryName,
            Planned = 0m,
            Actual = a.Actual,
            Difference = a.Actual
        });
    }
}


        // 7. Дневные серии для графика
        var daysInMonth = DateTime.DaysInMonth(year, month);
        var dates = new List<DateTime>();
        var dailyExpenses = new List<decimal>();
        var dailyIncomes = new List<decimal>();

        for (int day = 1; day <= daysInMonth; day++)
        {
            var d = new DateTime(year, month, day);
            dates.Add(d);

            var exp = receipts
                .Where(r => r.DateTime.Date == d.Date)
                .Sum(r => r.TotalSum);

            var inc = incomes
                .Where(i => i.Date.Date == d.Date)
                .Sum(i => i.Amount);

            dailyExpenses.Add(exp);
            dailyIncomes.Add(inc);
        }

        var currentBudget = initialBudget - actualExpensesTotal + actualIncome;
        var plannedExpensesTotal = plannedByCategory.Sum(x => x.PlannedAmount);
        var response = new MonthlyAnalyticsResponse
        {
            Year = year,
            Month = month,
            InitialBudget = initialBudget,
            PlannedIncome = plannedIncomeTotal,
            ActualIncome = actualIncome,
            PlannedExpensesTotal = plannedExpensesTotal,
            ActualExpensesTotal = actualExpensesTotal,
            CurrentBudget = currentBudget,
            ByCategory = byCategory,
            DailySeries = new DailySeries
            {
                Dates = dates,
                Expenses = dailyExpenses,
                Incomes = dailyIncomes
            }
        };

        return Ok(response);
    }
}
