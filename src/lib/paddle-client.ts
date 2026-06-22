"use client";

/**
 * Paddle.js (Billing v2) betöltése + inicializálása a kliensen — egyszer.
 * A checkout overlay-t a kinti.app-on nyitja meg (nem visz el átirányítással).
 */

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Paddle?: any;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let paddlePromise: Promise<any> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loadPaddle(): Promise<any> {
  if (paddlePromise) return paddlePromise;
  paddlePromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("no window"));
      return;
    }
    if (window.Paddle) {
      resolve(window.Paddle);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    s.async = true;
    s.onload = () => {
      try {
        if (process.env.NEXT_PUBLIC_PADDLE_ENV === "sandbox") {
          window.Paddle.Environment.set("sandbox");
        }
        window.Paddle.Initialize({ token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN });
        resolve(window.Paddle);
      } catch (e) {
        reject(e);
      }
    };
    s.onerror = () => reject(new Error("Paddle.js load failed"));
    document.head.appendChild(s);
  });
  return paddlePromise;
}
