using System.ComponentModel.DataAnnotations;

namespace warehousemanager.DTO
{
    public class ProfileUpdateRequest
    {
        [Required]
        public string Fname { get; set; } = "";

        [Required]
        public string Lname { get; set; } = "";

        [Required]
        public AddressRequest Address { get; set; } = new AddressRequest();
    }
}
