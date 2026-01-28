using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class FixPlannedExpensesIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MonthlyPlannedExpenses_UserCategories_CategoryId",
                table: "MonthlyPlannedExpenses");

            migrationBuilder.DropForeignKey(
                name: "FK_RecurringPlannedExpenses_UserCategories_CategoryId",
                table: "RecurringPlannedExpenses");

            migrationBuilder.DropIndex(
                name: "IX_MonthlyPlannedExpenses_UserId_Year_Month_CategoryName",
                table: "MonthlyPlannedExpenses");

            migrationBuilder.DropColumn(
                name: "CategoryName",
                table: "RecurringPlannedExpenses");

            migrationBuilder.DropColumn(
                name: "CategoryName",
                table: "MonthlyPlannedExpenses");

            migrationBuilder.RenameColumn(
                name: "CategoryId",
                table: "RecurringPlannedExpenses",
                newName: "UserCategoryId");

            migrationBuilder.RenameIndex(
                name: "IX_RecurringPlannedExpenses_CategoryId",
                table: "RecurringPlannedExpenses",
                newName: "IX_RecurringPlannedExpenses_UserCategoryId");

            migrationBuilder.RenameColumn(
                name: "CategoryId",
                table: "MonthlyPlannedExpenses",
                newName: "UserCategoryId");

            migrationBuilder.RenameIndex(
                name: "IX_MonthlyPlannedExpenses_CategoryId",
                table: "MonthlyPlannedExpenses",
                newName: "IX_MonthlyPlannedExpenses_UserCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_MonthlyPlannedExpenses_UserId_Year_Month_UserCategoryId",
                table: "MonthlyPlannedExpenses",
                columns: new[] { "UserId", "Year", "Month", "UserCategoryId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_MonthlyPlannedExpenses_UserCategories_UserCategoryId",
                table: "MonthlyPlannedExpenses",
                column: "UserCategoryId",
                principalTable: "UserCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_RecurringPlannedExpenses_UserCategories_UserCategoryId",
                table: "RecurringPlannedExpenses",
                column: "UserCategoryId",
                principalTable: "UserCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MonthlyPlannedExpenses_UserCategories_UserCategoryId",
                table: "MonthlyPlannedExpenses");

            migrationBuilder.DropForeignKey(
                name: "FK_RecurringPlannedExpenses_UserCategories_UserCategoryId",
                table: "RecurringPlannedExpenses");

            migrationBuilder.DropIndex(
                name: "IX_MonthlyPlannedExpenses_UserId_Year_Month_UserCategoryId",
                table: "MonthlyPlannedExpenses");

            migrationBuilder.RenameColumn(
                name: "UserCategoryId",
                table: "RecurringPlannedExpenses",
                newName: "CategoryId");

            migrationBuilder.RenameIndex(
                name: "IX_RecurringPlannedExpenses_UserCategoryId",
                table: "RecurringPlannedExpenses",
                newName: "IX_RecurringPlannedExpenses_CategoryId");

            migrationBuilder.RenameColumn(
                name: "UserCategoryId",
                table: "MonthlyPlannedExpenses",
                newName: "CategoryId");

            migrationBuilder.RenameIndex(
                name: "IX_MonthlyPlannedExpenses_UserCategoryId",
                table: "MonthlyPlannedExpenses",
                newName: "IX_MonthlyPlannedExpenses_CategoryId");

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

            migrationBuilder.AddForeignKey(
                name: "FK_MonthlyPlannedExpenses_UserCategories_CategoryId",
                table: "MonthlyPlannedExpenses",
                column: "CategoryId",
                principalTable: "UserCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_RecurringPlannedExpenses_UserCategories_CategoryId",
                table: "RecurringPlannedExpenses",
                column: "CategoryId",
                principalTable: "UserCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
