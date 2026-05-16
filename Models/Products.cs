using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography.X509Certificates;

namespace warehousemanager.Models
{
    public class Products
    {
        public int ProductsId { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int CategoryId { get; set; } //fk
        public int Quantity { get; set; }
        public int QuantitySold { get; set; } = 0;
        public DateTime LastRestockedAt { get; set; } = DateTime.UtcNow;

        [Range(0, 100)]
        public int Discount { get; set; } = 0; //percentage discount, 100 means no discount, 80 means 20% discount, etc.
        public Category category { get; set; } = null!;
        //public ICollection<OrderItems> OrderItems { get; } = new List<OrderItems>(); // This is used for building the relationship


    }
}
