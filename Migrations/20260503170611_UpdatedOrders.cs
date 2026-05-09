using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace warehousemanager.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedOrders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "_orders",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Country",
                table: "_orders",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "DateDelivered",
                table: "_orders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Street",
                table: "_orders",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "status",
                table: "_orders",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "City",
                table: "_orders");

            migrationBuilder.DropColumn(
                name: "Country",
                table: "_orders");

            migrationBuilder.DropColumn(
                name: "DateDelivered",
                table: "_orders");

            migrationBuilder.DropColumn(
                name: "Street",
                table: "_orders");

            migrationBuilder.DropColumn(
                name: "status",
                table: "_orders");
        }
    }
}
