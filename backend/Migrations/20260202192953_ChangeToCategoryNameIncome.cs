using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class ChangeToCategoryNameIncome : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Category",
                table: "RecurringIncomes",
                newName: "CategoryName");

            migrationBuilder.RenameColumn(
                name: "Category",
                table: "MonthlyPlannedIncomes",
                newName: "CategoryName");

            migrationBuilder.RenameColumn(
                name: "Category",
                table: "Incomes",
                newName: "CategoryName");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "CategoryName",
                table: "RecurringIncomes",
                newName: "Category");

            migrationBuilder.RenameColumn(
                name: "CategoryName",
                table: "MonthlyPlannedIncomes",
                newName: "Category");

            migrationBuilder.RenameColumn(
                name: "CategoryName",
                table: "Incomes",
                newName: "Category");
        }
    }
}
