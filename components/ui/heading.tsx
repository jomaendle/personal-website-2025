import { cn } from "@/lib/utils";

const BlogH1 = ({
  children,
  ...props
}: {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h1 className="text-2xl font-normal tracking-tight mb-8" {...props}>
      {children}
    </h1>
  );
};

const H1 = ({
  children,
  ...props
}: {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h1 className="text-2xl mb-1" {...props}>
      {children}
    </h1>
  );
};

const H2 = ({
  children,
  ...props
}: {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h2
      {...props}
      className={cn(
        "text-sm uppercase tracking-wider text-muted-foreground mb-6",
        props.className,
      )}
    >
      {children}
    </h2>
  );
};

const H3 = ({
  children,
  ...props
}: {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h3
      className="text-foreground group-hover:text-underline transition-colors"
      {...props}
    >
      {children}
    </h3>
  );
};

export { H1, H2, H3, BlogH1 };
