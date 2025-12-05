export function getContrastColor(hexColor: string | undefined) {
  // Convert hex to RGB
  console.log(hexColor)
  if (hexColor === undefined) return 'text-white'
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  console.log(r, g, b)
  // Calculate YIQ ratio
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

  // Return Tailwind class based on brightness (128 is the middle point)
  console.log(yiq)
  return yiq >= 128 ? 'text-black' : 'text-white';
}