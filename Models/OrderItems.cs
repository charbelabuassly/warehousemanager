namespace warehousemanager.Models
{
    public class OrderItems
    {
        public int OrderItemsId { get; set; }
        public int OrdersId { get; set; } //fk
        public int ProductsId { get; set; } //fk 
        public int Quantity { get; set; }
        public decimal PriceAtPurchase { get; set; }
        public Orders Order { get; set; } = null!;
        public Products Product { get; set; } = null!;

    }
}
