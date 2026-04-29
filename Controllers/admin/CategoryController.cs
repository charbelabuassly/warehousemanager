using warehousemanager.Data;
using warehousemanager.Models;
using warehousemanager.Services;
using warehousemanager.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace warehousemanager.Controllers.admin
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly LogisticContext _context;
        private readonly TokenService _token;

        public CategoryController(LogisticContext context, TokenService token)
        {
            _context = context;
            _token = token;
        }

        // GET: api/Category
        [Authorize]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized(new { Message = "User not found" });

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            var categories = await _context._categories.AsNoTracking().ToListAsync();
            return Ok(categories);
        }

        //Search QUERY URL, this url allows users to search categories using friendly fields
        [Authorize] // Query URL => GET /Category/search?name=electronics
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Category>>> SearchCategories([FromQuery] string? name)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized(new { Message = "User not found" });

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            var query = _context._categories.AsNoTracking().AsQueryable();

            if (!string.IsNullOrEmpty(name))
            {
                query = query.Where(c => EF.Functions.Like(c.Name, $"%{name}%"));
            }

            var res = await query.ToListAsync();
            return Ok(res);
        }

        // GET: api/Category/5
        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<Category>> GetCategoryById(int id)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized(new { Message = "User not found" });

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            var category = await _context._categories.FindAsync(id);
            if (category == null) return NotFound(new { Message = "Category not found" });
            return Ok(category);
        }

        // POST: api/Category
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Category>> InsertCategory(Category category)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized(new { Message = "User not found" });

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            if (category == null) return BadRequest(new { Message = "Category data is required" });

            _context._categories.Add(category);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetCategoryById), new { id = category.CategoryId }, category);
        }

        // PUT: api/Category/5
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, Category category)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized(new { Message = "User not found" });

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            var existing = await _context._categories.FindAsync(id);
            if (existing == null) return NotFound(new { Message = "Category not found" });

            existing.Name = category.Name;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/Category/5
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized(new { Message = "User not found" });

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            var existing = await _context._categories.FindAsync(id);
            if (existing == null) return NotFound(new { Message = "Category not found" });

            _context._categories.Remove(existing);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
