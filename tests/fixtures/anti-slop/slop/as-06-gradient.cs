using System.Drawing;
using System.Drawing.Drawing2D;

namespace Fixtures.Slop
{
    public static class HeaderPainter
    {
        public static void Paint(Graphics graphics, Rectangle bounds)
        {
            using var brush = new LinearGradientBrush(bounds, Color.SteelBlue, Color.MediumPurple, LinearGradientMode.Horizontal);
            graphics.FillRectangle(brush, bounds);
        }
    }
}
