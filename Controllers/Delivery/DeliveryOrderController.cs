using warehousemanager.Data;
using warehousemanager.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using warehousemanager.Services;

namespace warehousemanager.Controllers.Delivery
{
    [Route("api/[controller]")]
    [ApiController]
    public class DeliveryOrderController : ControllerBase
    {
        private readonly LogisticContext _context;
        private readonly TokenService _serv;

        public DeliveryOrderController(LogisticContext context, TokenService serv)
        {
            _context = context;
            _serv = serv;
        }

        // GET: api/DeliveryOrder/my-orders
        [Authorize]
        [HttpGet("my-orders")]
        public async Task<ActionResult<IEnumerable<DeliveryOrderResponse>>> GetMyOrders()
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email)) return Unauthorized(new { Message = "Missing email claim in token" });

            var user = await _context._users.AsNoTracking().FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized(new { Message = "User not found" });

            // RoleId: 1 = Client, 2 = Admin, 3 = Delivery
            if (!_serv.VerifyDelivery(user)) return Unauthorized(new { Message = "You are not authorized" });

            var orders = await _context._orders
                .AsNoTracking()
                .Where(o => o.DeliveryPersonId == user.UsersId)
                .Select(o => new DeliveryOrderResponse
                {
                    Schedule = o.Schedule,
                    ClientFirstName = o.Client.Fname,
                    ClientLastName = o.Client.Lname,
                    ClientEmail = o.Client.Email,
                    Street = o.Client.Street,
                    City = o.Client.City,
                    Country = o.Client.Country,
                    Items = _context._orderItems
                        .AsNoTracking()
                        .Where(oi => oi.OrdersId == o.OrdersId)
                        .Select(oi => new OrderItemsResponse
                        {
                            Name = oi.Product.Name,
                            Quantity = oi.Quantity
                        })
                        .ToList() //This LINQ gets inserts for oi.OrdersId all orders items into a custom DTO and returns them in a list form
                })
                .ToListAsync();

            return Ok(orders);
        }
    }
}

