export default function SkeletonRow({ rows = 3 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-gray-200/70 h-10 rounded mb-2"
        />
      ))}
    </>
  );
}
