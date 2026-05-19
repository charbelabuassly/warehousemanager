namespace warehousemanager.Models
{
    public class Users
    {
        public int UsersId {  get; set; }
        public string Fname { get; set; } = null!;
        public string Lname { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;

        public int RoleId { get; set; } = 1;//fk , 1 by default (Client)
        public bool IsActive { get; set; } = true;

        // Address fields added to match SignUpRequest.Address
        public string Street { get; set; } = null!;
        public string City { get; set; } = null!;
        public string Country { get; set; } = null!;

        public Role Role { get; set; } = null!;
        public ICollection<Orders> OrdersClient { get; set; } = new List<Orders>(); // This is used for building the relationship
        public ICollection<Orders> OrdersDelivery { get; set; } = new List<Orders>(); // This is used for building the relationship
    }
}
