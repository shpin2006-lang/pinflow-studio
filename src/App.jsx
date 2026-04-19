import { useState, useEffect, useRef, useCallback, useMemo } from "react";

const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Nunito:wght@400;500;600;700;800;900&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

const styleEl = document.createElement("style");
styleEl.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #F6F4F0; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #d1cec7; border-radius: 10px; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
  @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes slideIn { from { opacity:0; transform: translateX(-12px); } to { opacity:1; transform: translateX(0); } }
  .fade-up { animation: fadeUp 0.5s ease both; }
  .fade-in { animation: fadeIn 0.4s ease both; }
  .slide-in { animation: slideIn 0.4s ease both; }
  .hover-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
  .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.08) !important; }
  .shimmer-bg { background: linear-gradient(90deg, #f0ede8 25%, #e8e5df 50%, #f0ede8 75%); background-size: 400px 100%; animation: shimmer 1.8s infinite; }
  input:focus, textarea:focus, select:focus { outline: none; }
  .pin-card-enter { animation: fadeUp 0.35s ease both; }
`;
document.head.appendChild(styleEl);

const NICHES = [
  { id: "home", label: "Home Decor", emoji: "🏠", color: "#B87333", bg: "#FDF5EE", desc: "Furniture, wall art, candles, organizers" },
  { id: "study", label: "Study & Productivity", emoji: "📚", color: "#2D6A4F", bg: "#EDF7F3", desc: "Stationery, desk setups, planners" },
  { id: "fashion", label: "Fashion & Style", emoji: "👗", color: "#C2185B", bg: "#FDF0F4", desc: "Outfits, accessories, seasonal trends" },
  { id: "fitness", label: "Health & Fitness", emoji: "💪", color: "#558B2F", bg: "#F0F7EA", desc: "Workout gear, supplements, activewear" },
  { id: "beauty", label: "Beauty & Skincare", emoji: "✨", color: "#AD1457", bg: "#FBF0F7", desc: "Skincare, makeup, haircare routines" },
  { id: "travel", label: "Travel", emoji: "✈️", color: "#1565C0", bg: "#EDF4FC", desc: "Luggage, travel gear, destination guides" },
  { id: "food", label: "Food & Recipes", emoji: "🍳", color: "#E65100", bg: "#FFF5E8", desc: "Kitchen gadgets, cookbooks, meal prep" },
  { id: "tech", label: "Tech & Gadgets", emoji: "⚡", color: "#4527A0", bg: "#F0F1FC", desc: "Smart devices, accessories, apps" },
];

const COUNTRIES = [
  { id: "US", name: "United States", flag: "🇺🇸", domain: "amazon.com", curr: "$", code: "USD" },
  { id: "UK", name: "United Kingdom", flag: "🇬🇧", domain: "amazon.co.uk", curr: "£", code: "GBP" },
  { id: "IN", name: "India", flag: "🇮🇳", domain: "amazon.in", curr: "₹", code: "INR" },
  { id: "DE", name: "Germany", flag: "🇩🇪", domain: "amazon.de", curr: "€", code: "EUR" },
  { id: "FR", name: "France", flag: "🇫🇷", domain: "amazon.fr", curr: "€", code: "EUR" },
  { id: "CA", name: "Canada", flag: "🇨🇦", domain: "amazon.ca", curr: "C$", code: "CAD" },
  { id: "IT", name: "Italy", flag: "🇮🇹", domain: "amazon.it", curr: "€", code: "EUR" },
  { id: "ES", name: "Spain", flag: "🇪🇸", domain: "amazon.es", curr: "€", code: "EUR" },
  { id: "AU", name: "Australia", flag: "🇦🇺", domain: "amazon.com.au", curr: "A$", code: "AUD" },
  { id: "JP", name: "Japan", flag: "🇯🇵", domain: "amazon.co.jp", curr: "¥", code: "JPY" },
  { id: "AE", name: "UAE", flag: "🇦🇪", domain: "amazon.ae", curr: "د.إ", code: "AED" },
  { id: "SA", name: "Saudi Arabia", flag: "🇸🇦", domain: "amazon.sa", curr: "﷼", code: "SAR" },
  { id: "BR", name: "Brazil", flag: "🇧🇷", domain: "amazon.com.br", curr: "R$", code: "BRL" },
  { id: "MX", name: "Mexico", flag: "🇲🇽", domain: "amazon.com.mx", curr: "MX$", code: "MXN" },
  { id: "SG", name: "Singapore", flag: "🇸🇬", domain: "amazon.sg", curr: "S$", code: "SGD" },
];

const IMAGE_TOOLS = [
  { id: "gemini", label: "Gemini", url: "https://gemini.google.com/", color: "#4285F4" },
  { id: "designer", label: "MS Designer", url: "https://designer.microsoft.com/image-creator", color: "#0078D4" },
  { id: "ideogram", label: "Ideogram", url: "https://ideogram.ai/t/explore", color: "#FF6B35" },
  { id: "canva", label: "Canva", url: "https://www.canva.com/ai-image-generator/", color: "#00C4CC" },
  { id: "chatgpt", label: "ChatGPT", url: "https://chat.openai.com/", color: "#10A37F" },
  { id: "leonardo", label: "Leonardo", url: "https://app.leonardo.ai/", color: "#8B5CF6" },
];

const T = {
  bg: "#F6F4F0",
  card: "#FFFFFF",
  cardHover: "#FDFCFA",
  text: "#1C1917",
  textSoft: "#78716C",
  textMuted: "#A8A29E",
  border: "#E7E5E4",
  borderLight: "#F0EEEA",
  accent: "#B87333",
  danger: "#DC2626",
  success: "#16A34A",
  successBg: "#F0FDF4",
  dangerBg: "#FEF2F2",
  radius: 16,
  radiusSm: 10,
  radiusXs: 6,
  font: "'Nunito', sans-serif",
  fontDisplay: "'Instrument Serif', serif",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
  shadowMd: "0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
  shadowLg: "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
};

async function callAI(prompt, maxTokens = 4096) {
  const r = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!r.ok) throw new Error(`API error ${r.status}`);
  const d = await r.json();
  if (d.error) throw new Error(d.error.message || "API error");
  return (d.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
}
async function callAIWithImage(prompt, imageBase64, imageMime, maxTokens = 2048) {
  try {
    const r = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        max_tokens: maxTokens,
        messages: [{
          role: "user",
          content: prompt,
          image: { data: imageBase64, mimeType: imageMime }
        }],
      }),
    });
    if (!r.ok) throw new Error(`API error ${r.status}`);
    const d = await r.json();
    if (d.error) throw new Error(d.error.message || "API error");
    return (d.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
  } catch (e) {
    console.error("Image analysis failed:", e);
    throw new Error("Image analysis failed — please try a smaller image or different format");
  }
}
function parseJSON(raw) {
  let c = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  let si = -1, isArr = false;
  for (let i = 0; i < c.length; i++) {
    if (c[i] === "[") { si = i; isArr = true; break; }
    if (c[i] === "{") { si = i; isArr = false; break; }
  }
  if (si === -1) throw new Error("No JSON found");
  const oc = isArr ? "[" : "{", cc = isArr ? "]" : "}";
  let depth = 0, ei = -1, inStr = false, esc = false;
  for (let i = si; i < c.length; i++) {
    const ch = c[i];
    if (esc) { esc = false; continue; }
    if (ch === "\\") { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === oc) depth++;
    if (ch === cc) { depth--; if (depth === 0) { ei = i; break; } }
  }
  if (ei === -1) throw new Error("Incomplete JSON");
  return JSON.parse(c.slice(si, ei + 1));
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.cssText = "position:fixed;opacity:0;left:-9999px";
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand("copy"); document.body.removeChild(ta); return ok;
    } catch { return false; }
  }
}

const STORAGE_KEY = "pinflow-studio-data";

async function loadAppData() {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    if (val) return JSON.parse(val);
  } catch (e) { console.error("Load failed:", e); }
  return null;
}

async function saveAppData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) { console.error("Save failed:", e); return false; }
}

function Badge({ children, color, bg, style: sx }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, color: color || T.text, background: bg || T.bg, fontFamily: T.font, letterSpacing: 0.3, ...sx }}>
      {children}
    </span>
  );
}

function Btn({ children, onClick, color, variant = "solid", disabled, full, small, style: sx }) {
  const c = color || T.accent;
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
    padding: small ? "7px 14px" : "12px 22px",
    fontSize: small ? 12 : 14, fontWeight: 700, fontFamily: T.font,
    borderRadius: T.radiusSm, cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.2s ease", border: "none",
    width: full ? "100%" : undefined, opacity: disabled ? 0.5 : 1,
  };
  const styles = {
    solid: { ...base, background: c, color: "#fff" },
    outline: { ...base, background: "transparent", color: c, border: `2px solid ${c}` },
    ghost: { ...base, background: c + "12", color: c, border: `1px solid ${c}30` },
    soft: { ...base, background: c + "15", color: c },
  };
  return <button onClick={disabled ? undefined : onClick} style={{ ...styles[variant], ...sx }}>{children}</button>;
}

function CopyButton({ text, label = "Copy", color, small }) {
  const [ok, setOk] = useState(false);
  return (
    <Btn small={small !== false} variant="ghost" color={ok ? T.success : (color || T.textSoft)}
      onClick={async (e) => { e.stopPropagation(); await copyText(text); setOk(true); setTimeout(() => setOk(false), 1800); }}>
      {ok ? "✓ Copied" : label}
    </Btn>
  );
}

function Card({ children, style: sx, className, onClick, hover }) {
  return (
    <div className={`${hover ? "hover-lift" : ""} ${className || ""}`}
      onClick={onClick}
      style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: 20, boxShadow: T.shadow, cursor: onClick ? "pointer" : undefined, ...sx }}>
      {children}
    </div>
  );
}

function SectionTitle({ children, sub, right }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18, gap: 12 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, fontFamily: T.font, color: T.text, margin: 0, lineHeight: 1.2 }}>{children}</h2>
        {sub && <p style={{ fontSize: 13, color: T.textSoft, marginTop: 4, lineHeight: 1.4 }}>{sub}</p>}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

function EmptyState({ icon, title, sub, action }) {
  return (
    <div className="fade-up" style={{ textAlign: "center", padding: "50px 20px" }}>
      <div style={{ fontSize: 48, marginBottom: 14 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: 17, fontFamily: T.font, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 14, color: T.textSoft, maxWidth: 340, margin: "0 auto 18px", lineHeight: 1.5 }}>{sub}</div>
      {action}
    </div>
  );
}

function ProgressSteps({ current, total, label, color }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, fontFamily: T.font, color: T.text }}>{label}</span>
        <span style={{ fontSize: 12, color: T.textSoft, fontWeight: 600 }}>{current}/{total}</span>
      </div>
      <div style={{ height: 6, background: T.bg, borderRadius: 100, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(current / total) * 100}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)`, borderRadius: 100, transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }} />
      </div>
    </div>
  );
}

