import React, { useState, useEffect } from "react";

// ── Storage key & helpers ─────────────────────────────────────────────────────
const STATS_KEY = "enhancer_usage_stats";

const defaultStats = () => ({
  totalEnhanced: 0,
  totalBytesIn: 0,
  sessionCount: 0,
  lastUsed: null,
  streak: 0,
  lastStreakDate: null,
  formatsUsed: {},        // { "image/jpeg": 3, "image/png": 1 }
  dailyHistory: {},       // { "2026-02-20": 3 }
});

export const loadStats = () => {
  try {
    const s = localStorage.getItem(STATS_KEY);
    return s ? { ...defaultStats(), ...JSON.parse(s) } : defaultStats();
  } catch { return defaultStats(); }
};

export const recordEnhancement = (file) => {
  const stats = loadStats();
  const today = new Date().toISOString().slice(0, 10);

  stats.totalEnhanced += 1;
  stats.totalBytesIn  += file?.size || 0;
  stats.lastUsed       = new Date().toISOString();

  // Format tracking
  const fmt = file?.type || "unknown";
  stats.formatsUsed[fmt] = (stats.formatsUsed[fmt] || 0) + 1;

  // Daily history (keep last 14 days)
  stats.dailyHistory[today] = (stats.dailyHistory[today] || 0) + 1;
  const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10);
  Object.keys(stats.dailyHistory).forEach((d) => {
    if (d < twoWeeksAgo) delete stats.dailyHistory[d];
  });

  // Streak calculation
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (stats.lastStreakDate === yesterday || stats.lastStreakDate === today) {
    if (stats.lastStreakDate !== today) stats.streak += 1;
  } else {
    stats.streak = 1;
  }
  stats.lastStreakDate = today;

  try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch {}
};

// ── Formatting helpers ────────────────────────────────────────────────────────
const fmtBytes = (b) => {
  if (!b) return "0 B";
  if (b < 1024) return b + " B";
  if (b < 1024 ** 2) return (b / 1024).toFixed(1) + " KB";
  return (b / 1024 ** 2).toFixed(2) + " MB";
};

const fmtType = (mime) => {
  const map = {
    "image/jpeg": "JPEG", "image/jpg": "JPEG",
    "image/png": "PNG", "image/webp": "WebP",
    "image/avif": "AVIF", "image/gif": "GIF",
    "image/bmp": "BMP", "unknown": "Unknown",
  };
  return map[mime] || mime.split("/")[1]?.toUpperCase() || mime;
};

