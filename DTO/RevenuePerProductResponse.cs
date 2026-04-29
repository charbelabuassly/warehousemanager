namespace warehousemanager.DTO
{
    public class RevenuePerProductResponse
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public decimal Revenue { get; set; }
    }
}