function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fade-in" style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      padding: "10px 22px", background: T.text, color: "#fff", borderRadius: 100,
      fontSize: 13, fontWeight: 600, fontFamily: T.font, zIndex: 10000,
      boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
    }}>
      {message}
    </div>
  );
}

function LoadingSkeleton({ lines = 3 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="shimmer-bg" style={{ height: 16, borderRadius: 8, width: `${90 - i * 15}%` }} />
      ))}
    </div>
  );
}

function ImageToolButtons({ prompt, accentColor }) {
  const [copied, setCopied] = useState(null);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
      {IMAGE_TOOLS.map(tool => (
        <button key={tool.id}
          onClick={() => {
            copyText(prompt);
            setCopied(tool.id);
            setTimeout(() => setCopied(null), 3000);
            try { window.open(tool.url, "_blank"); } catch {}
          }}
          style={{
            padding: "5px 12px", fontSize: 11, fontWeight: 700, fontFamily: T.font,
            background: copied === tool.id ? T.success + "20" : (accentColor || tool.color) + "12",
            color: copied === tool.id ? T.success : (accentColor || tool.color),
            border: `1px solid ${copied === tool.id ? T.success + "50" : (accentColor || tool.color) + "30"}`,
            borderRadius: 20, cursor: "pointer", transition: "all 0.15s ease",
          }}>
          {copied === tool.id ? "✓ Prompt copied! Paste there →" : tool.label}
        </button>
      ))}
      <CopyButton text={prompt} label="Copy Prompt" color={accentColor} />
    </div>
  );
}

function ProductCard({ product, color, index }) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const p = product;
  const imgPrompt = p.image_prompt || `Product photography: ${p.name}, white background, studio lighting, sharp focus, 4K`;
  return (
    <Card className="pin-card-enter" style={{ animationDelay: `${index * 0.06}s` }}>
      <div style={{ display: "flex", gap: 14 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 12, flexShrink: 0,
          background: `linear-gradient(135deg, ${color}, ${color}cc)`,
          color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, fontSize: 15, fontFamily: T.font,
        }}>{index + 1}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {p.role && <Badge color={color} bg={color + "15"} style={{ marginBottom: 6 }}>{p.role}</Badge>}
          <div style={{ fontWeight: 800, fontSize: 15, fontFamily: T.font, marginBottom: 4, color: T.text }}>{p.name}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
  {p.price && <span style={{ fontSize: 16, fontWeight: 800, color }}>{p.price}</span>}
  {p.color && (
    <Badge color="#fff" bg={color} style={{ display: "flex", alignItems: "center", gap: 4 }}>
      🎨 {p.color}
    </Badge>
  )}
  {p.category && <Badge>{p.category}</Badge>}
</div>
{p.palette && (
  <div style={{ marginBottom: 8, padding: "8px 12px", background: color + "10", borderRadius: T.radiusXs, fontSize: 12, fontWeight: 600, color }}>
    🎨 Outfit Palette: {p.palette}
  </div>
)}
          {p.style_tip && (
  <div style={{ marginBottom: 8, padding: "8px 12px", background: "#F0F7FF", borderRadius: T.radiusXs, fontSize: 12, fontWeight: 600, color: "#1565C0" }}>
    💡 Style Tip: {p.style_tip}
  </div>
)}
{p.why && <p style={{ fontSize: 13, color: T.textSoft, lineHeight: 1.55, marginBottom: 12 }}>{p.why}</p>}
         {p.affiliate_link && (
  <div style={{ marginBottom: 14 }}>
    {/* Big clickable Amazon button */}
    <a href={p.affiliate_link} target="_blank" rel="noopener noreferrer"
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", borderRadius: T.radiusSm, textDecoration: "none",
        background: "linear-gradient(135deg, #FF9900, #FF6600)",
        marginBottom: 8, transition: "opacity 0.2s ease",
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
      onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>🛒</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", fontFamily: T.font }}>
            Find on Amazon
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", fontFamily: T.font }}>
            Search with your affiliate tag
          </div>
        </div>
      </div>
      <span style={{ color: "#fff", fontSize: 18 }}>→</span>
    </a>

    {/* Copy link row */}
    <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "8px 12px", background: T.bg, borderRadius: T.radiusXs }}>
      <span style={{ fontSize: 11, color: T.textSoft, flex: 1, wordBreak: "break-all", fontFamily: T.font, fontWeight: 600 }}>
        🔗 {p.affiliate_link.slice(0, 50)}...
      </span>
      <Btn small variant="ghost" color={linkCopied ? T.success : color}
        onClick={async () => { await copyText(p.affiliate_link); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 1800); }}>
        {linkCopied ? "✓ Copied" : "Copy Link"}
      </Btn>
    </div>
  </div>
)}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 800, marginBottom: 6, color: T.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>Product Photo Prompt</div>
            <ImageToolButtons prompt={imgPrompt} accentColor={color} />
          </div>
          <button onClick={() => setShowPrompt(!showPrompt)}
            style={{ fontSize: 11, color: T.textMuted, background: "none", border: "none", cursor: "pointer", fontFamily: T.font, fontWeight: 600, padding: "4px 0" }}>
            {showPrompt ? "Hide prompt ▲" : "Show prompt ▼"}
          </button>
          {showPrompt && (
            <div style={{ marginTop: 8, padding: 14, background: T.bg, borderRadius: T.radiusSm, fontSize: 11, fontFamily: "'Courier New', monospace", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.6, color: T.textSoft }}>
              {imgPrompt}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function PinTitleCard({ pin, color, index, products }) {
  const [expanded, setExpanded] = useState(false);
  const fullText = `${pin.title}\n\n${pin.description || ""}\n\n${(pin.hashtags || []).map(h => `#${h}`).join(" ")}`;
  return (
    <Card className="pin-card-enter" style={{ padding: 14, animationDelay: `${index * 0.04}s` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setExpanded(!expanded)}>
        <span style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, fontSize: 11, fontWeight: 800, background: color + "15", color, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {index + 1}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13, fontFamily: T.font, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pin.title}</div>
          <div style={{ display: "flex", gap: 5, marginTop: 4, flexWrap: "wrap" }}>
            {pin.board && <Badge color={color} bg={color + "10"} style={{ fontSize: 10 }}>{pin.board}</Badge>}
            {pin.style_tag && <Badge style={{ fontSize: 10 }}>{pin.style_tag}</Badge>}
          </div>
        </div>
        <CopyButton text={fullText} label="Copy" color={color} />
        <span style={{ color: T.textMuted, fontSize: 13, flexShrink: 0 }}>{expanded ? "▲" : "▼"}</span>
      </div>
      {expanded && (
        <div className="fade-in" style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.borderLight}` }}>
          {pin.description && <p style={{ fontSize: 13, lineHeight: 1.55, marginBottom: 10, color: T.textSoft }}>{pin.description}</p>}
          {pin.hashtags?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
              {pin.hashtags.map((h, i) => <span key={i} style={{ fontSize: 11, color, fontWeight: 600 }}>#{h}</span>)}
            </div>
          )}
          {pin.top_products && products && (
            <div style={{ fontSize: 12, color: T.textSoft }}>
              <strong>Featured:</strong>{" "}
              {pin.top_products.map(ref => {
                const p = products[(typeof ref === "number" ? ref : parseInt(ref)) - 1];
                return p ? p.name : `#${ref}`;
              }).join(", ")}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function PinAnalyzer({ color, onSaveStyle }) {
  const [imgBase64, setImgBase64] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [imgMime, setImgMime] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

const onFile = (e) => {
  const f = e.target.files?.[0];
  if (!f) return;
  setAnalysis(null); setError("");

  // Compress image before sending
  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      // Resize to max 800px width/height
      const MAX = 800;
      let w = img.width;
      let h = img.height;
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
        else { w = Math.round(w * MAX / h); h = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      // Compress to JPEG at 80% quality
      const compressed = canvas.toDataURL("image/jpeg", 0.8);
      setImgPreview(compressed);
      setImgBase64(compressed.split(",")[1]);
      setImgMime("image/jpeg");
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(f);
};

  const analyze = async () => {
    if (!imgBase64) return;
    setAnalyzing(true); setError(""); setAnalysis(null);
    try {
      const txt = await callAIWithImage(
        `Analyze this Pinterest pin image. Return a JSON object with:
{
  "topic": "What this pin is about",
  "layout_type": "flat lay / lifestyle / numbered guide / top list / hero spotlight / mood board / other",
  "style_description": "2-3 sentences describing the visual style, colors, typography, mood",
  "color_palette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "text_on_image": "Any text visible on the pin",
  "target_audience": "Who this pin targets",
  "recreate_prompt": "A detailed prompt (150-200 words) to recreate this exact pin's visual style with different products."
}
Return ONLY the JSON object.`,
        imgBase64, imgMime, 2048
      );
      setAnalysis(parseJSON(txt));
    } catch (e) {
  setError("Image analysis failed. Please try a smaller image (under 1MB) or a different format like JPG.");
} finally {
  setAnalyzing(false);
}
  };

  const saveAsLayout = () => {
    if (!analysis) return;
    onSaveStyle({ label: analysis.topic?.slice(0, 30) || "Custom Pin Style", layout_type: analysis.layout_type || "custom", style_description: analysis.style_description || "", color_palette: analysis.color_palette || [], recreate_prompt: analysis.recreate_prompt || "", target_audience: analysis.target_audience || "", savedAt: new Date().toISOString() });
    setAnalysis(null); setImgBase64(null); setImgPreview(null);
  };

  return (
    <Card style={{ border: "1px solid #C4B5FD", background: "#FAFAFE" }}>
      <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6, fontFamily: T.font, color: "#7C3AED" }}>📷 Recreate From Pin</div>
      <p style={{ fontSize: 13, color: T.textSoft, marginBottom: 16, lineHeight: 1.5 }}>Upload a Pinterest pin you like. AI will analyze its style and save it as a reusable layout.</p>
      <div onClick={() => fileRef.current?.click()}
        style={{ border: `2px dashed ${imgPreview ? "#7C3AED" : T.border}`, borderRadius: T.radiusSm, padding: imgPreview ? 12 : 32, textAlign: "center", cursor: "pointer", background: imgPreview ? "transparent" : T.bg, marginBottom: 14, transition: "all 0.2s ease" }}>
        {imgPreview ? <img src={imgPreview} alt="Pin preview" style={{ maxHeight: 200, maxWidth: "100%", borderRadius: 8, display: "block", margin: "0 auto" }} /> : <div><div style={{ fontSize: 32, marginBottom: 8 }}>📷</div><div style={{ color: T.textSoft, fontSize: 13, fontWeight: 600 }}>Click to upload a Pinterest pin image</div></div>}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
      {imgBase64 && !analysis && <Btn onClick={analyze} disabled={analyzing} color="#7C3AED" full style={{ marginBottom: 14 }}>{analyzing ? "⏳ Analyzing pin style..." : "🔍 Analyze Pin Style"}</Btn>}
      {error && <div style={{ padding: 12, background: T.dangerBg, borderRadius: T.radiusXs, color: T.danger, fontSize: 13, marginBottom: 14 }}>⚠️ {error}</div>}
      {analysis && (
        <div className="fade-up" style={{ padding: 18, background: "#F3E8FF", borderRadius: T.radiusSm, border: "1px solid #C4B5FD" }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12, color: "#7C3AED" }}>📸 Pin Analysis</div>
          <div style={{ fontSize: 13, marginBottom: 8 }}><strong>Topic:</strong> {analysis.topic}</div>
          <div style={{ fontSize: 13, marginBottom: 8 }}><strong>Layout:</strong> {analysis.layout_type}</div>
          <div style={{ fontSize: 13, marginBottom: 12 }}><strong>Style:</strong> {analysis.style_description}</div>
          {analysis.color_palette?.length > 0 && (
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {analysis.color_palette.map((c, i) => <div key={i} onClick={() => copyText(c)} title={`Click to copy ${c}`} style={{ width: 36, height: 36, borderRadius: 8, background: c, border: "2px solid #fff", boxShadow: "0 1px 4px rgba(0,0,0,0.15)", cursor: "pointer" }} />)}
            </div>
          )}
          <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 6, color: "#7C3AED", textTransform: "uppercase", letterSpacing: 0.5 }}>Recreate Prompt</div>
          <div style={{ fontSize: 11, fontFamily: "'Courier New', monospace", background: "#fff", padding: 12, borderRadius: 8, marginBottom: 14, whiteSpace: "pre-wrap", maxHeight: 140, overflow: "auto", lineHeight: 1.6, color: T.textSoft }}>{analysis.recreate_prompt}</div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={saveAsLayout} color="#7C3AED">💾 Save as Layout</Btn>
            <CopyButton text={analysis.recreate_prompt} label="Copy Prompt" color="#7C3AED" />
          </div>
        </div>
      )}
    </Card>
  );
}

