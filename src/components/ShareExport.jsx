import React, { useState } from "react";

// ── Helpers ──────────────────────────────────────────────────────────────────

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const urlToBlob = async (url) => {
  const res = await fetch(url);
  return res.blob();
};

// Draw both images side-by-side on a canvas and return a Blob
const buildComparisonBlob = async (beforeUrl, afterUrl, fileName) => {
  const [before, after] = await Promise.all([loadImage(beforeUrl), loadImage(afterUrl)]);

  const GAP   = 16;
  const LABEL = 48;
  const PAD   = 24;
  const W     = Math.max(before.width,  after.width);
  const H     = Math.max(before.height, after.height);

  const canvas = document.createElement("canvas");
  canvas.width  = W * 2 + GAP + PAD * 2;
  canvas.height = H + LABEL + PAD * 2 + 60; // extra for footer banner
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Top banner
  const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
  grad.addColorStop(0, "#3b82f6");
  grad.addColorStop(1, "#a855f7");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, 50);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 22px monospace";
  ctx.textAlign = "center";
  ctx.fillText(`✨ AI Enhanced — ${fileName}`, canvas.width / 2, 32);

  const imgY = 50 + PAD;

  // Before image
  ctx.drawImage(before, PAD, imgY, W, H);
  // After image
  ctx.drawImage(after, PAD + W + GAP, imgY, W, H);

  // Labels
  const labelY = imgY + H + 8;
  const labelH = LABEL - 8;

  ctx.fillStyle = "#ec4899";
  ctx.fillRect(PAD, labelY, W, labelH);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 18px monospace";
  ctx.textAlign = "center";
  ctx.fillText("ORIGINAL", PAD + W / 2, labelY + labelH / 2 + 6);

  ctx.fillStyle = "#22c55e";
  ctx.fillRect(PAD + W + GAP, labelY, W, labelH);
  ctx.fillStyle = "#fff";
  ctx.fillText("ENHANCED", PAD + W + GAP + W / 2, labelY + labelH / 2 + 6);

  // Footer
  const footerY = labelY + labelH + 8;
  ctx.fillStyle = "#1f2937";
  ctx.fillRect(0, footerY, canvas.width, canvas.height - footerY);
  ctx.fillStyle = "#9ca3af";
  ctx.font = "14px monospace";
  ctx.textAlign = "center";
  ctx.fillText("Made with Enhancer — AI Image Enhancer", canvas.width / 2, footerY + 22);

  return new Promise((res) => canvas.toBlob(res, "image/png"));
};

