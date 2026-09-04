import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`bg-surface rounded-xl shadow-sm border border-border p-5 ${className}`}>{children}</div>;
}

export function KpiCard({ label, value, tone }: { label: string; value: ReactNode; tone?: "good" | "warn" }) {
  const color = tone === "good" ? "text-good" : tone === "warn" ? "text-warn" : "text-primary";
  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border p-4 text-center">
      <div className="text-xs text-text-muted mb-1.5">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

export function LevelBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold text-white whitespace-nowrap"
      style={{ background: color }}
    >
      {label}
    </span>
  );
}

export function StatusPill({ label, className }: { label: string; className: string }) {
  return <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${className}`}>{label}</span>;
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
      className={`rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-bg transition-colors ${className}`}
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
  "rounded-lg border border-border px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary";