function PinImageGenerator({ products, pins, nicheId, color, savedStyles, onDelStyle }) {
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [selectedPin, setSelectedPin] = useState(0);
  const [custom, setCustom] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const niche = NICHES.find(n => n.id === nicheId) || NICHES[0];
  const pNames = (products || []).map((p, i) => `${i + 1}. ${p.name} (${p.price})`).join("\n");
  const pNamesShort = (products || []).slice(0, 6).map(p => p.name).join(", ");
  const pinTitle = pins?.[selectedPin]?.title || "Pinterest Pin";
  const pinDesc = pins?.[selectedPin]?.description || "";
  const hero = products?.[0]?.name || "main product";

  const builtInLayouts = [
    { id: "flatlay", label: "Flat Lay Collage", icon: "⊞", desc: "Products arranged on a surface, shot from above", prompt: `Create a Pinterest flat lay product collage pin (1000×1500px, 2:3 vertical ratio).\n\nTITLE ON IMAGE: "${pinTitle}"\n\nPRODUCTS TO SHOW:\n${pNames}\n\nSTYLE: Overhead flat lay photography on a clean marble or light wood surface. Products arranged in an aesthetic grid with small props. Soft natural window lighting. Title text in elegant serif font at top.\n\nMake it look like a real styled product photo.` },
    { id: "lifestyle", label: "Lifestyle Scene", icon: "🌿", desc: "Person using products in a real setting", prompt: `Create a Pinterest lifestyle pin (1000×1500px, 2:3 vertical ratio).\n\nTITLE ON IMAGE: "${pinTitle}"\n\nPRODUCTS FEATURED: ${pNamesShort}\n\nSTYLE: Warm lifestyle photography showing a person naturally using these products in a beautiful ${niche.label.toLowerCase()} setting. Golden hour warm lighting, shallow depth of field. Accent color ${color}. Title text overlaid at top.\n\nShould feel like an editorial magazine photo.` },
    { id: "numbered", label: "Numbered Guide", icon: "①", desc: "Step-by-step infographic with numbered items", prompt: `Create a Pinterest numbered guide infographic (1000×1500px, 2:3 vertical ratio).\n\nTITLE AT TOP: "${pinTitle}"\n\nITEMS:\n${pNames}\n\nSTYLE: Clean modern infographic layout. Each item gets a numbered circle with a small product photo, name and price. Accent color ${color} for numbers and dividers. White background. Clean sans-serif typography.` },
    { id: "toplist", label: "Top Picks Ranking", icon: "🏆", desc: "Magazine-style ranked product list", prompt: `Create a Pinterest "Top Picks" ranking pin (1000×1500px, 2:3 vertical ratio).\n\nHEADLINE: "${pinTitle}"\n\nRANKED PRODUCTS:\n${pNames}\n\nSTYLE: Editorial magazine ranking layout. Bold headline at top. Each product gets a rank badge. Accent color ${color}. Modern typography mixing serif headline with sans-serif body.` },
    { id: "hero", label: "Hero Spotlight", icon: "★", desc: "One hero product with supporting items", prompt: `Create a Pinterest hero product spotlight pin (1000×1500px, 2:3 vertical ratio).\n\nTITLE: "${pinTitle}"\n\nHERO PRODUCT (large, center): ${hero}\n\nSUPPORTING PRODUCTS:\n${pNamesShort}\n\nSTYLE: Dramatic product photography. Hero product large and center with spotlight effect. Supporting products smaller below. Dark gradient background. Bold title text. Accent color ${color}.` },
    { id: "aesthetic", label: "Aesthetic Mood Board", icon: "🎭", desc: "Collage of textures, colors, and product vibes", prompt: `Create a Pinterest aesthetic mood board pin (1000×1500px, 2:3 vertical ratio).\n\nTHEME: "${pinTitle}"\nSUBTITLE: "${pinDesc}"\n\nINSPIRED BY: ${pNamesShort}\n\nSTYLE: Mood board collage with 6-9 tiles in an asymmetric grid. Mix product photos with textures, color swatches matching ${color}, and lifestyle shots. Cohesive ${niche.label.toLowerCase()} aesthetic. Muted warm palette.` },
  { 
  id: "outfitflatlay", 
  label: "Outfit Flat Lay", 
  icon: "👕", 
  desc: "Clean white background flat lay like a styled outfit post",
  prompt: `Create a Pinterest outfit flat lay pin (1000×1500px, 2:3 vertical ratio).

TITLE: "${pinTitle}"

OUTFIT ITEMS TO ARRANGE:
${pNames}

STYLE REQUIREMENTS — Follow EXACTLY:
- Pure white background (#FFFFFF) — no shadows, no texture
- Items laid completely flat and spread naturally across the frame
- Clothing items (shirts, pants, jackets) laid flat and slightly unfolded as if someone just placed them
- Accessories (bags, watches, shoes) placed naturally around the clothing
- Shoes placed at bottom, slightly overlapping
- Bag/backpack placed in top right corner
- Watch or small accessories placed on right side middle
- Any drink or small prop placed bottom left or center
- Items should NOT overlap each other except slightly at edges
- Spacing between items should feel natural and breathable
- NO text overlay on the image
- NO props like flowers or candles
- Photography style: overhead flat lay, perfect top-down angle
- Lighting: bright, even, soft studio lighting — no harsh shadows
- Color palette: let the natural product colors show
- Overall feel: clean, minimal, Pinterest-worthy menswear/fashion flat lay

Make it look EXACTLY like a professional fashion flat lay photo on pure white background.`
},
];

  const customLayouts = (savedStyles || []).map((s, i) => ({
    id: `custom-${i}`, label: s.label || `Custom Style ${i + 1}`, icon: "📷", desc: s.style_description ? s.style_description.slice(0, 60) + "..." : "Recreated from a pin you uploaded", isCustom: true, customIndex: i, colorPalette: s.color_palette || [],
    prompt: `Recreate this Pinterest pin style (1000×1500px, 2:3 vertical ratio).\n\nTITLE ON IMAGE: "${pinTitle}"\n\nPRODUCTS TO FEATURE:\n${pNames}\n\nRECREATE THIS STYLE:\n${s.recreate_prompt}\n\nCOLOR PALETTE: ${(s.color_palette || []).join(", ")}\n\nIMPORTANT: Keep the exact same visual style but use MY products and title.`
  }));

  const allLayouts = [...builtInLayouts, ...customLayouts];
  const activeLayout = allLayouts.find(l => l.id === selectedLayout);
  const finalPrompt = custom.trim() || (activeLayout ? activeLayout.prompt : "");

  return (
    <Card>
      <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6, fontFamily: T.font }}>🎨 Generate Complete Pin</div>
      <p style={{ fontSize: 13, color: T.textSoft, marginBottom: 20, lineHeight: 1.5 }}>Pick a layout, choose a pin title, and generate the complete pin image.</p>
      {pins?.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 8, color: T.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>Pin Title</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {pins.map((p, i) => (
              <button key={i} onClick={() => setSelectedPin(i)}
                style={{ padding: "12px 16px", textAlign: "left", cursor: "pointer", background: selectedPin === i ? color + "10" : T.bg, border: `2px solid ${selectedPin === i ? color : T.border}`, borderRadius: T.radiusSm, fontFamily: T.font, fontSize: 13, fontWeight: 600, color: selectedPin === i ? color : T.text, transition: "all 0.15s ease" }}>
                {p.title}
              </button>
            ))}
          </div>
        </div>
      )}
      <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 10, color: T.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>Choose Layout</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: customLayouts.length > 0 ? 14 : 20 }}>
        {builtInLayouts.map(l => (
          <button key={l.id} onClick={() => setSelectedLayout(l.id)}
            style={{ padding: "16px 14px", textAlign: "left", cursor: "pointer", background: selectedLayout === l.id ? color + "10" : T.card, border: `2px solid ${selectedLayout === l.id ? color : T.border}`, borderRadius: T.radiusSm, transition: "all 0.15s ease" }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{l.icon}</div>
            <div style={{ fontWeight: 800, fontSize: 13, fontFamily: T.font, marginBottom: 3, color: selectedLayout === l.id ? color : T.text }}>{l.label}</div>
            <div style={{ fontSize: 11, color: T.textSoft, lineHeight: 1.4 }}>{l.desc}</div>
          </button>
        ))}
      </div>
      {customLayouts.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 10, color: "#7C3AED", textTransform: "uppercase", letterSpacing: 1 }}>📷 Your Saved Pin Styles</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {customLayouts.map(l => (
              <div key={l.id} style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setSelectedLayout(l.id)}
                  style={{ flex: 1, padding: "14px 16px", textAlign: "left", cursor: "pointer", background: selectedLayout === l.id ? "#7C3AED10" : T.card, border: `2px solid ${selectedLayout === l.id ? "#7C3AED" : "#C4B5FD"}`, borderRadius: T.radiusSm, transition: "all 0.15s ease" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 16 }}>📷</span>
                    <span style={{ fontWeight: 800, fontSize: 13, fontFamily: T.font, color: selectedLayout === l.id ? "#7C3AED" : T.text }}>{l.label}</span>
                    <div style={{ display: "flex", gap: 3, marginLeft: "auto" }}>
                      {(l.colorPalette || []).slice(0, 5).map((c, ci) => <span key={ci} style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: c, border: "1px solid rgba(0,0,0,0.1)" }} />)}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: T.textSoft, lineHeight: 1.4 }}>{l.desc}</div>
                </button>
                <button onClick={() => onDelStyle && onDelStyle(l.customIndex)} style={{ padding: "8px 10px", background: "#FEE2E2", color: "#DC2626", border: "1px solid #FCA5A5", borderRadius: T.radiusXs, cursor: "pointer", fontSize: 12, fontFamily: T.font, fontWeight: 700, alignSelf: "center" }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 6, color: T.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>Custom Prompt (optional)</div>
        <textarea value={custom} onChange={e => setCustom(e.target.value)} placeholder="Leave empty to use the layout prompt above..." style={{ width: "100%", height: 60, padding: 12, border: `1px solid ${T.border}`, borderRadius: T.radiusSm, fontFamily: T.font, fontSize: 12, resize: "vertical", lineHeight: 1.5 }} />
      </div>
      {finalPrompt && (
        <>
          <button onClick={() => setShowPreview(!showPreview)} style={{ fontSize: 11, color: T.textMuted, background: "none", border: "none", cursor: "pointer", fontFamily: T.font, fontWeight: 600, marginBottom: 14 }}>
            {showPreview ? "Hide prompt preview ▲" : "Show prompt preview ▼"}
          </button>
          {showPreview && <div className="fade-in" style={{ padding: 14, background: T.bg, borderRadius: T.radiusSm, fontSize: 11, fontFamily: "'Courier New', monospace", whiteSpace: "pre-wrap", marginBottom: 18, maxHeight: 250, overflow: "auto", lineHeight: 1.6, color: T.textSoft }}>{finalPrompt}</div>}
        </>
      )}
      {finalPrompt && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 10, color: T.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>Generate With</div>
          <ImageToolButtons prompt={finalPrompt} accentColor={color} />
        </div>
      )}
      {!selectedLayout && !custom.trim() && <div style={{ textAlign: "center", padding: "20px 0", color: T.textMuted, fontSize: 13 }}>↑ Select a layout above to generate your pin prompt</div>}
    </Card>
  );
}

