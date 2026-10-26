using System.Drawing;

namespace Fixtures.Clean
{
    /// <summary>Applies the dense, flat grid style shared by order screens.</summary>
    public sealed class OrderGridStyler
    {
        public void Apply(DevExpress.XtraGrid.Views.Grid.GridView view)
        {
            view.RowHeight = 28;
            view.OptionsView.EnableAppearanceEvenRow = false;
            view.Appearance.Row.BackColor = Color.White;
        }
    }
}
