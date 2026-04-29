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
    public class AccountManagementController : ControllerBase
    {
        private readonly LogisticContext _context;
        private readonly TokenService _token;

        public AccountManagementController(LogisticContext context, TokenService token)
        {
            _context = context;
            _token = token;
        }

        // GET: api/AccountManagement
        [Authorize]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Users>>> GetUsers()
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email)) return Unauthorized(new { Message = "Session invalid: Missing email claim" });

            var user = await _context._users.AsNoTracking().FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized(new { Message = "Admin user not found in database" });

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized to view users" });
            }

            var users = await _context._users
                .AsNoTracking()
                .Include(u => u.Role)
                .ToListAsync();
            
            return Ok(users);
        }

        // GET: api/AccountManagement/search
        [Authorize]
        [HttpGet("search")]
        public async Task<ActionResult<PagedResponse<Users>>> SearchUsers(
            [FromQuery] string? q, //holds either name, email or lname
            [FromQuery] int? roleId,
            [FromQuery] bool? isActive,
            [FromQuery] string? city,
            [FromQuery] string? country,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users.AsNoTracking().FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized(new { Message = "User not found" });

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);

            var query = _context._users
                .AsNoTracking()
                .Include(u => u.Role)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.Trim();
                query = query.Where(u =>
                    EF.Functions.Like(u.Email, $"%{term}%") ||
                    EF.Functions.Like(u.Fname, $"%{term}%") ||
                    EF.Functions.Like(u.Lname, $"%{term}%"));
            }

            if (roleId.HasValue) query = query.Where(u => u.RoleId == roleId.Value);
            if (isActive.HasValue) query = query.Where(u => u.IsActive == isActive.Value);
            
            if (!string.IsNullOrWhiteSpace(city))
            {
                var term = city.Trim();
                query = query.Where(u => EF.Functions.Like(u.City, $"%{term}%"));
            }
            if (!string.IsNullOrWhiteSpace(country))
            {
                var term = country.Trim();
                query = query.Where(u => EF.Functions.Like(u.Country, $"%{term}%"));
            }

            var total = await query.CountAsync();
            var items = await query
                .OrderByDescending(u => u.UsersId)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new PagedResponse<Users>
            {
                Page = page,
                PageSize = pageSize,
                TotalCount = total,
                Items = items
            });
        }

        // GET: api/AccountManagement/5
        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<Users>> GetUserById(int id)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users.AsNoTracking().FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized(new { Message = "User not found" });

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            var u = await _context._users.Include(u => u.Role).FirstOrDefaultAsync(u => u.UsersId == id);
            if (u == null) return NotFound(new { Message = "User not found" });
            return Ok(u);
        }

        // PUT: api/AccountManagement/5
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, AdminUserUpdateRequest updated)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized(new { Message = "User not found" });

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            if (updated == null) return BadRequest(new { Message = "User data is required" });

            var existing = await _context._users.FindAsync(id);
            if (existing == null) return NotFound(new { Message = "User not found" });

            existing.Fname = updated.Fname;
            existing.Lname = updated.Lname;
            existing.Email = updated.Email;
            existing.RoleId = updated.RoleId;
            existing.IsActive = updated.IsActive;
            existing.Street = updated.Street;
            existing.City = updated.City;
            existing.Country = updated.Country;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/AccountManagement/5
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized(new { Message = "User not found" });

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            var existing = await _context._users.FindAsync(id);
            if (existing == null) return NotFound(new { Message = "User not found" });

            // Soft delete
            existing.IsActive = false;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PATCH: api/AccountManagement/5/role
        [Authorize]
        [HttpPatch("{id}/role")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] RoleRequest role)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized(new { Message = "User not found" });

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            var u = await _context._users.FindAsync(id);
            if (u == null) return NotFound(new { Message = "User not found" });

            u.RoleId = role.RoleId;
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
