"use client";

import { useState } from "react";

// Saves the element as a Word document (.doc). Word can't render inline SVG from
// HTML, so each chart is rasterised to PNG and packed with the HTML as a
// single-file web page (MHTML), which Word opens with the images embedded.
const BASE = "file:///C:/supervision-report/";
const BOUNDARY = "----=_NextPart_SupervisionReport";

function toBase64(bytes: Uint8Array) {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin).replace(/.{76}/g, "$&\r\n");
}

async function svgToPng(svg: SVGSVGElement): Promise<{ png: Uint8Array; width: number; height: number }> {
  const vb = svg.viewBox.baseVal;
  const width = vb.width || svg.clientWidth;
  const height = vb.height || svg.clientHeight;
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  clone.removeAttribute("style");

  const url = URL.createObjectURL(
    new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml;charset=utf-8" }),
  );
  try {
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });
    const scale = 2; // sharper when printed
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, width, height);
    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
    return { png: new Uint8Array(await blob.arrayBuffer()), width, height };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function WordDownloadButton({ targetId, fileName }: { targetId: string; fileName: string }) {
  const [busy, setBusy] = useState(false);

  async function download() {
    const el = document.getElementById(targetId);
    if (!el) return;
    setBusy(true);
    try {
      const clone = el.cloneNode(true) as HTMLElement;
      const liveSvgs = Array.from(el.querySelectorAll("svg"));
      const cloneSvgs = Array.from(clone.querySelectorAll("svg"));
      const images: { name: string; png: Uint8Array }[] = [];

      for (let i = 0; i < liveSvgs.length; i++) {
        const { png, width, height } = await svgToPng(liveSvgs[i]);
        const name = `chart${i + 1}.png`;
        images.push({ name, png });
        // Fit A4 portrait text width (~16cm ≈ 600px at 96dpi).
        const w = Math.min(width, 600);
        const img = document.createElement("img");
        img.src = BASE + name;
        img.width = w;
        img.height = Math.round((height * w) / width);
        cloneSvgs[i].replaceWith(img);
      }

      const html =
        `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">` +
        `<head><meta charset="utf-8"><title>${fileName}</title>` +
        `<style>@page{size:A4;margin:2cm 1.5cm}body{font-family:'TH Sarabun New',sans-serif;font-size:16pt}</style></head>` +
        `<body>${clone.outerHTML}</body></html>`;

      const parts = [
        `--${BOUNDARY}\r\nContent-Location: ${BASE}report.htm\r\nContent-Transfer-Encoding: base64\r\nContent-Type: text/html; charset="utf-8"\r\n\r\n${toBase64(new TextEncoder().encode(html))}\r\n`,
        ...images.map(
          (im) =>
            `--${BOUNDARY}\r\nContent-Location: ${BASE}${im.name}\r\nContent-Transfer-Encoding: base64\r\nContent-Type: image/png\r\n\r\n${toBase64(im.png)}\r\n`,
        ),
      ];
      const mhtml =
        `MIME-Version: 1.0\r\nContent-Type: multipart/related; boundary="${BOUNDARY}"; type="text/html"\r\n\r\n` +
        parts.join("") +
        `--${BOUNDARY}--\r\n`;

      const url = URL.createObjectURL(new Blob([mhtml], { type: "application/msword" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}.doc`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={download}
      disabled={busy}
      className="rounded-lg border border-primary text-primary px-4 py-2 text-sm font-semibold hover:bg-primary/5 transition-colors disabled:opacity-60"
    >
      {busy ? "กำลังสร้างไฟล์..." : "⬇ ดาวน์โหลด Word"}
    </button>
  );
}
