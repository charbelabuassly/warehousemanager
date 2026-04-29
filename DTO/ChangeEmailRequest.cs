using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace warehousemanager.DTO
{
    public class ChangeEmailRequest
    {
        [Required, EmailAddress]
        public string EmailAddress { get; set; } = null!;
        [Required]
        public string Password { get; set; } = null!;
    }
}