function Sidebar({ activeTab, onTabChange, niche, onNicheChange, nicheObj, packCount }) {
  const [nicheOpen, setNicheOpen] = useState(false);
  const tabs = [
    { id: "home", label: "Home", icon: "✦" },
    { id: "generate", label: "Generate", icon: "⚡" },
    { id: "packages", label: "Saved", icon: "📦", badge: packCount },
    { id: "settings", label: "Settings", icon: "⚙" },
  ];
  return (
    <div style={{ width: 240, minHeight: "100vh", background: T.card, borderRight: `1px solid ${T.border}`, padding: "24px 16px", display: "flex", flexDirection: "column", position: "fixed", left: 0, top: 0, zIndex: 100, overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32, paddingLeft: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${nicheObj.color}, ${nicheObj.color}aa)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#fff", fontWeight: 800 }}>✦</div>
        <div>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 400, color: T.text, lineHeight: 1 }}>PinFlow</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, letterSpacing: 1.5, textTransform: "uppercase" }}>STUDIO</div>
        </div>
      </div>
      <div style={{ marginBottom: 24, position: "relative" }}>
        <button onClick={() => setNicheOpen(!nicheOpen)} style={{ width: "100%", padding: "10px 14px", background: nicheObj.bg, border: `1px solid ${nicheObj.color}30`, borderRadius: T.radiusSm, cursor: "pointer", fontFamily: T.font, display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: nicheObj.color }}>
          <span style={{ fontSize: 16 }}>{nicheObj.emoji}</span>
          <span style={{ flex: 1, textAlign: "left" }}>{nicheObj.label}</span>
          <span style={{ fontSize: 11 }}>{nicheOpen ? "▲" : "▼"}</span>
        </button>
        {nicheOpen && (
          <div className="fade-in" style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, background: "#fff", border: `1px solid ${T.border}`, borderRadius: T.radiusSm, boxShadow: T.shadowMd, zIndex: 50, overflow: "hidden" }}>
            {NICHES.map(n => (
              <button key={n.id} onClick={() => { onNicheChange(n.id); setNicheOpen(false); }} style={{ width: "100%", padding: "10px 14px", border: "none", cursor: "pointer", fontFamily: T.font, fontSize: 13, fontWeight: 600, textAlign: "left", display: "flex", alignItems: "center", gap: 8, background: niche === n.id ? n.bg : "transparent", color: niche === n.id ? n.color : T.text }}>
                <span>{n.emoji}</span> {n.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => onTabChange(t.id)} style={{ padding: "11px 14px", border: "none", borderRadius: T.radiusSm, cursor: "pointer", fontFamily: T.font, fontSize: 14, fontWeight: 700, textAlign: "left", display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s ease", background: activeTab === t.id ? nicheObj.color + "12" : "transparent", color: activeTab === t.id ? nicheObj.color : T.textSoft }}>
            <span style={{ fontSize: 16, width: 22, textAlign: "center" }}>{t.icon}</span>
            {t.label}
            {t.badge > 0 && <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 10, background: nicheObj.color, color: "#fff" }}>{t.badge}</span>}
          </button>
        ))}
      </nav>
      <div style={{ paddingTop: 20, borderTop: `1px solid ${T.borderLight}`, marginTop: 20 }}>
        <div style={{ fontSize: 11, color: T.textMuted, textAlign: "center", lineHeight: 1.5 }}>Built with ♡ by <strong style={{ color: T.textSoft }}>ASAHI</strong></div>
      </div>
    </div>
  );
}

