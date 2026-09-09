import { useEffect, useState } from "react";

interface ToastProps {
  message: string | null;
  duration?: number;
  variant?: "error" | "info" | "success";
}

const variantClasses = {
  error: "border-red-200 bg-red-50 text-red-700",
  info: "border-blue-200 bg-blue-50 text-blue-700",
  success: "border-green-200 bg-green-50 text-green-700",
};

export function Toast({ message, duration = 4000, variant = "info" }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!message) return;

    const timeoutId = window.setTimeout(() => setIsVisible(false), duration);
    return () => window.clearTimeout(timeoutId);
  }, [duration, message]);

  if (!message || !isVisible) return null;

  return (
    <div
      className={[
        "fixed inset-x-4 top-20 z-50 mx-auto w-fit max-w-[calc(100%-2rem)] rounded-xl border px-4 py-3 text-center text-sm font-bold shadow-[0_0_16px_rgba(0,0,0,0.2)]",
        variantClasses[variant],
      ].join(" ")}
      role={variant === "error" ? "alert" : "status"}
    >
      {message}
    </div>
  );
}
