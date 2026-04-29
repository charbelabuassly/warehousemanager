using System.ComponentModel.DataAnnotations;

namespace warehousemanager.DTO
{
    public class AuthResponse
    {
        [Required]
        public string Token { get; set; } = null!;
        [Required]
        public string Message { get; set; } = null!;
        [Required]
        public int Role { get; set; }
    }
}
