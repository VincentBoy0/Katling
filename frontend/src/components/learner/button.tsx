import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        // === DEFAULT ===
        default: "bg-primary text-primary-foreground hover:opacity-90",

        // === DESTRUCTIVE ===
        destructive:
          "bg-destructive text-white hover:opacity-90 dark:bg-destructive/60",

        // === OUTLINE ===
        outline:
          "border-2 bg-background shadow-xs hover:border-primary hover:bg-transparent hover:text-primary dark:bg-input/30 dark:border-input dark:hover:bg-transparent",

        // === SECONDARY ===
        secondary: "bg-secondary text-secondary-foreground hover:opacity-90",

        // === GHOST (đã xoá xanh hoàn toàn) ===
        ghost:
          "hover:bg-transparent hover:border hover:border-primary hover:text-primary border border-transparent",

        // === LINK ===
        link: "text-primary underline-offset-4 hover:underline",

        filter:
          "rounded-xl border-2 border-transparent bg-muted/30 text-muted-foreground font-bold",

        folder:
          "px-4 py-3 rounded-2xl border-2 font-bold bg-white text-muted-foreground border-border hover:-translate-y-1 transition-all",

        folderActive:
          "px-4 py-3 rounded-2xl border-2 font-bold opacity-100 transition-all",

        filterStatusAll:
          "px-3 py-1 rounded-lg text-xs font-bold transition-all bg-primary text-white",

        filterStatusNew:
          "px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 bg-blue-500 text-white",

        filterStatusLearning:
          "px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 bg-yellow-500 text-white",

        filterStatusMastered:
          "px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 bg-green-500 text-white",
      },

      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
