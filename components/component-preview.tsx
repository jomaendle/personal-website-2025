export function ComponentPreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-[300px] bg-neutral-950 border border-neutral-900 rounded-sm flex items-center py-8 md:py-0 justify-center">
      {children}
    </div>
  );
}
