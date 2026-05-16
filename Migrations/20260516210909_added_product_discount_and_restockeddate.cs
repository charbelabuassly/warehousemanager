using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace warehousemanager.Migrations
{
    /// <inheritdoc />
    public partial class added_product_discount_and_restockeddate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Discount",
                table: "_products",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastRestockedAt",
                table: "_products",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Discount",
                table: "_products");

            migrationBuilder.DropColumn(
                name: "LastRestockedAt",
                table: "_products");
        }
    }
}
