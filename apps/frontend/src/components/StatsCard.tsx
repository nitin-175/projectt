type StatsCardProps = {
  label: string;
  value: string;
  helper: string;
};

export function StatsCard({ label, value, helper }: StatsCardProps) {
  return (
    <div className="group rounded-[32px] bg-white p-8 transition-all duration-300 hover:shadow-premium">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-brand-600 transition-colors">
        {label}
      </p>
      <div className="mt-4 flex items-baseline gap-1">
        <p className="font-display text-5xl font-black tracking-tighter text-premium">
          {value}
        </p>
      </div>
      <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500">
        {helper}
      </p>
    </div>
  );
}

