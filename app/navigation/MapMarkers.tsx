import L from "leaflet";

// --- 1. CSS ANIMATIONS ---
export const markerAnimationsStyles = `
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes pulse-gold {
    0% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7); transform: scale(1); opacity: 1;}
    70% { box-shadow: 0 0 0 20px rgba(255, 215, 0, 0); transform: scale(0.9); opacity: 0.8;}
    100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0); transform: scale(1); opacity: 1;}
  }
`;

// --- 2. HELPER FUNCTIONS (Màu sắc & SVG) ---
function adjustColorBrightness(hex: string, percent: number) {
  const num = parseInt(hex.replace("#", ""), 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    G = ((num >> 8) & 0x00ff) + amt,
    B = (num & 0x0000ff) + amt;
  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

const createFantasyMarkerSvg = (color: string) => {
  const gradientId = `grad-${color.replace("#", "")}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;
  const shadowId = `shadow-${Math.random().toString(36).substr(2, 9)}`;

  return `
    <svg width="60" height="80" viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="${shadowId}" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="rgba(0,0,0,0.4)"/>
        </filter>
        <radialGradient id="${gradientId}" cx="50%" cy="50%" r="50%" fx="25%" fy="25%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/>
          <stop offset="30%" stop-color="${color}"/>
          <stop offset="100%" stop-color="${adjustColorBrightness(color, -40)}"/>
        </radialGradient>
      </defs>
      
      <g filter="url(#${shadowId})">
        <path d="M30 2C16.745 2 6 12.745 6 26C6 42 30 74 30 74C30 74 54 42 54 26C54 12.745 43.255 2 30 2Z" 
              fill="url(#${gradientId})" 
              stroke="#ffffff" 
              stroke-width="3" 
              stroke-linejoin="round"/>
        <circle cx="30" cy="26" r="14" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.6"/>
        <circle cx="30" cy="26" r="6" fill="#ffffff"/>
      </g>
    </svg>
  `;
};

// --- 3. ICON CREATION ---
const createMarkerIcon = (color: string) => {
  const svg = createFantasyMarkerSvg(color);
  return new L.Icon({
    iconUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    iconSize: [60, 80],
    iconAnchor: [30, 80],
    popupAnchor: [0, -70],
  });
};

// --- 4. EXPORTED ICONS ---

// User Location Icon (Giữ nguyên như yêu cầu)
export const userLocationIcon = L.divIcon({
  className: "custom-user-marker",
  html: `
    <div style="position: relative; width: 50px; height: 50px;">
      <div style="
        position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 50px; height: 50px;
        background: rgba(59, 130, 246, 0.3);
        border: 2px solid rgba(59, 130, 246, 0.5);
        border-radius: 50%;
        animation: pulse 2s ease-in-out infinite;
      "></div>
      <div style="
        position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 16px; height: 16px;
        background: #3B82F6;
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 0 10px #3B82F6;
      "></div>
    </div>
  `,
  iconSize: [50, 50],
  iconAnchor: [25, 25],
});

// Highlight/Right-Click Marker (Simple green marker)
export const highlightMarkerIcon = L.divIcon({
  className: "custom-highlight-marker",
  html: `
    <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
      <div style="
        position: absolute;
        width: 14px; height: 14px;
        background: #10b981;
        border: 2px solid #047857;
        border-radius: 50%;
        box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
        z-index: 2;
      "></div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// --- 5. CACHING LOGIC ---
const markerCache = new Map<string, L.Icon>();

export const getCachedCustomMarker = (color: string = "#3b82f6") => {
  if (markerCache.has(color)) {
    return markerCache.get(color)!;
  }
  const icon = createMarkerIcon(color);
  markerCache.set(color, icon);
  return icon;
};

// --- 6. DEFAULT MARKER SETUP ---
export const initDefaultMarker = () => {
  // Hàm này nên được gọi trong useEffect của component
  const DefaultIcon = createMarkerIcon("#3B82F6");
  L.Marker.prototype.options.icon = DefaultIcon;
};