interface PullQuoteProps {
  quote: string;
  accentColor: string;
}

const colorMap: Record<string, string> = {
  amber: 'border-amber-400',
  blue: 'border-blue-400',
  red: 'border-red-400',
  purple: 'border-purple-400',
  yellow: 'border-yellow-400',
  green: 'border-green-400',
};

export function PullQuote({ quote, accentColor }: PullQuoteProps) {
  const borderClass = colorMap[accentColor] ?? 'border-zinc-400';

  return (
    <blockquote className={`my-6 border-l-2 ${borderClass} pl-4 text-lg italic text-zinc-200`}>
      {quote}
    </blockquote>
  );
}
