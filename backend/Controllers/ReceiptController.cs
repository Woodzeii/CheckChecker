using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using backend.Infrastructure;

namespace backend;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReceiptsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IReceiptService _receiptService;

    public ReceiptsController(IReceiptService receiptService, AppDbContext context)
    {
        _context = context;
        _receiptService = receiptService;
    }
    
    [HttpPost("parse")]
    public async Task<ActionResult<Receipt>> Parse([FromBody] ParseReceiptRequest request)
    {
        try
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
                    if (userIdString is null)
                        return Unauthorized();
            
                    var userId = int.Parse(userIdString);
            
                    var receipt = await _receiptService.ParseAndSaveAsync(userId, request.QrRaw);
                    return Ok(receipt);
        }
        catch (InvalidOperationException ex)
        {
            // сюда прилетят ошибки вида "Proverkacheka error (code ...): ..."
            return BadRequest(new { error = ex.Message });
        }
        
    }

    [HttpGet("user/Receipts")]
    public async Task<ActionResult<List<Receipt>>> GetByUser([FromServices] AppDbContext db, CancellationToken ct)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var receipts = await db.Receipts
            .Where(r => r.UserId == userId)
            .Include(r => r.Items) //чтобы айтемы показывались
            .OrderByDescending(r => r.DateTime)
            .ToListAsync(ct);

        return receipts;
    }
    [HttpPost("debug-raw")]
    public async Task<ActionResult<string>> DebugRaw([FromBody] ParseReceiptRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.QrRaw))
            return BadRequest("QrRaw is required.");

        var json = await _receiptService.GetRawFromProverkachekaAsync(request.QrRaw, ct);
        return Content(json, "application/json");
    }
    
    
    
    //аналитика топ 3х расходов и категориц
    [HttpGet("analytics")]
    public async Task<ActionResult<ReceiptAnalyticsResponse>> GetReceiptAnalytics(int year, int month)
    {
        var userId = User.GetUserId();
    
        var analytics = await _context.ReceiptItems
            .Include(ri => ri.Receipt)
            .Where(ri => ri.Receipt.UserId == userId 
                      && ri.Receipt.DateTime.Year == year 
                      && ri.Receipt.DateTime.Month == month)
            .GroupBy(ri => ri.Category ?? "Без категории")
            .Select(g => new CategoryStatsDto
            {
                CategoryName = g.Key,
                TotalAmount = g.Sum(x => x.Sum),  // используй готовый Sum
                ItemCount = g.Count(),
                TopItems = g.OrderByDescending(x => x.Sum)
                           .Take(3)
                           .Select(x => x.Name)
                           .ToList()
            })
            .OrderByDescending(x => x.TotalAmount)
            .ToListAsync();
    
        return Ok(new ReceiptAnalyticsResponse { Categories = analytics });
    }
    
    
    
    //расходы по чекам
    [HttpGet("expenses")]
    public async Task<ActionResult<List<ExpenseDto>>> GetExpenses(int year, int month)
    {
        var userId = User.GetUserId();

        // 1) Ручные расходы
        var manual = await _context.ManualExpenses
            .Include(e => e.Category)
            .Where(e => e.UserId == userId &&
                        e.DateTime.Year == year &&
                        e.DateTime.Month == month)
            .Select(e => new ExpenseDto 
            { 
                Id = e.Id,
                Type = "manual",
                Amount = e.Amount, 
                CategoryName = e.Category.Name,
                Date = e.DateTime,
                ReceiptId = null
            })
            .ToListAsync();

        // 2) Чеки (основная категория чека)
        var receipts = await _context.Receipts
            .Include(r => r.Items)
            .Where(r => r.UserId == userId &&
                        r.DateTime.Year == year &&
                        r.DateTime.Month == month)
            .Select(r => new ExpenseDto 
            {
                Id = r.Id,
                Type = "receipt",
                Amount = r.Items.Sum(i => i.Sum),
                CategoryName = r.Items
                    .OrderByDescending(i => i.Sum)
                    .Select(i => i.Category)
                    .FirstOrDefault() ?? "Без категории",
                Date = r.DateTime,
                ReceiptId = r.Id
            })
            .ToListAsync();

        var all = manual
            .Concat(receipts)
            .OrderByDescending(x => x.Date)
            .ToList();

        return Ok(all);
    }

    public class ExpenseDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = null!;  // "receipt" | "manual"
        public decimal Amount { get; set; }
        public string CategoryName { get; set; } = null!;
        public DateTime Date { get; set; }
        public int? ReceiptId { get; set; }
    }

    
    
    // DTO для переименования категории
    public class CategoryUpdateDto
    {
        public string Name { get; set; } = "";
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] CategoryUpdateDto dto, CancellationToken ct)
    {
        var userId = User.GetUserId();

        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Имя категории не может быть пустым.");

        var normalizedName = dto.Name.Trim();

        if (normalizedName.Equals("другое", StringComparison.OrdinalIgnoreCase))
            return BadRequest("Категория 'другое' зарезервирована и не может быть выбрана в качестве имени.");

        var cat = await _context.UserCategories
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId, ct);

        if (cat is null)
            return NotFound();

        if (cat.IsDefault || cat.Name.Equals("другое", StringComparison.OrdinalIgnoreCase))
            return BadRequest("Нельзя переименовывать базовые категории и категорию 'другое'.");

        // Проверка на дубликат имени
        var exists = await _context.UserCategories.AnyAsync(
            c => c.UserId == userId && c.Id != id && c.Name == normalizedName,
            ct);

        if (exists)
            return BadRequest("Категория с таким именем уже существует.");

        cat.Name = normalizedName;
        await _context.SaveChangesAsync(ct);

        return NoContent();
    }
    
    
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteReceipt(int id, CancellationToken ct)
    {
        // id — это receiptId из маршрута

        // Получаем userId из клейма (как ты делал в других методах)
        var userIdClaim = User.FindFirst("userId") ?? User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim is null)
            return Forbid();

        var userId = int.Parse(userIdClaim.Value);

        // Ищем чек, который принадлежит этому пользователю
        var receipt = await _context.Receipts
            .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId, ct);

        if (receipt is null)
            return NotFound(); 

        _context.Receipts.Remove(receipt);   
        await _context.SaveChangesAsync(ct);

        return NoContent();
    }

    
}
