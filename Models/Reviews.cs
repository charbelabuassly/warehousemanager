using System.ComponentModel.DataAnnotations;

namespace warehousemanager.Models
{
    public class Reviews
    {
        public int ProductsId { get; set; }
        public int UsersId { get; set; }

        [Range(0.0, 5.0, ErrorMessage = "Rating must be between 0 and 5.")]
        public float Rating { get; set; }
        public string Comment { get; set; } = null!;
    }
}
