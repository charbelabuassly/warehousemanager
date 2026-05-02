namespace warehousemanager.Models
{
    public enum OrderStaus
    {
        Pending, //This is used when the delivery man has not been assigned yet => The automatic scheduler will choose the DELIVERY MAN based on least total orders count
        Assigned,
        Delivered,
        Cancelled
    }
}
