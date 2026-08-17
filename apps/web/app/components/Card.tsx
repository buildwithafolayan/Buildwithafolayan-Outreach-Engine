import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  glass?: boolean;
  interactive?: boolean;
}

export default function Card({ children, className = "", glass, interactive }: CardProps) {
  const base = glass ? "card-glass" : "card";
  const interactiveClass = interactive ? " card-interactive" : "";
  return (
    <div className={`${base}${interactiveClass} ${className}`}>
      {children}
    </div>
  );
}
