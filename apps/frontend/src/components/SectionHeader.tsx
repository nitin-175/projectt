type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeader({ eyebrow, title, description }: SectionHeaderProps) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-brand-600 mb-2">{eyebrow}</p>
      <h1 className="font-display text-4xl lg:text-6xl font-extrabold tracking-tight text-premium leading-[1.1]">
        {title}
      </h1>
      <p className="mt-6 text-lg lg:text-xl leading-relaxed text-slate-500 font-medium">
        {description}
      </p>
    </div>
  );
}

