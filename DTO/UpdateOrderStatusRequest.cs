using warehousemanager.Models;

namespace warehousemanager.DTO
{
    public class UpdateOrderStatusRequest
    {
        public OrderStaus Status { get; set; }
        public int? DeliveryPersonId { get; set; }
    }
}
