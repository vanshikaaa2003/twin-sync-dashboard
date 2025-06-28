export default function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array(6).fill(0).map((_, i) => (
        <td key={i} className="p-2 bg-gray-100 dark:bg-gray-700 h-4 rounded"></td>
      ))}
    </tr>
  );
}