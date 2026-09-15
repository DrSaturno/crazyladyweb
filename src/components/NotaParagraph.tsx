export default function NotaParagraph({ text, compact = false }: { text: string; compact?: boolean }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p className={compact ? "text-sm leading-relaxed text-cls-ink/96" : "text-[15px] leading-[1.85] text-cls-ink/96 md:text-base"}>
      {parts.map((part, index) => part.startsWith("**") && part.endsWith("**") ? <strong key={index} className="font-bold text-cls-primary-dark">{part.slice(2, -2)}</strong> : <span key={index}>{part}</span>)}
    </p>
  );
}
