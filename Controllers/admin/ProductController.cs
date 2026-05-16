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
    public class ProductController : ControllerBase
    {
        private readonly LogisticContext _context;
        private readonly TokenService _token;

        public ProductController(LogisticContext context, TokenService token)
        {
            _context = context;
            _token = token;
        }

        // GET: api/Product
        [Authorize]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Products>>> GetProducts()
        {
            try
            {
                var email = User.FindFirst(ClaimTypes.Email)?.Value;
                if (string.IsNullOrWhiteSpace(email)) return Unauthorized(new { Message = "Missing email claim" });

                var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
                if (user == null) return Unauthorized(new { Message = "User not found" });

                if (!_token.VerifyAdmin(user))
                {
                    return Unauthorized(new { Message = "You are not authorized" });
                }

                var products = await _context._products
                    .AsNoTracking()
                    .Include(p => p.category)
                    .ToListAsync();

                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "Failed to load products",
                    Detail = ex.Message
                });
            }
        }

        //Search QUERY URL, this url allows users to search products using friendly fields
        [Authorize] // Query URL => GET /Product/search?name=laptop&minPrice=100&maxPrice=500&categoryId=2&minQty=10&maxQty=100
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Products>>> SearchProducts(
            [FromQuery] string? name, 
            [FromQuery] decimal? minPrice, 
            [FromQuery] decimal? maxPrice, 
            [FromQuery] int? minQty, 
            [FromQuery] int? maxQty, 
            [FromQuery] int? categoryId)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrWhiteSpace(email)) return Unauthorized(new { Message = "Missing email" });

            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized(new { Message = "User not found" });

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            var query = _context._products
                .AsNoTracking()
                .Include(p => p.category)
                .AsQueryable();

            if (!string.IsNullOrEmpty(name))
            {
                query = query.Where(p =>
                    EF.Functions.Like(p.Name, $"%{name}%"));
            }
            if (minPrice != null)
            {
                query = query.Where(p => p.Price >= minPrice);
            }
            if (maxPrice != null)
            {
                query = query.Where(p => p.Price <= maxPrice);
            }
            if (minQty != null)
            {
                query = query.Where(p => p.Quantity >= minQty);
            }
            if (maxQty != null)
            {
                query = query.Where(p => p.Quantity <= maxQty);
            }
            if (categoryId != null)
            {
                query = query.Where(p => p.CategoryId == categoryId);
            }

            var res = await query.ToListAsync();
            return Ok(res);
        }

        // GET: api/Product/5
        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<Products>> GetProductById(int id)
        {
            try
            {
                var email = User.FindFirst(ClaimTypes.Email)?.Value;
                if (string.IsNullOrWhiteSpace(email)) return Unauthorized(new { Message = "Missing email claim" });

                var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
                if (user == null) return Unauthorized(new { Message = "User not found" });

                if (!_token.VerifyAdmin(user))
                {
                    return Unauthorized(new { Message = "You are not authorized" });
                }

                var product = await _context._products
                    .AsNoTracking()
                    .Include(p => p.category)
                    .FirstOrDefaultAsync(p => p.ProductsId == id);

                if (product == null) return NotFound(new { Message = "Product not found" });
                return Ok(product);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "Failed to load product",
                    Detail = ex.Message
                });
            }
        }

        // POST: api/Product
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Products>> InsertProduct(Products product)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return BadRequest("hi");

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            if (product == null) return BadRequest();

            _context._products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProductById), new { id = product.ProductsId }, product);
        }

        // PUT: api/Product/5
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, Products product)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return BadRequest();

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            if (product == null) return BadRequest();

            var existing = await _context._products.FindAsync(id);
            if (existing == null) return BadRequest();

            existing.Name = product.Name;
            existing.Description = product.Description;
            existing.Price = product.Price;
            existing.CategoryId = product.CategoryId;

            if (existing.Quantity > product.Quantity)
            {
                existing.LastRestockedAt = DateTime.UtcNow;
            }

            existing.Quantity = product.Quantity;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/Product/5
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return BadRequest();

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            var existing = await _context._products.FindAsync(id);
            if (existing == null) return BadRequest();

            _context._products.Remove(existing);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        //This final method, will deal with adding stocks 
        [Authorize]
        [HttpPatch("{id}/stock")] 
        public async Task<IActionResult> AddStock(int id, [FromBody] StockRequest stock)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return BadRequest();

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            var existing = await _context._products.FindAsync(id);
            if (existing == null) return BadRequest();

            if (stock.Amount < 0)
            {
                return BadRequest();
            }

            //else we can patch the stock
            existing.Quantity += stock.Amount;
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
