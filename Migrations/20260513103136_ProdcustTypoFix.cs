using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace warehousemanager.Migrations
{
    /// <inheritdoc />
    public partial class ProdcustTypoFix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable(
            name: "_prodcust",
            newName: "_products");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