function HomeTab({ nicheObj, onTabChange, packCount, hasTag }) {
  const color = nicheObj.color;
  return (
    <div className="fade-up">
      <div style={{ textAlign: "center", padding: "50px 20px 40px", background: `radial-gradient(ellipse at top, ${color}08, transparent 70%)`, borderRadius: T.radius, marginBottom: 30 }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, margin: "0 auto 20px", background: `linear-gradient(135deg, ${color}, ${color}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: "#fff", boxShadow: `0 8px 30px ${color}30` }}>✦</div>
        <h1 style={{ fontFamily: T.fontDisplay, fontSize: 38, fontWeight: 400, color: T.text, marginBottom: 8 }}>PinFlow Studio</h1>
        <p style={{ fontSize: 16, color: T.textSoft, maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>Your AI-powered Pinterest affiliate marketing toolkit. Generate articles, find products, create pin titles & image prompts — all in one place.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 30 }}>
        {[{ label: "Saved Packages", value: packCount, icon: "📦" }, { label: "Niches Available", value: NICHES.length, icon: "🎯" }, { label: "Countries", value: COUNTRIES.length, icon: "🌍" }].map(s => (
          <Card key={s.label} style={{ textAlign: "center", padding: 18 }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 900, fontFamily: T.font, color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: T.textSoft, fontWeight: 600 }}>{s.label}</div>
          </Card>
        ))}
      </div>
      <SectionTitle sub="Follow these steps to create your first pin package">Getting Started</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          { step: "1", title: "Connect your affiliate tags", desc: "Add your Amazon affiliate tags for each country you want to target.", tab: "settings", done: hasTag },
          { step: "2", title: "Generate a pin package", desc: "Type a topic and let AI create articles, find products, and write pin titles for you.", tab: "generate", done: packCount > 0 },
          { step: "3", title: "Create pin images & post!", desc: "Use the generated prompts with Canva, Gemini, or any AI image tool to create stunning pins.", tab: "packages", done: false },
        ].map(s => (
          <Card key={s.step} hover onClick={() => onTabChange(s.tab)} style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: s.done ? T.success : `linear-gradient(135deg, ${color}, ${color}cc)`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 17, fontFamily: T.font }}>{s.done ? "✓" : s.step}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15, fontFamily: T.font, marginBottom: 3 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: T.textSoft, lineHeight: 1.4 }}>{s.desc}</div>
            </div>
            <span style={{ color: T.textMuted, fontSize: 18 }}>→</span>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SettingsTab({ tags, setTags, color }) {
  const hasTag = Object.values(tags).some(t => t?.trim());
  const tagCount = Object.values(tags).filter(t => t?.trim()).length;
  const [savedFlash, setSavedFlash] = useState("");

  const handleTagChange = (countryId, value) => {
    setTags(prev => ({ ...prev, [countryId]: value }));
    setSavedFlash(countryId);
    setTimeout(() => setSavedFlash(""), 1500);
  };

  return (
    <div className="fade-up">
      <SectionTitle sub="Add your Amazon affiliate tracking IDs for each country">Connect Affiliate Tags</SectionTitle>
      {hasTag ? (
        <div style={{ padding: 14, background: T.successBg, border: "1px solid #86EFAC", borderRadius: T.radiusSm, color: T.success, fontSize: 13, fontWeight: 700, marginBottom: 20 }}>✓ {tagCount} tag{tagCount !== 1 ? "s" : ""} connected and saved</div>
      ) : (
        <div style={{ padding: 16, background: T.dangerBg, border: "1px solid #FECACA", borderRadius: T.radiusSm, color: T.danger, fontSize: 13, fontWeight: 700, marginBottom: 20 }}>⚠️ Add at least one affiliate tag to start generating packages</div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {COUNTRIES.map(c => {
          const val = tags[c.id] || "";
          const has = val.trim();
          const justSaved = savedFlash === c.id;
          return (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: T.card, border: `1px solid ${justSaved ? T.success : has ? "#86EFAC" : T.border}`, borderRadius: T.radiusSm, transition: "border-color 0.3s ease" }}>
              <span style={{ fontSize: 24 }}>{c.flag}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, fontFamily: T.font }}>{c.name}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{c.domain} · {c.curr}</div>
              </div>
              <input value={val} onChange={e => handleTagChange(c.id, e.target.value)} placeholder="e.g., mystore-20"
                style={{ width: 175, padding: "9px 12px", border: `1px solid ${T.border}`, borderRadius: T.radiusXs, fontSize: 13, fontFamily: T.font }}
                onFocus={e => { e.target.style.borderColor = color; }}
                onBlur={e => { e.target.style.borderColor = T.border; }} />
              {justSaved ? <span className="fade-in" style={{ color: T.success, fontSize: 11, fontWeight: 800, flexShrink: 0, fontFamily: T.font }}>Saved!</span> : has ? <span style={{ color: T.success, fontSize: 20, flexShrink: 0 }}>✓</span> : null}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 28, padding: 20, background: color + "08", borderRadius: T.radius, border: `1px solid ${color}15` }}>
        <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8, fontFamily: T.font }}>💡 How to get your affiliate tag</div>
        <ol style={{ fontSize: 13, color: T.textSoft, lineHeight: 1.7, paddingLeft: 18 }}>
          <li style={{ marginBottom: 4 }}>Go to the Amazon Associates page for your country</li>
          <li style={{ marginBottom: 4 }}>Sign up or log in to your affiliate account</li>
          <li style={{ marginBottom: 4 }}>Find your tracking ID (looks like <code style={{ background: T.bg, padding: "2px 6px", borderRadius: 4, fontSize: 12 }}>yourname-20</code>)</li>
          <li>Paste it in the field above for the matching country</li>
        </ol>
      </div>
    </div>
  );
}

function GenerateTab({ nicheId, nicheObj, tags, onSave, savedStyles, onAddStyle, onDelStyle, pendingTopic, onClearPending }) {
  const color = nicheObj.color;
  const [topic, setTopic] = useState("");
  const [country, setCountry] = useState("US");
  const [gender, setGender] = useState("women");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [products, setProducts] = useState(null);
  const [pins, setPins] = useState(null);

  const co = COUNTRIES.find(c => c.id === country) || COUNTRIES[0];
  const tag = tags?.[country]?.trim() || "";
  const gt = gender === "unisex" ? "all genders" : gender;

  useEffect(() => {
    if (pendingTopic?.trim()) { setTopic(pendingTopic); onClearPending(); }
  }, [pendingTopic]);

  const generate = async () => {
  if (!topic.trim()) { setError("Please enter a topic first!"); return; }
  if (!tag) { setError(`Please set an affiliate tag for ${co.name} first (go to Settings tab).`); return; }
  setLoading(true); setError(""); setStep(0); setProducts(null); setPins(null);
  window.scrollTo(0, 0);
  try {
    // ── STEP 1: Find products ──
    setStep(1);
    const isFashion = nicheId === "fashion";
    const palettes = [
  // Neutrals & Earth Tones
  "Camel, Cream and Brown",
  "Beige, Tan and Ivory",
  "Sand, Stone and White",
  "Taupe, Greige and Cream",
  "Khaki, Olive and Brown",
  "Mocha, Latte and Cream",
  "Chocolate, Caramel and Cream",
  "Cognac, Tan and Ivory",
  "Toffee, Nude and White",
  "Walnut, Sand and Beige",

  // Greens
  "Sage Green, Beige and White",
  "Forest Green, Brown and Cream",
  "Olive, Tan and Cream",
  "Emerald Green, Gold and Cream",
  "Mint Green, White and Gold",
  "Moss Green, Camel and Brown",
  "Hunter Green, Burgundy and Cream",
  "Seafoam, White and Sand",
  "Sage, Dusty Rose and Cream",
  "Eucalyptus, Ivory and Brown",
  "Bottle Green, Camel and White",
  "Pistachio, Cream and Gold",
  "Fern Green, Beige and Rust",
  "Jade, White and Gold",
  "Chartreuse, Black and White",

  // Blues
  "Navy, Camel and Cream",
  "Cobalt Blue, White and Brown",
  "Powder Blue, White and Silver",
  "Steel Blue, Grey and Cream",
  "Denim, White and Camel",
  "Slate Blue, Grey and White",
  "Periwinkle, Lavender and White",
  "Teal, Gold and Cream",
  "Peacock Blue, Gold and White",
  "Cerulean, White and Sand",
  "Indigo, Cream and Gold",
  "Sky Blue, White and Blush",
  "Cornflower, White and Grey",
  "Midnight Blue, Silver and White",
  "Baby Blue, White and Cream",

  // Pinks & Reds
  "Dusty Rose, Mauve and Cream",
  "Blush Pink, Grey and White",
  "Burgundy, Navy and Grey",
  "Coral, White and Gold",
  "Salmon, Peach and Cream",
  "Magenta, Black and White",
  "Hot Pink, Black and White",
  "Rose Gold, Blush and Cream",
  "Berry, Plum and Cream",
  "Cranberry, Gold and Ivory",
  "Fuchsia, Purple and White",
  "Bubblegum, White and Silver",
  "Raspberry, Cream and Gold",
  "Candy Pink, White and Rose Gold",
  "Flamingo, White and Coral",

  // Purples
  "Lavender, Grey and White",
  "Plum, Gold and Cream",
  "Violet, Black and Silver",
  "Lilac, White and Silver",
  "Mauve, Rose and Cream",
  "Amethyst, Gold and White",
  "Grape, Cream and Gold",
  "Orchid, White and Silver",
  "Wisteria, Cream and Grey",
  "Eggplant, Camel and Cream",

  // Oranges & Yellows
  "Rust Orange, Olive and Tan",
  "Terracotta, Sand and White",
  "Mustard Yellow, Olive and Brown",
  "Burnt Orange, Brown and Cream",
  "Amber, Camel and White",
  "Saffron, White and Green",
  "Peach, Cream and Gold",
  "Apricot, White and Brown",
  "Tangerine, White and Gold",
  "Honey, Brown and Cream",
  "Goldenrod, Brown and White",
  "Lemon Yellow, White and Tan",
  "Marigold, Brown and Cream",
  "Ochre, Rust and Cream",
  "Turmeric, White and Brown",

  // Classics & Monochrome
  "Black, White and Red",
  "Black, White and Gold",
  "All Black with White Accents",
  "All White with Black Accents",
  "Grey, White and Black",
  "Charcoal, Burgundy and Camel",
  "Charcoal, Red and White",
  "Navy, White and Red",
  "Black, Camel and White",
  "Grey, Blush and White",

  // Seasonal — Summer
  "Coral, Turquoise and White",
  "Lemon, White and Sky Blue",
  "Hot Pink, Orange and White",
  "Aqua, White and Sand",
  "Lime Green, White and Yellow",
  "Melon, White and Mint",
  "Hibiscus Pink, Coral and White",
  "Tropical Orange, Green and White",
  "Sunshine Yellow, White and Blue",
  "Watermelon, Lime and White",

  // Seasonal — Winter
  "Burgundy, Forest Green and Gold",
  "Camel, Cream and Brown",
  "Charcoal, Scarlet and Cream",
  "Deep Navy, Silver and White",
  "Plum, Grey and Silver",
  "Ivory, Gold and Red",
  "Pine Green, Cranberry and Gold",
  "Midnight, Silver and White",
  "Chocolate, Cream and Red",
  "Slate, Burgundy and Cream",

  // Seasonal — Autumn/Fall
  "Rust, Mustard and Brown",
  "Terracotta, Olive and Tan",
  "Burgundy, Camel and Forest Green",
  "Burnt Sienna, Ochre and Brown",
  "Maple, Gold and Cream",
  "Pumpkin, Brown and Beige",
  "Chestnut, Rust and Cream",
  "Auburn, Gold and Olive",
  "Cinnamon, Tan and White",
  "Harvest Gold, Brown and Rust",

  // Seasonal — Spring
  "Lavender, Mint and White",
  "Blush Pink, Sage and Cream",
  "Dusty Rose, Mauve and Green",
  "Lilac, Yellow and White",
  "Peach, Mint and Cream",
  "Soft Yellow, Pink and White",
  "Baby Blue, Blush and White",
  "Mint, Coral and White",
  "Periwinkle, Blush and Cream",
  "Soft Violet, Green and White",

  // Occasion — Formal/Evening
  "Navy, Gold and Cream",
  "Black, Gold and White",
  "Emerald, Gold and Ivory",
  "Deep Purple, Silver and Black",
  "Midnight Blue, Silver and Cream",
  "Champagne, Gold and Ivory",
  "Ruby Red, Black and Gold",
  "Royal Blue, Gold and White",
  "Onyx, Rose Gold and Cream",
  "Sapphire, Silver and White",

  // Occasion — Casual/Everyday
  "Sage Green, Cream and Tan",
  "Dusty Rose, White and Denim",
  "Camel, White and Brown",
  "Olive, Cream and Rust",
  "Grey, White and Blush",
  "Denim, White and Camel",
  "Beige, Brown and White",
  "Soft Pink, Grey and White",
  "Cream, Tan and Brown",
  "Moss, Sand and Cream",

  // Global/Cultural
  "Ivory, Gold and Red",
  "Peacock Blue, Gold and White",
  "Magenta, Orange and Gold",
  "Coral, Teal and Gold",
  "Deep Purple, Gold and Cream",
  "Saffron, White and Green",
  "Crimson, Gold and Black",
  "Turquoise, Orange and Brown",
  "Jade, Red and Gold",
  "Cobalt, White and Terracotta",
];
const randomPalette = palettes[Math.floor(Math.random() * palettes.length)];

// Override palette based on topic keywords
const topicLower = topic.toLowerCase();
let selectedPalette = randomPalette;
if (topicLower.includes("summer") || topicLower.includes("beach") || topicLower.includes("vacation")) {
  selectedPalette = ["White and Turquoise", "Coral, White and Gold", "Lemon Yellow, White and Tan"][Math.floor(Math.random() * 3)];
} else if (topicLower.includes("winter") || topicLower.includes("christmas") || topicLower.includes("snow")) {
  selectedPalette = ["Burgundy, Forest Green and Gold", "Camel, Cream and Brown", "Charcoal, Red and White"][Math.floor(Math.random() * 3)];
} else if (topicLower.includes("spring") || topicLower.includes("floral") || topicLower.includes("garden")) {
  selectedPalette = ["Lavender, Mint and White", "Blush Pink, Sage and Cream", "Dusty Rose, Mauve and Green"][Math.floor(Math.random() * 3)];
} else if (topicLower.includes("autumn") || topicLower.includes("fall") || topicLower.includes("october")) {
  selectedPalette = ["Rust, Mustard and Brown", "Terracotta, Olive and Tan", "Burgundy, Camel and Forest Green"][Math.floor(Math.random() * 3)];
} else if (topicLower.includes("wedding") || topicLower.includes("formal") || topicLower.includes("gala")) {
  selectedPalette = ["Navy, Gold and Cream", "Black, Gold and White", "Emerald, Gold and Ivory"][Math.floor(Math.random() * 3)];
} else if (topicLower.includes("casual") || topicLower.includes("weekend") || topicLower.includes("brunch")) {
  selectedPalette = ["Sage Green, Cream and Tan", "Dusty Rose, White and Denim", "Camel, White and Brown"][Math.floor(Math.random() * 3)];
} else if (topicLower.includes("office") || topicLower.includes("work") || topicLower.includes("business")) {
  selectedPalette = ["Navy, Grey and White", "Charcoal, Burgundy and Cream", "Forest Green, Camel and White"][Math.floor(Math.random() * 3)];
}

const colorPrompt = isFashion ? `COLOR COORDINATION: Use ONLY this specific color palette: "${selectedPalette}". Every product MUST be in one of these colors. Include the exact color in every product name (e.g. "Camel Wool Blazer"). Add "color" field (one word) to each product. Add "palette" field showing "${selectedPalette}" to first product only. Do NOT use blue and white unless it is part of the specified palette.` : "";

    const fashionPrompt = isFashion ? `
You are a professional fashion stylist and personal shopper with expertise in current trends.

STYLING RULES:
- Create a COMPLETE, WEARABLE outfit that looks genuinely good together
- Follow current ${new Date().getFullYear()} fashion trends
- Think like a real stylist — consider silhouette, proportion, and balance
- Mix basics with statement pieces
- Consider the occasion: "${topic}"
- Target: ${gt}

OUTFIT STRUCTURE (include ALL of these):
1. Top (shirt/blouse/sweater/jacket)
2. Bottom (pants/skirt/shorts/jeans) OR Full piece (dress/jumpsuit)
3. Outerwear if appropriate (jacket/coat/blazer)
4. Footwear (shoes/boots/sneakers)
5. Bag (handbag/backpack/clutch)
6. 1-2 Accessories (watch/jewelry/belt/sunglasses/hat)

COLOR PALETTE TO USE: "${selectedPalette}"
- Every item MUST be in a color from this palette
- Colors should complement each other perfectly
- Include exact color in product name

FASHION TRENDS TO CONSIDER:
- Clean minimal aesthetics
- Elevated basics
- Tonal dressing
- Mix of textures (linen, cotton, leather, denim)
- Proportional dressing (loose top + fitted bottom OR fitted top + wide leg)
- Contemporary silhouettes

QUALITY GUIDELINES:
- Recommend well-known real brands available on Amazon
- Mix price points (some affordable, some investment pieces)
- Products must actually exist and be searchable
` : `You are a ${nicheObj.label} product expert for ${co.name} (${co.domain}).`;

const prodTxt = await callAI(
  `${fashionPrompt}

Topic: "${topic}"
Target audience: ${gt}
Currency: ${co.curr} (${co.code})
Amazon marketplace: ${co.domain}

${!isFashion ? `Rules:
- If topic says a number → give exactly that many products
- If it's a complete routine → give all steps needed
- If general product type → give 5 to 7 products` : ""}

Return ONLY a JSON array. Keep ALL values SHORT. Each object:
{
  "name": "${isFashion ? "Brand + Color + Product name (e.g. Levi's Black Slim Jeans)" : "Exact product name"}",
  "role": "${isFashion ? "Outfit role (e.g. Bottom, Footwear, Outerwear)" : "Brief role"}",
  ${isFashion ? '"color": "Exact color (one word)",' : ""}
  ${isFashion ? '"palette": "Full palette name, first product only, else empty string",' : ""}
  ${isFashion ? '"style_tip": "One sentence on how to style this piece in the outfit",' : ""}
  "price": "${co.curr}XX",
  "category": "${nicheObj.label}",
  "why": "One short sentence why this works"
}

Return ONLY the JSON array. No extra text.`, 2048
);

    // ── STEP 2: Parse products ──
    setStep(2);
    let rawProds;
    try {
      rawProds = parseJSON(prodTxt);
    } catch (e) {
      try {
        const cleaned = prodTxt
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
          .replace(/,\s*}/g, "}")
          .replace(/,\s*]/g, "]")
          .replace(/:\s*"[^"]*\n[^"]*"/g, ': ""')
          .replace(/\t/g, " ");
        rawProds = parseJSON(cleaned);
      } catch (e2) {
        throw new Error("Could not parse products. Please try again.");
      }
    }
    if (!Array.isArray(rawProds) || !rawProds.length) throw new Error("No products generated");

    const prods = rawProds.map((p, i) => {
      const searchTerms = (p.name || "").replace(/[^a-zA-Z0-9 ]/g, "").trim().split(/\s+/).join("+");
      return {
        step: i + 1,
        role: p.role || "",
        name: p.name || "",
        price: p.price || "",
        color: p.color || "",
        palette: i === 0 ? (p.palette || "") : "",
        category: p.category || nicheObj.label,
        why: p.why || "",
        amazon_search: p.name || "",
        affiliate_link: `https://www.${co.domain}/s?k=${searchTerms}&tag=${tag}`,
        image_prompt: `Product photography: ${p.name}, white background, studio lighting, sharp focus, 4K, commercial product shot`
      };
    });

    // Show products immediately
    setProducts(prods);
    setError("");
    setStep(3);

    // ── STEP 3: Wait then generate pin titles ──
    // Wait 5 seconds to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 5000));

    const productNames = prods.map(p => p.name).join(", ");

    let pinsArr = null;
    // Try pin titles up to 3 times
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const pinTxt = await callAI(
          `Generate 3 Pinterest pin titles for: "${topic}" (${nicheObj.label}).
Products: ${productNames}
Target: ${gt}, Country: ${co.name}

Return ONLY a JSON array of 3 objects:
[
  {
    "title": "Catchy title with 1-2 emojis (40-80 chars)",
    "description": "SEO description (100-150 chars)",
    "hashtags": ["tag1", "tag2", "tag3"],
    "board": "Board Name",
    "style_tag": "minimal",
    "top_products": [1, 2, 3]
  }
]
Return ONLY the JSON array.`, 1024
        );
        pinsArr = parseJSON(pinTxt);
        if (Array.isArray(pinsArr) && pinsArr.length) break;
      } catch (pinErr) {
        console.error(`Pin titles attempt ${attempt} failed:`, pinErr);
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 3000 * attempt));
        }
      }
    }

    if (pinsArr && pinsArr.length) {
      setPins(pinsArr);
    } else {
      // Products are ready but pin titles failed — don't crash
      setError("⚠️ Pin titles couldn't be generated but your products are ready! You can save and try generating pin titles later.");
    }

    setStep(4);

  } catch (e) {
    // Only show error if products weren't generated
    setError(e.message);
  } finally {
    setLoading(false);
  }
};

  const savePackage = async () => {
    setSaving(true);
    await onSave({ id: Date.now(), topic, country, gender, niche: nicheId, products, pins, date: new Date().toISOString() });
    setSaving(false);
  };

  const stepLabels = { 1: "Finding products...", 2: "Building links & prompts...", 3: "Generating pin titles...", 4: "Done!" };

  return (
    <div className="fade-up">
      <SectionTitle sub="Enter a topic to generate a complete pin package with products, links & prompts">Generate Pin Package</SectionTitle>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 10, color: T.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>Amazon Marketplace</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {COUNTRIES.map(c => {
            const has = tags?.[c.id]?.trim();
            const active = country === c.id;
            return (
              <button key={c.id} onClick={() => setCountry(c.id)}
                style={{ padding: "6px 11px", fontSize: 12, fontWeight: 700, fontFamily: T.font, background: active ? (has ? "#DCFCE7" : color + "15") : (has ? "#F0FDF4" : T.bg), border: `2px solid ${active ? (has ? T.success : color) : (has ? "#86EFAC" : T.border)}`, borderRadius: 8, cursor: "pointer", position: "relative", transition: "all 0.15s ease", color: active ? (has ? T.success : color) : T.text }}>
                {c.flag} {c.id}
                {has && <span style={{ position: "absolute", top: -3, right: -3, width: 8, height: 8, borderRadius: "50%", background: T.success, border: "2px solid #fff" }} />}
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: 12, color: T.textSoft }}>
          {co.flag} {co.domain} · {co.curr} · Tag: {tag ? <span style={{ color: T.success, fontWeight: 700 }}>{tag}</span> : <span style={{ color: T.danger, fontWeight: 700 }}>Not set!</span>}
        </div>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 10, color: T.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>Target Audience</div>
        <div style={{ display: "flex", gap: 8 }}>
          {[{ id: "women", l: "Women", i: "♀" }, { id: "men", l: "Men", i: "♂" }, { id: "unisex", l: "Unisex", i: "⚧" }].map(o => (
            <button key={o.id} onClick={() => setGender(o.id)} style={{ padding: "10px 22px", fontSize: 13, fontWeight: 700, fontFamily: T.font, background: gender === o.id ? color : T.bg, color: gender === o.id ? "#fff" : T.text, border: `1px solid ${gender === o.id ? color : T.border}`, borderRadius: 20, cursor: "pointer", transition: "all 0.15s ease" }}>{o.i} {o.l}</button>
          ))}
        </div>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 10, color: T.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>Topic</div>
        <input value={topic} onChange={e => setTopic(e.target.value)} placeholder={`e.g., "best moisturisers for dry skin" or "spring office outfit ideas"`}
          style={{ width: "100%", padding: "14px 18px", border: `2px solid ${T.border}`, borderRadius: T.radiusSm, fontSize: 15, fontFamily: T.font, transition: "border-color 0.2s ease" }}
          onFocus={e => { e.target.style.borderColor = color; }}
          onBlur={e => { e.target.style.borderColor = T.border; }}
          onKeyDown={e => { if (e.key === "Enter" && !loading) generate(); }} />
        <Btn onClick={generate} disabled={loading || !topic.trim()} color={color} full style={{ marginTop: 14, padding: "16px 0", fontSize: 16 }}>
          {loading ? "⏳ Generating..." : "⚡ Generate Complete Pin Package"}
        </Btn>
      </Card>
      {loading && step > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <ProgressSteps current={Math.min(step, 3)} total={3} label={stepLabels[step] || "Processing..."} color={color} />
          <LoadingSkeleton />
        </Card>
      )}
      {error && <div className="fade-in" style={{ padding: 16, background: T.dangerBg, border: "1px solid #FECACA", borderRadius: T.radiusSm, color: T.danger, fontSize: 13, fontWeight: 600, marginBottom: 16, lineHeight: 1.5 }}>⚠️ {error}</div>}
      {products?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionTitle sub={`${products.length} products with affiliate links & image prompts`}>🛍 Products</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{products.map((p, i) => <ProductCard key={i} product={p} color={color} index={i} />)}</div>
        </div>
      )}
      {pins?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionTitle sub={`${pins.length} pin titles ready to use`}>📌 Pin Titles</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{pins.map((p, i) => <PinTitleCard key={i} pin={p} color={color} index={i} products={products} />)}</div>
        </div>
      )}
      {products && pins && <div style={{ marginBottom: 16 }}><PinAnalyzer color={color} onSaveStyle={onAddStyle} /></div>}
      {products && pins && (
        <div style={{ marginBottom: 16 }}>
          <SectionTitle sub="Choose a layout and generate a complete pin image">🎨 Generate Complete Pin</SectionTitle>
          <PinImageGenerator products={products} pins={pins} nicheId={nicheId} color={color} savedStyles={savedStyles} onDelStyle={onDelStyle} />
        </div>
      )}
      {products && pins && (
        <div>
          <Btn onClick={savePackage} disabled={saving} color={T.success} full style={{ padding: "16px 0", fontSize: 16 }}>{saving ? "⏳ Saving..." : "💾 Save This Package"}</Btn>
        </div>
      )}
    </div>
  );
}

