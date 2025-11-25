export function WavePattern({ position = "bottom" }: { position?: "top" | "bottom" }) {
  const positionClass = position === "top" ? "top-0" : "bottom-0";
  const rotateClass = position === "top" ? "rotate-180" : "";

  return (
    <div className={`absolute left-0 right-0 ${positionClass} pointer-events-none z-0 ${rotateClass}`}>
      <svg
        className="w-full h-24 opacity-20"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,60 C150,90 350,0 600,60 C850,120 1050,30 1200,60 L1200,120 L0,120 Z"
          fill="hsl(var(--wafuu-pink))"
        />
        <path
          d="M0,70 C200,100 400,40 600,70 C800,100 1000,40 1200,70 L1200,120 L0,120 Z"
          fill="hsl(var(--wafuu-green))"
          opacity="0.5"
        />
      </svg>
    </div>
  );
}

