import { useEffect, useState } from "react";

// ── Shortcut definitions (for display + handler lookup) ──────────────────────
export const SHORTCUTS = [
  { key: "U",      ctrl: false, desc: "Open file picker to upload image",    action: "upload"   },
  { key: "R",      ctrl: false, desc: "Reset — clear current image",          action: "reset"    },
  { key: "D",      ctrl: false, desc: "Download enhanced image",              action: "download" },
  { key: "C",      ctrl: false, desc: "Copy enhanced image to clipboard",     action: "copy"     },
  { key: "G",      ctrl: false, desc: "Scroll to gallery",                    action: "gallery"  },
  { key: "M",      ctrl: false, desc: "Scroll to metadata panel",             action: "metadata" },
  { key: "Z",      ctrl: false, desc: "Scroll to zoom & inspect panel",       action: "zoom"     },
  { key: "/",      ctrl: false, desc: "Toggle this shortcuts panel",          action: "help"     },
  { key: "?",      ctrl: false, desc: "Toggle this shortcuts panel",          action: "help"     },
  { key: "Escape", ctrl: false, desc: "Close shortcuts panel",                action: "closeHelp"},
];

// ── Key badge ─────────────────────────────────────────────────────────────────
const KeyBadge = ({ k }) => (
  <kbd className="bg-gray-800 text-yellow-300 border-2 border-yellow-400 px-2 py-0.5 font-black font-mono text-xs min-w-7 inline-flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(250,204,21,0.6)]">
    {k}
  </kbd>
);

// ── Main Component ────────────────────────────────────────────────────────────
const KeyboardShortcuts = ({
  onUpload,
  onReset,
  onDownload,
  onCopy,
  hasEnhanced,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastFired, setLastFired] = useState(null);   // brief visual feedback

  const flash = (action) => {
    setLastFired(action);
    setTimeout(() => setLastFired(null), 800);
  };

  // ── Scroll helpers ──────────────────────────────────────────────────────
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Download helper (same logic as ImagePreview) ────────────────────────
  const doDownload = () => {
    if (!hasEnhanced) return;
    const link = document.createElement("a");
    link.href = hasEnhanced;
    link.download = `enhanced-image-${Date.now()}.png`;
    link.click();
    flash("download");
  };

  // ── Copy helper (Clipboard API) ─────────────────────────────────────────
  const doCopy = async () => {
    if (!hasEnhanced) return;
    try {
      const res  = await fetch(hasEnhanced);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      flash("copy");
    } catch {
      flash("copy-fail");
    }
  };

  // ── Global keydown listener ─────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      // Don't fire while typing in an input / textarea
      if (["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName)) return;

      const key = e.key.toUpperCase();

      switch (key) {
        case "U":
          e.preventDefault();
          onUpload?.();
          flash("upload");
          break;
        case "R":
          if (onReset) { e.preventDefault(); onReset(); flash("reset"); }
          break;
        case "D":
          e.preventDefault();
          doDownload();
          break;
        case "C":
          e.preventDefault();
          doCopy();
          break;
        case "G":
          e.preventDefault();
          scrollTo("gallery-section");
          flash("gallery");
          break;
        case "M":
          e.preventDefault();
          scrollTo("metadata-section");
          flash("metadata");
          break;
        case "Z":
          e.preventDefault();
          scrollTo("zoom-section");
          flash("zoom");
          break;
        case "/":
        case "?":
          e.preventDefault();
          setIsOpen((o) => !o);
          break;
        case "ESCAPE":
          setIsOpen(false);
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onUpload, onReset, hasEnhanced]);

  return (
    <>
      {/* ── Floating ? button ─────────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        title="Keyboard shortcuts ( ? )"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-black border-4 border-yellow-400
          font-black text-yellow-300 text-2xl flex items-center justify-center
          shadow-[4px_4px_0px_0px_rgba(250,204,21,0.8)]
          hover:bg-gray-900 hover:shadow-[2px_2px_0px_0px_rgba(250,204,21,0.8)]
          hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
      >
        {isOpen ? "✕" : "?"}
      </button>

      {/* ── Last-fired toast ─────────────────────────────────────────────── */}
      {lastFired && (
        <div className="fixed bottom-24 right-6 z-50 bg-black border-2 border-yellow-400 px-4 py-2 font-black text-yellow-300 text-sm shadow-[4px_4px_0px_0px_rgba(250,204,21,0.6)] animate-pulse pointer-events-none">
          ⌨️ {lastFired === "copy-fail" ? "Copy failed" : `${lastFired} ↵`}
        </div>
      )}

      {/* ── Shortcuts panel ──────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
        >
          <div className="bg-gray-900 border-4 border-yellow-400 shadow-[8px_8px_0px_0px_rgba(250,204,21,0.7)] w-full max-w-lg">

            {/* Header */}
            <div className="bg-yellow-400 border-b-4 border-yellow-600 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-black border-2 border-gray-700" />
                <div className="w-3 h-3 bg-black border-2 border-gray-700" />
                <div className="w-3 h-3 bg-black border-2 border-gray-700" />
                <h2 className="font-black text-black uppercase text-lg ml-2">
                  ⌨️ Keyboard Shortcuts
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="bg-black border-2 border-gray-700 w-8 h-8 font-black text-yellow-400 text-sm flex items-center justify-center hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            {/* Shortcuts list */}
            <div className="p-6 space-y-2">
              {SHORTCUTS.filter(s => s.action !== "closeHelp").map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                  <span className="text-gray-300 text-sm font-bold">{s.desc}</span>
                  <div className="flex items-center gap-1 ml-4 flex-shrink-0">
                    {s.ctrl && <><KeyBadge k="Ctrl" /> <span className="text-gray-500 text-xs">+</span></>}
                    <KeyBadge k={s.key} />
                  </div>
                </div>
              ))}
            </div>

            {/* Footer tip */}
            <div className="border-t-4 border-yellow-600 bg-gray-800 px-6 py-3">
              <p className="text-xs font-bold text-gray-400 text-center">
                Press <KeyBadge k="?" /> or <KeyBadge k="/" /> anywhere to toggle this panel • <KeyBadge k="Esc" /> to close
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KeyboardShortcuts;
