
using warehousemanager.Models;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Metadata;

namespace warehousemanager.Data
{
    public class LogisticContext : DbContext
    {
        public LogisticContext (DbContextOptions<LogisticContext> options) : base(options)
        {

        }
        public DbSet<Category> _categories { get; set; }
        public DbSet<Orders> _orders { get; set; }  
        public DbSet<OrderItems> _orderItems { get; set; }
        public DbSet<Products> _products { get; set; }
        public DbSet<Role> _roles { get; set; }
        public DbSet<Users> _users { get; set; }
        public DbSet<Reviews> _reviews { get; set; }

        //This method is used for manual configurations of the FKs.
        protected override void OnModelCreating(ModelBuilder modelBuilder) //used for manual configurations
        {
            // -----------------------
            // Order FK configs 
            // -----------------------
            modelBuilder.Entity<Orders>()
                .HasOne(e => e.Client)
                .WithMany(e => e.OrdersClient)
                .HasForeignKey(e => e.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Orders>()
                .HasOne(e => e.DeliveryPerson)
                .WithMany(e => e.OrdersDelivery)
                .HasForeignKey(e => e.DeliveryPersonId)
                .OnDelete(DeleteBehavior.Restrict);

            //The main idea for defining special case FKs is to define the very relation between the 2 related tables themselves

            // The rest are not configured as EF can infer which is the Fk to which.

            // ------------------------
            // EMAIL SHOULD BE UNIQUE
            // ------------------------
            modelBuilder.Entity<Users>()
                .HasIndex(u => u.Email) //stating that the table has another index other than the Pk and that it should be unique
                .IsUnique();

            modelBuilder.Entity<Reviews>()
            .HasKey(r => new { r.ProductsId, r.UsersId });
        }
    }
}
