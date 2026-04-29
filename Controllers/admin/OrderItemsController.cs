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
    public class OrderItemsController : ControllerBase
    {
        private readonly LogisticContext _context;
        private readonly TokenService _token;

        public OrderItemsController(LogisticContext context, TokenService token)
        {
            _context = context;
            _token = token;
        }

        // GET: api/OrderItems
        [Authorize]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderItems>>> GetOrderItems()
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null) return BadRequest();

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            var items = await _context._orderItems.ToListAsync();
            if (items == null) return BadRequest();
            return Ok(items);
        }

        //Search QUERY URL, this url allows users to search order items using friendly fields
        [Authorize] // Query URL => GET /OrderItems/search?ordersId=1&productsId=2
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<OrderItems>>> SearchOrderItems(
            [FromQuery] int? ordersId,
            [FromQuery] int? productsId)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return BadRequest();

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            var query = _context._orderItems
                .AsNoTracking()
                .AsQueryable();

            if (ordersId != null)
            {
                query = query.Where(i => i.OrdersId == ordersId);
            }
            if (productsId != null)
            {
                query = query.Where(i => i.ProductsId == productsId);
            }

            var res = await query.ToListAsync();
            return Ok(res);
        }

        // GET: api/OrderItems/5
        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderItems>> GetOrderItemById(int id)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null) return BadRequest();

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            var item = await _context._orderItems.FindAsync(id);
            if (item == null) return BadRequest();
            return Ok(item);
        }

        // POST: api/OrderItems
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<OrderItems>> InsertOrderItem(OrderItems item)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null) return BadRequest();

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            if (item == null) return BadRequest();

            _context._orderItems.Add(item);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetOrderItemById), new { id = item.OrderItemsId }, item);
        }

        // PUT: api/OrderItems/5
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrderItem(int id, OrderItems updated)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null) return BadRequest();

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            if (updated == null) return BadRequest();

            var existing = await _context._orderItems.FindAsync(id);
            if (existing == null) return BadRequest();

            existing.OrdersId = updated.OrdersId;
            existing.ProductsId = updated.ProductsId;
            existing.Quantity = updated.Quantity;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/OrderItems/5
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrderItem(int id)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null) return BadRequest();

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            var existing = await _context._orderItems.FindAsync(id);
            if (existing == null) return BadRequest();

            _context._orderItems.Remove(existing);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
