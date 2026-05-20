namespace warehousemanager.DTO
{
    public class ProductDTO
    {
        public int ProductsId { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int Discount { get; set; }
        public int CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public string? StockStatus { get; set; }
        public string ImageURL { get; set; } = string.Empty;
    }
}
