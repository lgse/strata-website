export function Logo({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 284 284" fill="none" aria-hidden="true">
      <path d="M38 82 142 22 174 40 70 100v24l104 62-32 18L38 142Z" fill="currentColor" />
      <path d="M142 88l104 60v60l-104 60-32-18 104-60v-24l-104-60Z" fill="currentColor" />
      <path d="M174 74l32-18 40 23v36l-72-41Z" fill="var(--accent)" />
      <path d="M38 176l72 42-32 18-40-23Z" fill="var(--violet)" />
    </svg>
  );
}
