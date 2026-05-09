using warehousemanager.Data;
using warehousemanager.DTO;
using warehousemanager.Models;
using warehousemanager.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;

namespace warehousemanager.Controllers.website
{
    [Route("api/[controller]")]
    [ApiController]
    public class ShopController : ControllerBase
    {
        private readonly LogisticContext _context;
        private readonly TokenService _token;

        public ShopController(LogisticContext context, TokenService token)
        {
            _context = context;
            _token = token;
        }

        // GET: api/Product -> All products will be displayed on the website
        //This is a protected route, user must be logged in to use this endpoint
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

                if (!_token.VerifyClient(user)) return Unauthorized(new { Message = "You are not authorized" });

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

        // GET: api/Product/5
        //This Endpoint will be used upon choosing a certain product, the ID will be injected into it
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

                if (!_token.VerifyClient(user)) return Unauthorized(new { Message = "You are not authorized" });

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

        //Get by Category, this will be used to filter products by categories
        [Authorize]
        [HttpGet("category/{CategoryId}")] //The reason we do so is since ASP will confuse if the passed param is designated for GetById or GetByCategory
        public async Task<ActionResult<IEnumerable<Products>>> GetProductByCategory(int CategoryId)
        {
            try
            {
                var email = User.FindFirst(ClaimTypes.Email)?.Value;
                if (string.IsNullOrWhiteSpace(email)) return Unauthorized(new { Message = "Missing email claim" });

                var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
                if (user == null) return Unauthorized(new { Message = "User not found" });

                if (!_token.VerifyClient(user)) return Unauthorized(new { Message = "You are not authorized" });

                var products = await _context._products
                    .AsNoTracking()
                    .Include(p => p.category)
                    .Where(p => p.CategoryId == CategoryId)
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

        //Search QUERY URL, this url allows users to search their products using any human friendly fields
        [Authorize] // Query URL => GET /shop/search?name=laptop&minPrice=100&maxPrice=500&categoryId=2
        //We will need to check for all of these fields, and they can be nullable, as another API call can be:
        //GET /shop/search?name=laptop
        //As we can see minPrice, maxPrice and category aren't availabe, meaning they are null by default
        [HttpGet("search")]
        public async Task<ActionResult<Products>> GetProductByFriendlyField([FromQuery] string? name, [FromQuery] int? minPrice, [FromQuery] int? maxPrice, [FromQuery] int ?categoryId)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return BadRequest();

            if (!_token.VerifyClient(user)) return Unauthorized(new { Message = "You are not authorized" });

            var query = _context._products.AsQueryable(); //This allows us to query the products to our liking

            if (!string.IsNullOrEmpty(name))
            {
                query = query.Where(p => EF.Functions.Like(p.Name, $"%{name}%"));  
            }
            if (minPrice != null)
            {
                query = query.Where(p => p.Price >= minPrice);
            }
            if (maxPrice != null)
            {
                query = query.Where(p => p.Price <= maxPrice);
            }
            if(categoryId != null)
            {
                query = query.Where(p => p.CategoryId == categoryId);
            }
            var res = await query.ToListAsync();
            if (res == null)
            {
                return NotFound(new { Message = "No products found" });
            }
            return Ok(res);
        }
    }
}
