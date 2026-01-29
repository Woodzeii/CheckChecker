

public class UserCategory
{
        public int Id { get; set; }
        public int UserId { get; set; }      // внешний ключ на User
        public string Name { get; set; } = "";
        public bool IsDefault { get; set; }      // системная/обязательная (например, "другое")
        public string? Color { get; set; }   // опционально для фронта
        public string Type { get; set; } = "expense";
}

public class DefaultCategories
{
        public static readonly string[] DefaultCategoryNames =
        {
                "Еда", "Транспорт", "Развлечения", "Одежда", "Медицина", "Быт", "другое"
        };
}
public class Category
{
        public int Id { get; set; }
        public string Name { get; set; } = null!;
}

