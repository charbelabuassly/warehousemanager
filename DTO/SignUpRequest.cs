using System.ComponentModel.DataAnnotations;

namespace warehousemanager.DTO
{
    public class SignUpRequest
    {
        // This governs how the "FORM" of the request should be like

        [Required, EmailAddress]
        public string Email { get; set; } = "";
        [Required]
        public string Password { get; set; } = "";
        [Required]
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        [Required]
        public AddressRequest Address { get; set; } = new AddressRequest();
    }
}
