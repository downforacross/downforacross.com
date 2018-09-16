// partialGrid: Array(Array(cell))
// cell: { value: '.' if black, '[a-z]' or '' otherwise, pencil: boolean/null }
export const fillGrid = partialGrid => {
  const grid = partialGrid.map(row => (
    row.map(cell => ({
      ...cell,
      value: cell.value === '' ? '?' : cell.value,
    }))
  ));
  return grid
}
