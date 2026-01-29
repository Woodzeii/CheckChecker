namespace backend;

public class ManualExpense
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    
    public DateTime DateTime { get; set; }  // дата расхода
    public decimal Amount { get; set; }
    public int UserCategoryId { get; set; }
    public UserCategory Category { get; set; } = null!;
    public string Description { get; set; } = null!;  // опционально
}