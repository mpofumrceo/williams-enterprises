import { cn } from "@/src/lib/utils/cn";

export function GlassPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("panel-glass rounded-3xl", className)}>{children}</div>;
}

export function SkeuoCard({
  children,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "article" | "section";
}) {
  return <Tag className={cn("panel-skeuo rounded-3xl", className)}>{children}</Tag>;
}

export function ClayCard({
  children,
  className,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <div className={cn("panel-clay rounded-3xl p-6", className)}>
      {title && <h3 className="mb-4 text-lg font-semibold text-navy">{title}</h3>}
      {children}
    </div>
  );
}

export function SectionEyebrow({
  children,
  light,
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <p
      className={cn(
        "text-xs font-semibold uppercase tracking-[0.22em]",
        light ? "text-amber-300" : "text-amber-700"
      )}
    >
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  light,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  light?: boolean;
}) {
  return (
    <div className="max-w-2xl">
      <SectionEyebrow light={light}>{eyebrow}</SectionEyebrow>
      <h2 className={cn("mt-3 text-3xl font-bold tracking-tight md:text-4xl", light ? "text-white" : "text-navy")}>
        {title}
      </h2>
      {description && (
        <p className={cn("mt-3 text-base md:text-lg", light ? "text-slate-300" : "text-slate-600")}>{description}</p>
      )}
    </div>
  );
}

export function StatTile({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="stat-clay px-5 py-6 text-center">
      <p className="text-3xl font-bold text-navy md:text-4xl">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{label}</p>
    </div>
  );
}
