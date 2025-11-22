"use client";

export default function UltrathinkTerminal() {
  const characters = [
    { char: "u", className: "text-red-500 dark:text-[#fca5a5]" },
    { char: "l", className: "text-orange-500 dark:text-[#fcb04d]" },
    { char: "t", className: "text-yellow-500 dark:text-[#fdef93]" },
    { char: "r", className: "text-green-500 dark:text-[#a1fd93]" },
    { char: "a", className: "text-violet-500 dark:text-[#c4b5fd]" },
    { char: "t", className: "text-fuchsia-500 dark:text-[#f0abfc]" },
    { char: "h", className: "text-purple-500 dark:text-[#d9a4fc]" },
    { char: "i", className: "text-red-500 dark:text-[#fca5a5]" },
    { char: "n", className: "text-orange-500 dark:text-[#fcb04d]" },
    { char: "k", className: "text-yellow-500 dark:text-[#fdef93]" },
  ];


  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-1 py-0.5 font-mono text-sm shadow-sm">
      <span className="flex items-center tracking-wide">
        {characters.map((item, index) => (
          <span key={index} className={item.className}>
            {item.char}
          </span>
        ))}
      </span>
    </div>
  );
}
