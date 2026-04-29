using System.ComponentModel.DataAnnotations;

namespace warehousemanager.DTO
{
    public class StockRequest
    {
        [Required]
        public int Amount { get; set; }
    }
}
