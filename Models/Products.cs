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
        public int QuantitySold { get; set; }
        public Category category { get; set; } = null!;
        //public ICollection<OrderItems> OrderItems { get; } = new List<OrderItems>(); // This is used for building the relationship


    }
}
