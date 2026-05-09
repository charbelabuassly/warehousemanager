using warehousemanager.Data;
using warehousemanager.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using warehousemanager.Services;
using System;

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
        public async Task<ActionResult<IEnumerable<DeliveryOrderResponse>>> GetMyOrders()  // ONLY ASSIGNED ORDERS
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email)) return Unauthorized(new { Message = "Missing email claim in token" });

            var user = await _context._users.AsNoTracking().FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized(new { Message = "User not found" });

            // RoleId: 1 = Client, 2 = Admin, 3 = Delivery
            if (!_serv.VerifyDelivery(user)) return Unauthorized(new { Message = "You are not authorized" });

            var orders = await _context._orders //no reason to check something was returned as the query firer (ToLisrAsync) returns an [] which is totally valid
                .AsNoTracking()
                .Where(o => o.DeliveryPersonId == user.UsersId && o.status == Models.OrderStaus.Assigned)
                .Select(o => new DeliveryOrderResponse
                {
                    OrdersId = o.OrdersId,
                    Schedule = o.Schedule,
                    Status = o.status,
                    DateDelivered = o.DateDelivered,
                    ClientFirstName = o.Client.Fname,
                    ClientLastName = o.Client.Lname,
                    ClientEmail = o.Client.Email,
                    Street = o.Street,
                    City = o.City,
                    Country = o.Country,
                    Items = o.OrderItems
                        .Select(oi => new OrderItemsResponse
                        {
                            Name = oi.Product.Name,
                            Quantity = oi.Quantity
                        })
                        .ToList()
                })
                .ToListAsync();

            return Ok(orders);
        }

        // GET: api/DeliveryOrder/delivered
        [Authorize]
        [HttpGet("delivered")]
        public async Task<ActionResult<IEnumerable<DeliveryOrderResponse>>> GetMyDeliveredOrders() // ONLY DELIVERED ORDERS
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email)) return Unauthorized(new { Message = "Missing email claim in token" });

            var user = await _context._users.AsNoTracking().FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized(new { Message = "User not found" });

            if (!_serv.VerifyDelivery(user)) return Unauthorized(new { Message = "You are not authorized" });

            var orders = await _context._orders
                .AsNoTracking()
                .Where(o => o.DeliveryPersonId == user.UsersId && o.status == Models.OrderStaus.Delivered)
                .Select(o => new DeliveryOrderResponse
                {
                    OrdersId = o.OrdersId,
                    Schedule = o.Schedule,
                    Status = o.status,
                    DateDelivered = o.DateDelivered,
                    ClientFirstName = o.Client.Fname,
                    ClientLastName = o.Client.Lname,
                    ClientEmail = o.Client.Email,
                    Street = o.Street,
                    City = o.City,
                    Country = o.Country,
                    Items = o.OrderItems
                        .Select(oi => new OrderItemsResponse
                        {
                            Name = oi.Product.Name,
                            Quantity = oi.Quantity
                        })
                        .ToList()
                })
                .ToListAsync();

            return Ok(orders);
        }

        // PATCH: api/DeliveryOrder/{orderId}/status => This will be used to change the status of the Delivery
        [Authorize]
        [HttpPatch("{orderId}/status")]
        public async Task<IActionResult> UpdateStatus(int orderId, [FromBody] UpdateOrderStatusRequest request)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email)) return Unauthorized(new { Message = "Missing email claim in token" });

            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized(new { Message = "User not found" });
            if (!_serv.VerifyDelivery(user)) return Unauthorized(new { Message = "You are not authorized" });

            var order = await _context._orders.FirstOrDefaultAsync(o => o.OrdersId == orderId);
            if (order == null) return NotFound(new { Message = "Order not found" });
            if (order.DeliveryPersonId != user.UsersId) return Unauthorized(new { Message = "You are not authorized for this order" });

            // Pending not assigned yet => delivery cannot change it, scheduler is resposbile for this
            if (order.status == Models.OrderStaus.Pending)
                return BadRequest(new { Message = "Order is not assigned yet" });

            if (order.status == Models.OrderStaus.Delivered || order.status == Models.OrderStaus.Cancelled)
                return BadRequest(new { Message = "Order status can no longer be changed" });

            if (request.Status != Models.OrderStaus.Delivered && request.Status != Models.OrderStaus.Cancelled)
                return BadRequest(new { Message = "Delivery can only set Delivered or Cancelled" });
            //Making sure that the delivery man cannot cancel past 1 day
            if((DateTime.Now.Date - order.Schedule.Date).Days > 1)
            {
                return BadRequest(new { Message = "More than one day has passed, cannot cancel anymore" });
            }
            //If the requested status is delivery we do not need to check anything
            order.status = request.Status;
            if (request.Status == Models.OrderStaus.Delivered)
            {
                order.DateDelivered = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        //This method will allow us to get a delivery by ID
        [Authorize]
        [HttpGet("{orderId}")]
        public async Task<ActionResult<DeliveryOrderResponse>> GetMyOrder(int orderId) 
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email)) return Unauthorized(new { Message = "Missing email claim in token" });

            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized(new { Message = "User not found" });
            if (!_serv.VerifyDelivery(user)) return Unauthorized(new { Message = "You are not authorized" });


            var order = await _context._orders
                .AsNoTracking()
                .Where(o => o.DeliveryPersonId == user.UsersId && o.OrdersId == orderId)
                .Select(o => new DeliveryOrderResponse
                {
                    OrdersId = o.OrdersId,
                    Schedule = o.Schedule,
                    Status = o.status,
                    DateDelivered = o.DateDelivered,
                    ClientFirstName = o.Client.Fname,
                    ClientLastName = o.Client.Lname,
                    ClientEmail = o.Client.Email,
                    Street = o.Street,
                    City = o.City,
                    Country = o.Country,
                    Items = o.OrderItems
                        .Select(oi => new OrderItemsResponse
                        {
                            Name = oi.Product.Name,
                            Quantity = oi.Quantity
                        })
                        .ToList()
                })
                .FirstOrDefaultAsync();

            if (order == null) return NotFound(new { Message = "Order not found" });
            return Ok(order);


        }
    }
}