const relativeDate = (iso) => {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString();
};

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ emoji, label, value, subvalue, accent }) => (
  <div className={`border-4 border-black p-4 ${accent} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
    <div className="text-3xl mb-2">{emoji}</div>
    <div className="font-black text-2xl text-white leading-tight">{value}</div>
    <div className="font-black text-xs text-white/80 uppercase mt-1">{label}</div>
    {subvalue && <div className="text-xs font-bold text-white/60 mt-1">{subvalue}</div>}
  </div>
);

// ── Mini bar chart (last 7 days) ──────────────────────────────────────────────
const ActivityChart = ({ daily }) => {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    const key = d.toISOString().slice(0, 10);
    return { key, count: daily[key] || 0, label: d.toLocaleDateString("en", { weekday: "short" }) };
  });
  const max = Math.max(...days.map(d => d.count), 1);

  return (
    <div className="flex items-end gap-2 h-20">
      {days.map((d) => (
        <div key={d.key} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-violet-500 border-2 border-black transition-all"
            style={{ height: `${Math.max((d.count / max) * 64, d.count > 0 ? 8 : 4)}px` }}
          />
          <span className="text-xs font-black text-gray-500">{d.label.slice(0, 2)}</span>
          {d.count > 0 && (
            <span className="text-xs font-black text-violet-600">{d.count}</span>
          )}
        </div>
      ))}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const UsageStats = ({ triggerRefresh }) => {
  const [stats, setStats]     = useState(defaultStats());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setStats(loadStats());
  }, [triggerRefresh]);

  const handleClear = () => {
    if (!window.confirm("Reset all usage statistics? This cannot be undone.")) return;
    localStorage.removeItem(STATS_KEY);
    setStats(defaultStats());
  };

  // Top format
  const topFmt = Object.entries(stats.formatsUsed || {})
    .sort((a, b) => b[1] - a[1])[0];

  if (stats.totalEnhanced === 0) return null;

  return (
    <div className="mt-8 w-full">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">

        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 border-b-4 border-black px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white border-2 border-black" />
            <div className="w-3 h-3 bg-white border-2 border-black" />
            <div className="w-3 h-3 bg-white border-2 border-black" />
            <h2 className="text-lg font-black text-white uppercase ml-2">
              📊 Your Stats
            </h2>
            <span className="bg-white border-2 border-black px-2 py-0.5 text-xs font-black text-violet-700">
              Lifetime
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClear}
              className="bg-red-500 hover:bg-red-600 border-2 border-black px-3 py-1 font-black text-white text-xs uppercase"
            >
              🗑️ Reset
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="bg-white hover:bg-gray-100 border-2 border-black px-3 py-1 font-black text-violet-700 text-lg"
            >
              {isExpanded ? "▼" : "▶"}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="p-6 space-y-6">

            {/* Stat cards grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                emoji="✨"
                label="Images Enhanced"
                value={stats.totalEnhanced.toLocaleString()}
                subvalue={`Last: ${relativeDate(stats.lastUsed)}`}
                accent="bg-violet-600"
              />
              <StatCard
                emoji="📦"
                label="Data Processed"
                value={fmtBytes(stats.totalBytesIn)}
                subvalue={`~${fmtBytes(Math.round(stats.totalBytesIn / Math.max(stats.totalEnhanced, 1)))} avg`}
                accent="bg-blue-600"
              />
              <StatCard
                emoji="🔥"
                label="Day Streak"
                value={`${stats.streak}d`}
                subvalue={stats.streak >= 3 ? "Keep it up!" : "Enhance daily!"}
                accent={stats.streak >= 3 ? "bg-orange-500" : "bg-gray-600"}
              />
              <StatCard
                emoji="🎨"
                label="Top Format"
                value={topFmt ? fmtType(topFmt[0]) : "—"}
                subvalue={topFmt ? `${topFmt[1]} image${topFmt[1] !== 1 ? "s" : ""}` : "No data yet"}
                accent="bg-pink-600"
              />
            </div>

            {/* Activity chart */}
            <div>
              <div className="bg-violet-600 border-2 border-black px-4 py-2 mb-3">
                <h3 className="text-white font-black text-sm uppercase">📅 Activity — Last 7 Days</h3>
              </div>
              <div className="bg-violet-50 border-4 border-black p-4">
                <ActivityChart daily={stats.dailyHistory || {}} />
              </div>
            </div>

            {/* Format breakdown */}
            {Object.keys(stats.formatsUsed || {}).length > 0 && (
              <div>
                <div className="bg-indigo-600 border-2 border-black px-4 py-2 mb-3">
                  <h3 className="text-white font-black text-sm uppercase">🖼️ Formats Used</h3>
                </div>
                <div className="bg-indigo-50 border-4 border-black p-4 space-y-3">
                  {Object.entries(stats.formatsUsed)
                    .sort((a, b) => b[1] - a[1])
                    .map(([mime, count]) => {
                      const pct = Math.round((count / stats.totalEnhanced) * 100);
                      return (
                        <div key={mime} className="flex items-center gap-3">
                          <span className="font-black text-sm text-gray-800 w-16 flex-shrink-0">
                            {fmtType(mime)}
                          </span>
                          <div className="flex-1 bg-white border-2 border-black h-5 overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="font-black text-sm text-gray-700 w-16 text-right flex-shrink-0">
                            {count} ({pct}%)
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Achievements */}
            <div>
              <div className="bg-yellow-500 border-2 border-black px-4 py-2 mb-3">
                <h3 className="text-black font-black text-sm uppercase">🏆 Achievements</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: "🌱", label: "First Enhancement",  unlocked: stats.totalEnhanced >= 1 },
                  { icon: "⚡", label: "Power User (10+)",    unlocked: stats.totalEnhanced >= 10 },
                  { icon: "💯", label: "Century (100+)",      unlocked: stats.totalEnhanced >= 100 },
                  { icon: "🔥", label: "3-Day Streak",        unlocked: stats.streak >= 3 },
                  { icon: "🌈", label: "Format Explorer",     unlocked: Object.keys(stats.formatsUsed || {}).length >= 3 },
                  { icon: "📦", label: "1 MB Processed",      unlocked: stats.totalBytesIn >= 1024 ** 2 },
                  { icon: "🚀", label: "10 MB Processed",     unlocked: stats.totalBytesIn >= 10 * 1024 ** 2 },
                  { icon: "👑", label: "Grandmaster (50+)",   unlocked: stats.totalEnhanced >= 50 },
                ].map((a) => (
                  <div
                    key={a.label}
                    className={`border-4 border-black p-3 flex flex-col items-center gap-1 text-center transition-all
                      ${a.unlocked
                        ? "bg-yellow-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                        : "bg-gray-200 opacity-40"}`}
                  >
                    <span className="text-2xl">{a.icon}</span>
                    <span className="text-xs font-black text-gray-800 leading-tight">{a.label}</span>
                    {a.unlocked && <span className="text-xs font-black text-green-700">✅ Unlocked</span>}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default UsageStats;
