namespace warehousemanager.DTO
{
    public class AdminUserUpdateRequest
    {
        public string Fname { get; set; } = null!;
        public string Lname { get; set; } = null!;
        public string Email { get; set; } = null!;

        public int RoleId { get; set; }
        public bool IsActive { get; set; }

        public string Street { get; set; } = null!;
        public string City { get; set; } = null!;
        public string Country { get; set; } = null!;
    }
}

