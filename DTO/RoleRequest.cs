using System.ComponentModel.DataAnnotations;

namespace warehousemanager.DTO
{
    public class RoleRequest

    {
        [Required]
        [Range(1, 3, ErrorMessage = "Invalid role")]
        public int RoleId { get; set; }
    }
}
