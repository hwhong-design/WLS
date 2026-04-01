"use client";

interface ToastProps {
  message: string;
  visible: boolean;
}

export default function Toast({ message, visible }: ToastProps) {
  return (
    <div
      className="fixed z-[999] pointer-events-none transition-opacity duration-250"
      style={{
        bottom: 28,
        left: "50%",
        transform: "translateX(-50%)",
        background: "var(--gn)",
        color: "#fff",
        padding: "11px 22px",
        borderRadius: 22,
        fontSize: 13,
        fontWeight: 500,
        boxShadow: "var(--sh2)",
        letterSpacing: -0.1,
        opacity: visible ? 1 : 0,
      }}
    >
      {message}
    </div>
  );
}
