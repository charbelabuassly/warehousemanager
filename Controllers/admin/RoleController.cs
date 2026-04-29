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
    public class RoleController : ControllerBase
    {
        private readonly LogisticContext _context;
        private readonly TokenService _token;

        public RoleController(LogisticContext context, TokenService token)
        {
            _context = context;
            _token = token;
        }

        // GET: api/Role
        [Authorize]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Role>>> GetRoles()
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized(new { Message = "User not found" });

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            var roles = await _context._roles.AsNoTracking().ToListAsync();
            return Ok(roles);
        }

        //Search QUERY URL, this url allows users to search roles using friendly fields
        [Authorize] // Query URL => GET /Role/search?roleName=admin
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Role>>> SearchRoles([FromQuery] string? roleName)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized(new { Message = "User not found" });

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            var query = _context._roles.AsNoTracking().AsQueryable();

            if (!string.IsNullOrEmpty(roleName))
            {
                query = query.Where(r => EF.Functions.Like(r.RoleName, $"%{roleName}%"));
            }

            var res = await query.ToListAsync();
            return Ok(res);
        }

        // GET: api/Role/5
        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<Role>> GetRoleById(int id)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized(new { Message = "User not found" });

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            var role = await _context._roles.FindAsync(id);
            if (role == null) return NotFound(new { Message = "Role not found" });
            return Ok(role);
        }

        // POST: api/Role
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Role>> InsertRole(Role role)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized(new { Message = "User not found" });

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            if (role == null) return BadRequest(new { Message = "Role data is required" });

            _context._roles.Add(role);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetRoleById), new { id = role.RoleId }, role);
        }

        // PUT: api/Role/5
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRole(int id, Role role)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized(new { Message = "User not found" });

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            var existing = await _context._roles.FindAsync(id);
            if (existing == null) return NotFound(new { Message = "Role not found" });

            existing.RoleName = role.RoleName;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/Role/5
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRole(int id)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized(new { Message = "User not found" });

            if (!_token.VerifyAdmin(user))
            {
                return Unauthorized(new { Message = "You are not authorized" });
            }

            var existing = await _context._roles.FindAsync(id);
            if (existing == null) return NotFound(new { Message = "Role not found" });

            _context._roles.Remove(existing);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