// ── Action Button ─────────────────────────────────────────────────────────────
const ActionBtn = ({ emoji, label, sublabel, color, onClick, status }) => {
  const colors = {
    cyan:   "bg-cyan-400 hover:bg-cyan-300 text-black",
    green:  "bg-green-500 hover:bg-green-400 text-white",
    blue:   "bg-blue-500 hover:bg-blue-400 text-white",
    purple: "bg-purple-500 hover:bg-purple-400 text-white",
    orange: "bg-orange-500 hover:bg-orange-400 text-white",
  };

  const statusColors = {
    success: "bg-green-500 text-white",
    error:   "bg-red-500 text-white",
    loading: "bg-gray-400 text-gray-700",
  };

  return (
    <button
      onClick={onClick}
      disabled={status === "loading"}
      className={`
        relative border-4 border-black p-4 flex flex-col items-center gap-2 w-full
        shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all
        hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]
        active:shadow-none active:translate-x-[4px] active:translate-y-[4px]
        ${status === "loading" ? "cursor-not-allowed opacity-70" : "cursor-pointer"}
        ${colors[color]}
      `}
    >
      <span className="text-3xl">{emoji}</span>
      <span className="font-black text-sm uppercase tracking-wide text-center">{label}</span>
      {sublabel && <span className="text-xs font-bold opacity-80 text-center">{sublabel}</span>}

      {/* Status toast overlay */}
      {status && status !== "loading" && (
        <div className={`absolute inset-0 flex items-center justify-center font-black text-sm ${statusColors[status]}`}>
          {status === "success" ? "✅ Done!" : "❌ Failed"}
        </div>
      )}
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200/80">
          <span className="animate-spin text-2xl">⚙️</span>
        </div>
      )}
    </button>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const ShareExport = ({ originalImage, enhancedImage, fileName = "image" }) => {
  const [statuses, setStatuses] = useState({});

  const setStatus = (key, val) => {
    setStatuses((p) => ({ ...p, [key]: val }));
    if (val === "success" || val === "error") {
      setTimeout(() => setStatuses((p) => ({ ...p, [key]: null })), 2000);
    }
  };

  // ── 1. Copy enhanced image to clipboard ────────────────────────────────
  const copyEnhancedToClipboard = async () => {
    setStatus("copy", "loading");
    try {
      const blob = await urlToBlob(enhancedImage);
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setStatus("copy", "success");
    } catch {
      setStatus("copy", "error");
    }
  };

  // ── 2. Download enhanced image ─────────────────────────────────────────
  const downloadEnhanced = () => {
    const link = document.createElement("a");
    link.href = enhancedImage;
    link.download = `${fileName.replace(/\.[^/.]+$/, "")}_enhanced.png`;
    link.click();
    setStatus("dl", "success");
  };

  // ── 3. Download side-by-side comparison ───────────────────────────────
  const downloadComparison = async () => {
    if (!originalImage) { setStatus("compare", "error"); return; }
    setStatus("compare", "loading");
    try {
      const blob = await buildComparisonBlob(originalImage, enhancedImage, fileName);
      const url  = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName.replace(/\.[^/.]+$/, "")}_comparison.png`;
      link.click();
      URL.revokeObjectURL(url);
      setStatus("compare", "success");
    } catch (e) {
      console.error(e);
      setStatus("compare", "error");
    }
  };

  // ── 4. Web Share API (mobile / desktop with support) ──────────────────
  const shareImage = async () => {
    setStatus("share", "loading");
    try {
      const blob = await urlToBlob(enhancedImage);
      const file = new File([blob], `${fileName}_enhanced.png`, { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "AI Enhanced Image",
          text: "Check out this image I enhanced using AI!",
          files: [file],
        });
        setStatus("share", "success");
      } else {
        // Fallback: share URL
        await navigator.share({
          title: "AI Image Enhancer",
          text: "Enhance your images with AI!",
          url: window.location.href,
        });
        setStatus("share", "success");
      }
    } catch (e) {
      if (e.name !== "AbortError") setStatus("share", "error");
      else setStatuses((p) => ({ ...p, share: null }));
    }
  };

  // ── 5. Copy page URL ───────────────────────────────────────────────────
  const copyPageUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatus("url", "success");
    } catch {
      setStatus("url", "error");
    }
  };

  if (!enhancedImage) return null;

  const canWebShare = typeof navigator.share === "function";

  return (
    <div className="mt-8 w-full">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">

        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-cyan-500 border-b-4 border-black px-4 py-3 flex items-center gap-2">
          <div className="w-3 h-3 bg-white border-2 border-black" />
          <div className="w-3 h-3 bg-white border-2 border-black" />
          <div className="w-3 h-3 bg-white border-2 border-black" />
          <h2 className="text-lg font-black text-white uppercase ml-2">
            📤 Share & Export
          </h2>
        </div>

        <div className="p-6 space-y-6">

          {/* Primary actions */}
          <div>
            <div className="bg-sky-600 border-2 border-black px-4 py-2 mb-4">
              <h3 className="text-white font-black text-sm uppercase">⬇️ Export</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ActionBtn
                emoji="⬇️"
                label="Download Enhanced"
                sublabel="Save the AI-enhanced image as PNG"
                color="green"
                onClick={downloadEnhanced}
                status={statuses.dl}
              />
              <ActionBtn
                emoji="🔀"
                label="Download Comparison"
                sublabel="Side-by-side original vs enhanced PNG"
                color="blue"
                onClick={downloadComparison}
                status={statuses.compare}
              />
              <ActionBtn
                emoji="📋"
                label="Copy to Clipboard"
                sublabel="Copy enhanced image directly"
                color="cyan"
                onClick={copyEnhancedToClipboard}
                status={statuses.copy}
              />
            </div>
          </div>

          {/* Share actions */}
          <div>
            <div className="bg-purple-600 border-2 border-black px-4 py-2 mb-4">
              <h3 className="text-white font-black text-sm uppercase">🔗 Share</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {canWebShare && (
                <ActionBtn
                  emoji="📱"
                  label="Share via Device"
                  sublabel="Share with any app on your device"
                  color="purple"
                  onClick={shareImage}
                  status={statuses.share}
                />
              )}
              <ActionBtn
                emoji="🌐"
                label="Copy App Link"
                sublabel="Share a link to this enhancer"
                color="orange"
                onClick={copyPageUrl}
                status={statuses.url}
              />
            </div>
          </div>

          {/* Comparison preview note */}
          {originalImage && (
            <div className="bg-yellow-300 border-4 border-black p-4 flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">💡</span>
              <p className="text-sm font-bold text-gray-800">
                <strong>Comparison Download</strong> generates a single PNG with both images side-by-side — perfect for sharing before/after results on social media!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareExport;
