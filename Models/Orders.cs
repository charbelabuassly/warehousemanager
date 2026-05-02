using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using System.Reflection.Metadata;

namespace warehousemanager.Models
{
    public class Orders
    {
        public int OrdersId { get; set; }    
        public int ClientId { get; set; }    //fk
        public int DeliveryPersonId { get; set; } //fk
        public DateTime Schedule { get; set; } // Date order submitted
        public Users Client { get; set; } = null!;
        public Users DeliveryPerson { get; set; } = null!;
        public OrderStaus status { get; set; } = OrderStaus.Pending;

        // Address fields added to make orders flexible, what if we are ordering to another place?
        public string Street { get; set; } = null!;
        public string City { get; set; } = null!;
        public string Country { get; set; } = null!;
        //public ICollection<OrderItems> OrderItems { get; } = new List<OrderItems>(); // This is used for building the relationship

    }
}
