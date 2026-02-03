using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class NewMonthlyPlannedIncome : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MonthlyPlannedIncomes_UserCategories_UserCategoryId",
                table: "MonthlyPlannedIncomes");

            migrationBuilder.DropIndex(
                name: "IX_MonthlyPlannedIncomes_UserCategoryId",
                table: "MonthlyPlannedIncomes");

            migrationBuilder.DropColumn(
                name: "UserCategoryId",
                table: "MonthlyPlannedIncomes");

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "UserCategories",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "MonthlyPlannedIncomes",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Type",
                table: "UserCategories");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "MonthlyPlannedIncomes");

            migrationBuilder.AddColumn<int>(
                name: "UserCategoryId",
                table: "MonthlyPlannedIncomes",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_MonthlyPlannedIncomes_UserCategoryId",
                table: "MonthlyPlannedIncomes",
                column: "UserCategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_MonthlyPlannedIncomes_UserCategories_UserCategoryId",
                table: "MonthlyPlannedIncomes",
                column: "UserCategoryId",
                principalTable: "UserCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
