export default function OrderStatusBadge({ status }) {
  const value = typeof status === "string" && status.trim() ? status.trim() : "Unknown";

  return (
    <span className="inline-flex rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-800">
      {value}
    </span>
  );
}
