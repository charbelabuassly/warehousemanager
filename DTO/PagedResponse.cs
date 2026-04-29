namespace warehousemanager.DTO
{
    public class PagedResponse<T>
    {
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public IEnumerable<T> Items { get; set; } = Array.Empty<T>();
    }
}

