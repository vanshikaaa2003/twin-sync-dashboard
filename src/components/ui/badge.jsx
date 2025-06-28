import { cn } from "@/lib/utils";

export function Badge({ className, children, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-100",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
