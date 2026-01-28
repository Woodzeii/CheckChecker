using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class SyncModelAfterBudget : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_MonthlyPlannedExpenses_UserId_Year_Month_CategoryId",
                table: "MonthlyPlannedExpenses");

            migrationBuilder.AddColumn<string>(
                name: "CategoryName",
                table: "RecurringPlannedExpenses",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CategoryName",
                table: "MonthlyPlannedExpenses",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_MonthlyPlannedExpenses_UserId_Year_Month_CategoryName",
                table: "MonthlyPlannedExpenses",
                columns: new[] { "UserId", "Year", "Month", "CategoryName" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_MonthlyPlannedExpenses_UserId_Year_Month_CategoryName",
                table: "MonthlyPlannedExpenses");

            migrationBuilder.DropColumn(
                name: "CategoryName",
                table: "RecurringPlannedExpenses");

            migrationBuilder.DropColumn(
                name: "CategoryName",
                table: "MonthlyPlannedExpenses");

            migrationBuilder.CreateIndex(
                name: "IX_MonthlyPlannedExpenses_UserId_Year_Month_CategoryId",
                table: "MonthlyPlannedExpenses",
                columns: new[] { "UserId", "Year", "Month", "CategoryId" },
                unique: true);
        }
    }
}
