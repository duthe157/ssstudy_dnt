import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const typographyVariants = cva("text-foundation-400", {
  variants: {
    variant: {
      xl40: "text-xl40 font-bold leading-12",
      lg24: "text-lg24 font-semibold leading-8.5",
      md20: "text-xl font-medium",
      nm18: 'text-lg font-medium leading-[28px]',
      sm16: "text-base font-medium",
      xs14: "text-sm font-medium leading-[21px]",
      xs12: "text-[12px] font-normal leading-[16px]",
      xs10: "text-[10px] font-normal leading-[18px]",
    },
  },
  defaultVariants: {
    variant: "sm16",
  },
});

const variantMapping = {
  xl40: "h1",
  lg24: "h2",
  md20: "h3",
  nm18: 'h3',
  sm16: "p",
  xs14: "p",
  xs12: "p",
  xs10: "p",
} as const;

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: React.ElementType;
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, as, ...props }, ref) => {
    const Comp = as || (variant ? variantMapping[variant] : "p");
    return (
      <Comp
        className={cn(typographyVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Typography.displayName = "Typography";

export { Typography, typographyVariants };
