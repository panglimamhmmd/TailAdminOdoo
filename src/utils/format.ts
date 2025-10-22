export function formatCurrency(value: number): string {
  if (isNaN(value)) return "Rp0";
  return value.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });
}
