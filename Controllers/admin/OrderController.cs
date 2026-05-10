using warehousemanager.Data;
using warehousemanager.DTO;
using warehousemanager.Models;
using warehousemanager.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace warehousemanager.Controllers.admin
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly LogisticContext _context;
        private readonly TokenService _token;

        public OrderController(LogisticContext context, TokenService token)
        {
            _context = context;
            _token = token;
        }

        // GET: api/Order
        [Authorize]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Orders>>> GetOrders() //assigned
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email)) return Unauthorized(new { Message = "Missing email claim in token" });

            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized(new { Message = "Admin user not found in database. Please log in again." });

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            var orders = await _context._orders
                .Include(o => o.Client)
                .Include(o => o.DeliveryPerson)
                .Where(o => o.status == OrderStaus.Assigned)
                .ToListAsync();
            
            return Ok(orders);
        }

        // GET: api/Order/pending-cancelled
        [Authorize]
        [HttpGet("pending-cancelled")]
        public async Task<ActionResult<IEnumerable<Orders>>> GetPendingAndCancelledOrders()
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email)) return Unauthorized(new { Message = "Missing email claim in token" });

            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized(new { Message = "Admin user not found in database. Please log in again." });

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            var orders = await _context._orders
                .Include(o => o.Client)
                .Include(o => o.DeliveryPerson)
                .Where(o => o.status == OrderStaus.Pending || o.status == OrderStaus.Cancelled)
                .ToListAsync();

            return Ok(orders);
        }

        // GET: api/Order/delivered
        [Authorize]
        [HttpGet("delivered")]
        public async Task<ActionResult<IEnumerable<Orders>>> GetDeliveredOrders()
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email)) return Unauthorized(new { Message = "Missing email claim in token" });

            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized(new { Message = "Admin user not found in database. Please log in again." });

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            var orders = await _context._orders
                .Include(o => o.Client)
                .Include(o => o.DeliveryPerson)
                .Where(o => o.status == OrderStaus.Delivered)
                .ToListAsync();

            return Ok(orders);
        }

        //Search QUERY URL, this url allows users to search orders using friendly fields
        [Authorize] // Query URL => GET /Order/search?q=john&clientId=1&deliveryPersonId=2&from=2024-01-01&to=2024-12-31
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Orders>>> SearchOrders(
            [FromQuery] string? q, //q can be any id, or any field such as Email, name, etc...
            [FromQuery] int? clientId,
            [FromQuery] int? deliveryPersonId,
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized(new { Message = "User not found" });

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            var query = _context._orders
                .AsNoTracking()
                .Include(o => o.Client)
                .Include(o => o.DeliveryPerson)
                .AsQueryable(); //Allows to keep appending conditions to the query

            if (!string.IsNullOrEmpty(q))
            {
                if (int.TryParse(q, out var id)) //checking if string can be parsed to an int
                {
                    query = query.Where(o => o.OrdersId == id || o.ClientId == id || o.DeliveryPersonId == id);
                }
                else
                {
                    //as we said since q can be anything we check if it fits one of these criteria
                    query = query.Where(o =>
                        EF.Functions.Like(o.Client.Email, $"%{q}%") ||
                        EF.Functions.Like(o.Client.Fname, $"%{q}%") ||
                        EF.Functions.Like(o.Client.Lname, $"%{q}%") ||
                        EF.Functions.Like(o.DeliveryPerson.Email, $"%{q}%") ||
                        EF.Functions.Like(o.DeliveryPerson.Fname, $"%{q}%") ||
                        EF.Functions.Like(o.DeliveryPerson.Lname, $"%{q}%"));
                }
            }

            if (clientId != null)
            {
                query = query.Where(o => o.ClientId == clientId);
            }
            if (deliveryPersonId != null)
            {
                query = query.Where(o => o.DeliveryPersonId == deliveryPersonId);
            }
            if (from != null)
            {
                query = query.Where(o => o.Schedule >= from);
            }
            if (to != null)
            {
                query = query.Where(o => o.Schedule <= to);
            }

            var res = await query.ToListAsync();
            return Ok(res);
        }

        // GET: api/Order/5
        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<Orders>> GetOrderById(int id)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized(new { Message = "User not found" });

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            var order = await _context._orders
                .Include(o => o.Client)
                .Include(o => o.DeliveryPerson)
                .FirstOrDefaultAsync(o => o.OrdersId == id);

            if (order == null) return NotFound(new { Message = "Order not found" });
            return Ok(order);
        }

        // POST: api/Order
        [Authorize] //rarely used as its automated
        [HttpPost]
        public async Task<ActionResult<Orders>> InsertOrder(Orders order)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized(new { Message = "User not found" });

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            if (order == null) return BadRequest(new { Message = "Order data is required" });

            _context._orders.Add(order);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetOrderById), new { id = order.OrdersId }, order);
        }

        // PATCH: api/Order/{orderId}/status
        // Admin can patch Pending/Cancelled/Assigned orders. Delivered orders are read-only here.
        [Authorize]
        [HttpPatch("{orderId}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int orderId, [FromBody] UpdateOrderStatusRequest request)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email)) return Unauthorized(new { Message = "Missing email claim in token" });

            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized(new { Message = "User not found" });

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            var order = await _context._orders.FirstOrDefaultAsync(o => o.OrdersId == orderId);
            if (order == null) return NotFound(new { Message = "Order not found" });

            if (order.status == OrderStaus.Delivered)
                return BadRequest(new { Message = "Delivered orders cannot be modified" });

            // Only allow patching statuses relevant to admin panel workflow
            if (request.Status != OrderStaus.Pending &&
                request.Status != OrderStaus.Assigned &&
                request.Status != OrderStaus.Cancelled)
            {
                return BadRequest(new { Message = "Invalid status" });
            }

            if (request.Status == OrderStaus.Assigned)
            {
                var newDeliveryPersonId = request.DeliveryPersonId ?? order.DeliveryPersonId;
                if (newDeliveryPersonId <= 0)
                    return BadRequest(new { Message = "DeliveryPersonId is required when assigning an order" });

                order.DeliveryPersonId = newDeliveryPersonId;
            }

            if (request.Status == OrderStaus.Pending)
            {
                // Pending means no delivery person assigned in this system
                order.DeliveryPersonId = -1;
            }

            order.status = request.Status;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PUT: api/Order/5
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrder(int id, Orders updated)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized(new { Message = "User not found" });

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            var existing = await _context._orders.FindAsync(id);
            if (existing == null) return NotFound(new { Message = "Order not found" });

            existing.ClientId = updated.ClientId;
            existing.DeliveryPersonId = updated.DeliveryPersonId;
            existing.Schedule = updated.Schedule;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/Order/5
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized(new { Message = "User not found" });

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            var existing = await _context._orders.FindAsync(id);
            if (existing == null) return NotFound(new { Message = "Order not found" });

            _context._orders.Remove(existing);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
