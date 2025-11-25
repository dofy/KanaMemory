import { useEffect, useState } from "react";

interface Petal {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

export function SakuraPattern({ count = 10 }: { count?: number }) {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    const newPetals: Petal[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 15 + Math.random() * 10,
      size: 8 + Math.random() * 8,
    }));
    setPetals(newPetals);
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute"
          style={{
            left: `${petal.left}%`,
            animation: `sakura-fall ${petal.duration}s linear ${petal.delay}s infinite`,
          }}
        >
          <svg
            width={petal.size}
            height={petal.size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="opacity-60"
          >
            <path
              d="M12 2C12 2 10 4 10 6C10 8 12 10 12 10C12 10 14 8 14 6C14 4 12 2 12 2Z"
              fill="hsl(var(--wafuu-pink))"
            />
            <path
              d="M12 14C12 14 10 16 10 18C10 20 12 22 12 22C12 22 14 20 14 18C14 16 12 14 12 14Z"
              fill="hsl(var(--wafuu-pink))"
            />
            <path
              d="M2 12C2 12 4 10 6 10C8 10 10 12 10 12C10 12 8 14 6 14C4 14 2 12 2 12Z"
              fill="hsl(var(--wafuu-pink-dark))"
            />
            <path
              d="M14 12C14 12 16 10 18 10C20 10 22 12 22 12C22 12 20 14 18 14C16 14 14 12 14 12Z"
              fill="hsl(var(--wafuu-pink-dark))"
            />
            <circle cx="12" cy="12" r="2" fill="hsl(var(--wafuu-orange))" />
          </svg>
        </div>
      ))}
    </div>
  );
}

