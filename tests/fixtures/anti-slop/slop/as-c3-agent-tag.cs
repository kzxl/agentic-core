namespace Fixtures.Slop
{
    public static class InvoiceRounding
    {
        // Fixed by Claude on 2026-10-26
        public static decimal Round(decimal amount) => decimal.Round(amount, 2);
    }
}
