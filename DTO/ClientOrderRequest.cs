namespace warehousemanager.DTO
{
    public class ClientOrderRequest
    {
        public AddressRequest Address { get; set; } = new AddressRequest();
        public List<ClientOrderItems> Items { get; set; } = new();
    }
}
