import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`bg-surface rounded-xl shadow-sm border border-border p-5 ${className}`}>{children}</div>;
}

export function SectionTitle({ icon, children, count }: { icon?: ReactNode; children: ReactNode; count?: number }) {
  return (
    <h2 className="flex items-center gap-2 text-lg font-bold mb-4">
      {icon && <span className="text-primary">{icon}</span>}
      <span>{children}</span>
      {count != null && (
        <span className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
          {count}
        </span>
      )}
    </h2>
  );
}

export function KpiCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: ReactNode;
  tone?: "good" | "warn" | "bad" | "primary";
  icon?: ReactNode;
}) {
  const color =
    tone === "good"
      ? "text-good"
      : tone === "warn"
        ? "text-warn"
        : tone === "bad"
          ? "text-bad"
          : "text-primary";
  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border p-4 flex items-center gap-3">
      {icon && (
        <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <div className={`text-2xl font-bold leading-tight ${color}`}>{value}</div>
        <div className="text-xs text-text-muted truncate">{label}</div>
      </div>
    </div>
  );
}

export function LevelBadge({ label, color }: { label?: string | null; color?: string | null }) {
  if (!label) return <span className="text-text-muted">-</span>;
  return (
    <span
      className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold text-white whitespace-nowrap"
      style={{ background: color || "#6b7280" }}
    >
      {label}
    </span>
  );
}

export function StatusPill({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${className}`}>
      {label}
    </span>
  );
}

export function ScoreChip({ score, color }: { score: number | null | undefined; color?: string }) {
  if (score == null) return <span className="text-text-muted">-</span>;
  return (
    <span
      className="inline-flex items-center justify-center min-w-7 h-7 px-1.5 rounded-lg text-xs font-bold text-white"
      style={{ background: color || "#0d9488" }}
    >
      {Number.isInteger(score) ? score : score.toFixed(2)}
    </span>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="text-center text-text-muted text-sm py-10">{children}</div>;
}

export function PrimaryButton({ className = "", ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`rounded-lg bg-primary text-white px-4 py-2 text-sm font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    />
  );
}

export function SecondaryButton({ className = "", ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-bg transition-colors disabled:opacity-50 ${className}`}
    />
  );
}

export function GradientButton({ className = "", ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`rounded-lg brand-gradient text-white px-4 py-2 text-sm font-semibold hover:opacity-95 disabled:opacity-50 transition-opacity ${className}`}
    />
  );
}

export function Label({ text, children }: { text: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 mb-3">
      <span className="text-xs font-medium text-text-muted">{text}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "rounded-lg border border-border px-3 py-2 text-sm bg-surface w-full focus:outline-none focus:border-primary";
