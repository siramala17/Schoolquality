"use client";

import { useEffect, useRef, useState } from "react";
import { Charm } from "next/font/google";
import { SecondaryButton, inputClass } from "@/components/ui";

// Thai handwriting-style font used to render typed signatures onto the canvas.
const charm = Charm({ subsets: ["thai", "latin"], weight: "700" });

export default function SignaturePad({
  value,
  onChange,
  height = 160,
}: {
  value?: string | null;
  onChange: (dataUrl: string | null) => void;
  height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(!!value);
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = height * ratio;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1e2a28";
    if (value) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.offsetWidth, height);
      img.src = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pos(e: React.PointerEvent) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function start(e: React.PointerEvent) {
    drawing.current = true;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }
  function move(e: React.PointerEvent) {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasInk(true);
  }
  function end() {
    if (!drawing.current) return;
    drawing.current = false;
    onChange(canvasRef.current!.toDataURL("image/png"));
  }

  function wipe() {
    const canvas = canvasRef.current!;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
  }

  function clear() {
    wipe();
    setTyped("");
    setHasInk(false);
    onChange(null);
  }

  function switchMode(next: "draw" | "type") {
    if (next === mode) return;
    clear();
    setMode(next);
  }

  // Render the typed name as a signature image, shrinking the font until it fits.
  async function renderTyped(text: string) {
    setTyped(text);
    const name = text.trim();
    if (!name) {
      wipe();
      setHasInk(false);
      onChange(null);
      return;
    }
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const family = charm.style.fontFamily;
    await document.fonts.load(`700 48px ${family}`, name);
    const width = canvas.offsetWidth;
    let size = Math.min(56, height * 0.5);
    ctx.font = `700 ${size}px ${family}`;
    while (size > 16 && ctx.measureText(name).width > width - 32) {
      size -= 2;
      ctx.font = `700 ${size}px ${family}`;
    }
    wipe();
    ctx.fillStyle = "#1e2a28";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(name, width / 2, height / 2);
    setHasInk(true);
    onChange(canvas.toDataURL("image/png"));
  }

  return (
    <div>
      <div className="flex gap-1 mb-2">
        {(
          [
            ["draw", "✍️ เซ็นชื่อ"],
            ["type", "⌨️ พิมพ์ชื่อ"],
          ] as const
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            className={`rounded-lg px-3 py-1 text-xs font-medium border transition-colors ${
              mode === m ? "bg-primary text-white border-primary" : "border-border text-text-muted hover:bg-bg"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {mode === "type" && (
        <input
          className={`${inputClass} mb-2`}
          placeholder="พิมพ์ชื่อ-นามสกุล เช่น นางสาวศิรดา พรหมดวงดี"
          value={typed}
          onChange={(e) => renderTyped(e.target.value)}
        />
      )}
      <canvas
        ref={canvasRef}
        style={{ height, touchAction: "none" }}
        className={`w-full rounded-lg border border-border bg-white ${mode === "draw" ? "cursor-crosshair" : "pointer-events-none"}`}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
      />
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-xs text-text-muted">{hasInk ? "ลงลายมือชื่อแล้ว" : mode === "draw" ? "เซ็นชื่อในกรอบด้านบน" : "พิมพ์ชื่อในช่องด้านบน"}</span>
        <SecondaryButton type="button" onClick={clear} className="text-xs px-2 py-1">
          ล้าง
        </SecondaryButton>
      </div>
    </div>
  );
}
