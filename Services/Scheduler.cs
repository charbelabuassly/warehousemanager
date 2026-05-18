using Microsoft.EntityFrameworkCore;
using warehousemanager.Data;
using System.Linq;

namespace warehousemanager.Services
{
    public class Scheduler
    {
        //This class relies on the context, since we added the scope in program.cs it will be injected into it, when this class is instintiated

        private LogisticContext _context;

        public Scheduler(LogisticContext context)
        {
            _context = context;
        }

        //The scheduler will check the delivery man with the least delivery count and assign the order to them
        public async Task<int> SetDeliveryMan()
        {
            /*
             var min = await _context._orders
                .GroupBy(o => o.DeliveryPersonId)
                .Select(og => new { Count = og.Count() })
                .OrderBy(ogs => ogs.Count)
                .FirstOrDefaultAsync(); //Basically like using ToListAsync to fire up the query though its used here to return the first result from the upper queries

            if (min == null)
            {
                return -1; //will be set as pending in the db, admin will resolve it
            }

            var user = await _context._orders
                .GroupBy(o => o.DeliveryPersonId)
                .Select(og => new
                {
                    Id = og.Key,
                    DeliveryCount = og.Count()
                }).Where(ogs => ogs.DeliveryCount == min.Count)
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return -1; //will be set as pending in the db, admin will resolve it
            }

            //else all is good, return delivery man id
            return user.Id;
            */

            var deliveryManId = await _context._users
                .Where(u => u.RoleId == 3 && u.IsActive == true)
                .OrderBy(u => u.OrdersDelivery.Count())
                .Select(u => u.UsersId)
                .FirstOrDefaultAsync();

            return deliveryManId == 0 ? -1 : deliveryManId;
        }
    }
}
