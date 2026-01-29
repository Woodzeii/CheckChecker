namespace backend.Models;
//Бюджет на начало месяца
public class MonthlyBudget
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = default!;

    public int Year { get; set; }
    public int Month { get; set; }

    public decimal InitialAmount { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}


//Запланированные расходы
public class MonthlyPlannedExpense
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = default!;

    public int Year { get; set; }
    public int Month { get; set; }

    public int UserCategoryId { get; set; }
    public UserCategory Category { get; set; } = default!;

    public decimal PlannedAmount { get; set; }
}
//Переносимые на след месяца заплан. расходы(дефолтные)
public class RecurringPlannedExpense
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = default!;

    public int UserCategoryId { get; set; }
    public UserCategory Category { get; set; } = default!;

    public decimal PlannedAmount { get; set; }
    public bool IsActive { get; set; } = true;
}
//Запланированные доходы(чтобы сравнить с фактическими).
public class MonthlyPlannedIncome
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = default!;

    public int Year { get; set; }
    public int Month { get; set; }
    public int UserCategoryId { get; set; }
    public UserCategory Category { get; set; } = default!;
    public string? Description { get; set; }

    public decimal PlannedAmount { get; set; }
}

//Доходы
public class Income
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = default!;

    public DateTime Date { get; set; }

    public decimal Amount { get; set; }

    public string? Category { get; set; }   // тип дохода: зарплата, стипендия и т.п.
    public string? Description { get; set; }
}




//Ежемесячные доходы(Если запрлата или выпаты статичны)
public class RecurringIncome
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = default!;

    public decimal Amount { get; set; }
    public int UserCategoryId { get; set; }
    public string? Category { get; set; }
    public string? Description { get; set; }

    public bool IsActive { get; set; } = true;
}

