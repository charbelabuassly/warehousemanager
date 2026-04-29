using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace warehousemanager.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "_categories",
                columns: table => new
                {
                    CategoryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__categories", x => x.CategoryId);
                });

            migrationBuilder.CreateTable(
                name: "_roles",
                columns: table => new
                {
                    RoleId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__roles", x => x.RoleId);
                });

            migrationBuilder.CreateTable(
                name: "_prodcust",
                columns: table => new
                {
                    ProductsId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CategoryId = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__prodcust", x => x.ProductsId);
                    table.ForeignKey(
                        name: "FK__prodcust__categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "_categories",
                        principalColumn: "CategoryId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "_users",
                columns: table => new
                {
                    UsersId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Fname = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Lname = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Password = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RoleId = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Street = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    City = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Country = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__users", x => x.UsersId);
                    table.ForeignKey(
                        name: "FK__users__roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "_roles",
                        principalColumn: "RoleId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "_orders",
                columns: table => new
                {
                    OrdersId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClientId = table.Column<int>(type: "int", nullable: false),
                    DeliveryPersonId = table.Column<int>(type: "int", nullable: false),
                    Schedule = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__orders", x => x.OrdersId);
                    table.ForeignKey(
                        name: "FK__orders__users_ClientId",
                        column: x => x.ClientId,
                        principalTable: "_users",
                        principalColumn: "UsersId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK__orders__users_DeliveryPersonId",
                        column: x => x.DeliveryPersonId,
                        principalTable: "_users",
                        principalColumn: "UsersId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "_orderItems",
                columns: table => new
                {
                    OrderItemsId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrdersId = table.Column<int>(type: "int", nullable: false),
                    ProductsId = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    PriceAtPurchase = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__orderItems", x => x.OrderItemsId);
                    table.ForeignKey(
                        name: "FK__orderItems__orders_OrdersId",
                        column: x => x.OrdersId,
                        principalTable: "_orders",
                        principalColumn: "OrdersId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK__orderItems__prodcust_ProductsId",
                        column: x => x.ProductsId,
                        principalTable: "_prodcust",
                        principalColumn: "ProductsId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX__orderItems_OrdersId",
                table: "_orderItems",
                column: "OrdersId");

            migrationBuilder.CreateIndex(
                name: "IX__orderItems_ProductsId",
                table: "_orderItems",
                column: "ProductsId");

            migrationBuilder.CreateIndex(
                name: "IX__orders_ClientId",
                table: "_orders",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX__orders_DeliveryPersonId",
                table: "_orders",
                column: "DeliveryPersonId");

            migrationBuilder.CreateIndex(
                name: "IX__prodcust_CategoryId",
                table: "_prodcust",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX__users_Email",
                table: "_users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX__users_RoleId",
                table: "_users",
                column: "RoleId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "_orderItems");

            migrationBuilder.DropTable(
                name: "_orders");

            migrationBuilder.DropTable(
                name: "_prodcust");

            migrationBuilder.DropTable(
                name: "_users");

            migrationBuilder.DropTable(
                name: "_categories");

            migrationBuilder.DropTable(
                name: "_roles");
        }
    }
}
