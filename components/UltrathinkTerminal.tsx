"use client";

export default function UltrathinkTerminal() {
  const characters = [
    { char: "u", color: "#fca5a5" }, // red-300
    { char: "l", color: "#fcb04d" }, // amber-300
    { char: "t", color: "#fdef93" }, // green-300
    { char: "r", color: "#a1fd93" }, // blue-300
    { char: "a", color: "#c4b5fd" }, // violet-300
    { char: "t", color: "#f0abfc" }, // fuchsia-300
    { char: "h", color: "#d9a4fc" }, // rose-300
    { char: "i", color: "#fca5a5" }, // yellow-300
    { char: "n", color: "#fcb04d" }, // orange-400
    { char: "k", color: "#fdef93" }, // yellow-400
  ];

  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-1 py-0.5 font-mono text-sm shadow-lg">
      <span className="flex items-center tracking-wide">
        {characters.map((item, index) => (
          <span key={index} style={{ color: item.color }}>
            {item.char}
          </span>
        ))}
      </span>
    </div>
  );
}
