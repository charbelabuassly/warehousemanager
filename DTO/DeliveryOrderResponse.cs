namespace warehousemanager.DTO
{
    public class DeliveryOrderResponse
    {
        public DateTime Schedule { get; set; }

        public string ClientFirstName { get; set; } = null!;
        public string ClientLastName { get; set; } = null!;
        public string ClientEmail { get; set; } = null!;
        public string Street { get; set; } = null!;
        public string City { get; set; } = null!;
        public string Country { get; set; } = null!;

        public List<OrderItemsResponse> Items { get; set; } = new();
    }
}

