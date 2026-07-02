import { cn } from "@/utils/cn";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-skeleton-loading rounded-md", className)}
      style={{
        background: `linear-gradient(90deg, rgba(0,0,0,0.06) 25%, 
        rgba(0,0,0,0.15) 37%, rgba(0,0,0,0.06) 63%)`,
        backgroundSize: "400px 100%",
      }}
      {...props}
    />
  );
}
export { Skeleton };
