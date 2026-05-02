namespace warehousemanager.DTO
{
    public class OrderItemsResponse
    {
        //Used as a nested element, we need a list of it as well
        public string Name { get; set; } = null!;
        public int Quantity { get; set; }
    }
}

