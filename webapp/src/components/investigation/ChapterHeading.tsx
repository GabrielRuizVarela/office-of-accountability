interface ChapterHeadingProps {
  number?: string;
  title: string;
  accentColor: string;
}

const colorMap: Record<string, string> = {
  amber: 'border-amber-500',
  blue: 'border-blue-500',
  red: 'border-red-500',
  purple: 'border-purple-500',
  yellow: 'border-yellow-500',
  green: 'border-green-500',
};

export function ChapterHeading({ number, title, accentColor }: ChapterHeadingProps) {
  const borderClass = colorMap[accentColor] ?? 'border-zinc-500';

  return (
    <h2 className={`border-l-4 ${borderClass} pl-4 text-xl font-bold text-zinc-50`}>
      {number ? `${number}. ${title}` : title}
    </h2>
  );
}
