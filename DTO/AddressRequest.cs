using System.ComponentModel.DataAnnotations;

namespace warehousemanager.DTO
{
    public class AddressRequest
    {
        // Will be nested inside of the SignUpRequest
        [Required]
        public string Street { get; set; } = "";
        [Required]
        public string City { get; set; } = "";
        [Required]
        public string Country { get; set; } = "";

    }
}
