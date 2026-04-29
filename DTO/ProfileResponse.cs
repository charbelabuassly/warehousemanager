using System.ComponentModel.DataAnnotations;

namespace warehousemanager.DTO
{
    public class ProfileResponse
    {
        [Required]
        public int Id { get; set; }
        [Required]
        public string Fname { get; set; } = null!;
        [Required]
        public string Lname { get; set; } = null!;
        [Required]
        public AddressRequest address { get; set; } = new AddressRequest();
        [Required]
        public string Email { get; set; } = null!;
        [Required]
        public string Role { get; set; } = null!;
    }
}
