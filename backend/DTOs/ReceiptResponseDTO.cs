//------------------НЕАКТКУАЛЬНЫЙ КЛАСС!-------------------------
public class ReceiptResponseDto
{
    public int Id { get; set; }

    public string ShopName { get; set; } = null!;
    public DateTime PurchaseDate { get; set; }
    public decimal Total { get; set; }
    public List<ReceiptItem> Items { get; set; }

    // Добавь сюда те поля, которые реально нужны фронту:
    // список позиций, НДС и т.п.
} //--------------------------------------------------------
public class ParseReceiptRequest
{
    public string QrRaw { get; set; } = null!;
}



public class CategoryStatsDto
{
    public string CategoryName { get; set; } = null!;
    public decimal TotalAmount { get; set; }
    public int ItemCount { get; set; }
    public List<string> TopItems { get; set; } = new();
}
    
public class ReceiptAnalyticsResponse
{
    public List<CategoryStatsDto> Categories { get; set; } = new();
}