function PackagesTab({ packs, onDelete, nicheObj, nicheId, savedStyles, onDelStyle }) {
  const [viewId, setViewId] = useState(null);
  const color = nicheObj.color;

  if (viewId) {
    const pk = packs.find(p => p.id === viewId);
    if (!pk) { setViewId(null); return null; }
    const co = COUNTRIES.find(c => c.id === pk.country);
    return (
      <div className="fade-up">
        <Btn onClick={() => setViewId(null)} variant="ghost" color={T.textSoft} small style={{ marginBottom: 18 }}>← Back to all packages</Btn>
        <Card style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 19, fontFamily: T.font, marginBottom: 6 }}>{pk.topic}</div>
          <div style={{ fontSize: 13, color: T.textSoft }}>{co?.flag} {pk.country} · {pk.gender === "women" ? "♀" : pk.gender === "men" ? "♂" : "⚧"} · {pk.products?.length || 0} products · {pk.pins?.length || 0} pins · {new Date(pk.date).toLocaleDateString()}</div>
        </Card>
        {pk.products?.length > 0 && <div style={{ marginBottom: 16 }}><SectionTitle>🛍 Products</SectionTitle><div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{pk.products.map((p, i) => <ProductCard key={i} product={p} color={color} index={i} />)}</div></div>}
        {pk.pins?.length > 0 && <div style={{ marginBottom: 16 }}><SectionTitle>📌 Pin Titles</SectionTitle><div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{pk.pins.map((p, i) => <PinTitleCard key={i} pin={p} color={color} index={i} products={pk.products} />)}</div></div>}
        {pk.products && pk.pins && <PinImageGenerator products={pk.products} pins={pk.pins} nicheId={nicheId} color={color} savedStyles={savedStyles} onDelStyle={onDelStyle} />}
      </div>
    );
  }

  return (
    <div className="fade-up">
      <SectionTitle sub="Your saved pin packages with all products, links & prompts">Saved Packages ({packs.length})</SectionTitle>
      {packs.length > 0 && <div style={{ padding: 14, background: T.successBg, border: "1px solid #86EFAC", borderRadius: T.radiusSm, color: T.success, fontSize: 13, fontWeight: 700, marginBottom: 16 }}>✓ {packs.length} package{packs.length !== 1 ? "s" : ""} — all saved</div>}
      {packs.length === 0 ? (
        <EmptyState icon="📦" title="No packages yet" sub="Generate your first pin package from the Generate tab — it'll show up here for easy access later." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {packs.map(pk => {
            const co = COUNTRIES.find(c => c.id === pk.country);
            return (
              <Card key={pk.id} hover onClick={() => setViewId(pk.id)} className="pin-card-enter">
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📦</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, fontFamily: T.font, marginBottom: 4 }}>{pk.topic}</div>
                    <div style={{ fontSize: 12, color: T.textSoft }}>{co?.flag} {pk.country} · {pk.gender === "women" ? "♀" : pk.gender === "men" ? "♂" : "⚧"} · {pk.products?.length || 0} products · {new Date(pk.date).toLocaleDateString()}</div>
                  </div>
                  <Btn small variant="ghost" color={T.danger} onClick={e => { e.stopPropagation(); onDelete(pk.id); }}>Delete</Btn>
                  <span style={{ color: T.textMuted, fontSize: 18 }}>→</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MobileNav({ activeTab, onTabChange, nicheObj, packCount }) {
  const tabs = [{ id: "home", icon: "✦", label: "Home" }, { id: "generate", icon: "⚡", label: "Generate" }, { id: "packages", icon: "📦", label: "Saved" }, { id: "settings", icon: "⚙", label: "Settings" }];
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", borderTop: `1px solid ${T.border}`, padding: "6px 8px 10px", display: "flex", justifyContent: "space-around" }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onTabChange(t.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer", padding: "4px 8px", color: activeTab === t.id ? nicheObj.color : T.textMuted, position: "relative" }}>
          <span style={{ fontSize: 18 }}>{t.icon}</span>
          <span style={{ fontSize: 10, fontWeight: 700, fontFamily: T.font }}>{t.label}</span>
          {t.id === "packages" && packCount > 0 && <span style={{ position: "absolute", top: 0, right: 2, width: 14, height: 14, borderRadius: "50%", background: nicheObj.color, color: "#fff", fontSize: 8, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{packCount}</span>}
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("home");
  const [niche, setNiche] = useState("beauty");
  const [packs, setPacks] = useState([]);
  const [tags, setTags] = useState({});
  const [savedStyles, setSavedStyles] = useState([]);
  const [toast, setToast] = useState("");
  const [pendingTopic, setPendingTopic] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800);

  const nicheObj = NICHES.find(n => n.id === niche) || NICHES[0];
  const hasTag = Object.values(tags).some(t => t?.trim());

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 800);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  useEffect(() => {
    (async () => {
      const d = await loadAppData();
      if (d) {
        if (d.tags && typeof d.tags === "object") setTags(d.tags);
        if (Array.isArray(d.packs)) setPacks(d.packs);
        if (typeof d.niche === "string") setNiche(d.niche);
        if (Array.isArray(d.savedStyles)) setSavedStyles(d.savedStyles);
      }
      setLoaded(true);
    })();
  }, []);

  const saveTimer = useRef(null);
  const isFirstRender = useRef(true);
  const justSavedExplicitly = useRef(false);

  useEffect(() => {
    if (!loaded) return;
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const ok = await saveAppData({ tags, packs, niche, savedStyles });
      if (!justSavedExplicitly.current) { setToast(ok ? "✓ Saved" : "⚠️ Save failed"); setTimeout(() => setToast(""), 1500); }
      justSavedExplicitly.current = false;
    }, 1500);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [tags, packs, niche, savedStyles, loaded]);

  const addPack = async (p) => {
    const updated = [p, ...packs]; setPacks(updated);
    justSavedExplicitly.current = true;
    const ok = await saveAppData({ tags, packs: updated, niche, savedStyles });
    setToast(ok ? "✓ Package saved!" : "⚠️ Save failed");
    setTimeout(() => setToast(""), 2500);
  };

  const delPack = async (id) => {
    if (confirm("Delete this package?")) {
      const updated = packs.filter(p => p.id !== id); setPacks(updated);
      justSavedExplicitly.current = true;
      const ok = await saveAppData({ tags, packs: updated, niche, savedStyles });
      setToast(ok ? "Package deleted" : "⚠️ Delete failed");
      setTimeout(() => setToast(""), 2000);
    }
  };

  const addStyle = async (style) => {
    const updated = [...savedStyles, style]; setSavedStyles(updated);
    justSavedExplicitly.current = true;
    const ok = await saveAppData({ tags, packs, niche, savedStyles: updated });
    setToast(ok ? "✓ Pin style saved!" : "⚠️ Save failed");
    setTimeout(() => setToast(""), 2500);
  };

  const delStyle = async (index) => {
    const updated = savedStyles.filter((_, i) => i !== index); setSavedStyles(updated);
    await saveAppData({ tags, packs, niche, savedStyles: updated });
  };

  if (!loaded) {
    return (
      <div style={{ fontFamily: T.font, display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: T.bg }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, margin: "0 auto 18px", background: `linear-gradient(135deg, ${nicheObj.color}, ${nicheObj.color}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "#fff", animation: "pulse 1.5s ease infinite" }}>✦</div>
          <div style={{ fontWeight: 800, fontSize: 18, fontFamily: T.font }}>Loading PinFlow Studio...</div>
          <div style={{ fontSize: 13, color: T.textSoft, marginTop: 6 }}>Restoring your saved data</div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (tab) {
      case "home": return <HomeTab nicheObj={nicheObj} onTabChange={setTab} packCount={packs.length} hasTag={hasTag} />;
      case "settings": return <SettingsTab tags={tags} setTags={setTags} color={nicheObj.color} />;
      case "generate": return <GenerateTab nicheId={niche} nicheObj={nicheObj} tags={tags} onSave={addPack} savedStyles={savedStyles} onAddStyle={addStyle} onDelStyle={delStyle} pendingTopic={pendingTopic} onClearPending={() => setPendingTopic("")} />;
      case "packages": return <PackagesTab packs={packs} onDelete={delPack} nicheObj={nicheObj} nicheId={niche} savedStyles={savedStyles} onDelStyle={delStyle} />;
      default: return <HomeTab nicheObj={nicheObj} onTabChange={setTab} packCount={packs.length} hasTag={hasTag} />;
    }
  };

  return (
    <div style={{ fontFamily: T.font, color: T.text, minHeight: "100vh", background: T.bg }}>
      {!isMobile && <Sidebar activeTab={tab} onTabChange={setTab} niche={niche} onNicheChange={setNiche} nicheObj={nicheObj} packCount={packs.length} />}
      {isMobile && (
        <div style={{ position: "sticky", top: 0, zIndex: 100, padding: "12px 16px", background: "rgba(246,244,240,0.92)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg, ${nicheObj.color}, ${nicheObj.color}aa)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#fff", fontWeight: 800 }}>✦</div>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 18, flex: 1 }}>PinFlow</div>
          <select value={niche} onChange={e => setNiche(e.target.value)} style={{ padding: "6px 10px", borderRadius: T.radiusXs, border: `1px solid ${T.border}`, fontFamily: T.font, fontSize: 12, fontWeight: 700, background: "#fff", color: nicheObj.color }}>
            {NICHES.map(n => <option key={n.id} value={n.id}>{n.emoji} {n.label}</option>)}
          </select>
        </div>
      )}
      <div style={{ marginLeft: isMobile ? 0 : 240, padding: isMobile ? "16px 16px 90px" : "32px 40px", maxWidth: 780 }}>
        {renderContent()}
      </div>
      {isMobile && <MobileNav activeTab={tab} onTabChange={setTab} nicheObj={nicheObj} packCount={packs.length} />}
      <Toast message={toast} />
    </div>
  );
}