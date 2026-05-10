using warehousemanager.Data;
using warehousemanager.DTO;
using warehousemanager.Models;
using warehousemanager.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace warehousemanager.Controllers.website
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly LogisticContext _context;
        private readonly TokenService _token;
        private readonly Scheduler _scheduler;

        public OrderController(LogisticContext context, TokenService token, Scheduler scheduler)
        {
            _context = context;
            _token = token;
            _scheduler = scheduler;
        }

        // POST: api/Order
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Orders>> PutOrder([FromBody] ClientOrderRequest request)
        {
            if (request == null) return BadRequest(new { Message = "Order data is required" });
            if (request.Address == null) return BadRequest(new { Message = "Address is required" });
            if (request.Items == null || request.Items.Count == 0) return BadRequest(new { Message = "At least one item is required" });

            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrWhiteSpace(email)) return Unauthorized(new { Message = "Missing email claim" });

            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized(new { Message = "User not found" });

            if (!_token.VerifyClient(user)) return Unauthorized(new { Message = "You are not authorized" });

            var deliveryPersonId = await _scheduler.SetDeliveryMan(); // getting the delivery man

            Orders order_toMake = new();
            //The scheduler will be used to set the schedule of this order, that means WHO will be tasked with delivering it
            order_toMake.ClientId = user.UsersId;
            order_toMake.DeliveryPersonId = deliveryPersonId;
            order_toMake.Schedule = DateTime.UtcNow;
            order_toMake.status = deliveryPersonId != -1 ? OrderStaus.Assigned : OrderStaus.Pending;
            order_toMake.Street = request.Address.Street;
            order_toMake.City = request.Address.City;
            order_toMake.Country = request.Address.Country;

            _context._orders.Add(order_toMake);
            await _context.SaveChangesAsync();

            foreach (var item in request.Items)
            {
                //Query that gets the current price of the product:
                var chosen_item = await _context._products.FindAsync(item.ProductId);
                if (chosen_item == null)
                {
                    return NotFound(new {Message = "Item not found"});
                }

                OrderItems orderItem = new();
                orderItem.OrdersId = order_toMake.OrdersId;
                orderItem.ProductsId = item.ProductId;
                orderItem.Quantity = item.Quantity;
                orderItem.PriceAtPurchase = chosen_item.Price; 

                _context._orderItems.Add(orderItem);
            }

            await _context.SaveChangesAsync();

            return Ok(order_toMake);
        }
    }
}
