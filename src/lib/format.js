export function formatVND(value) {
  if (value === null || value === undefined) return "";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("vi-VN");
  } catch {
    return value;
  }
}
