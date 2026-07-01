function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function buildFallbackCover(title, category) {
  const seed = `${title || "Book"}-${category || "Library"}`;
  const tones = [
    ["#1f3c88", "#5a55ff"],
    ["#7b2ff7", "#f357a8"],
    ["#0f9b8e", "#36d1dc"],
    ["#c06c84", "#6c5b7b"],
    ["#ff7e5f", "#feb47b"],
    ["#232526", "#414345"],
  ];
  const [from, to] = tones[hashString(seed) % tones.length];
  const safeTitle = escapeXml(title || "Untitled Book");
  const safeCategory = escapeXml(category || "Library");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1200" role="img" aria-label="${safeTitle}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${from}" />
          <stop offset="100%" stop-color="${to}" />
        </linearGradient>
        <radialGradient id="glow" cx="30%" cy="18%" r="80%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.26" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="900" height="1200" rx="56" fill="url(#bg)" />
      <circle cx="720" cy="150" r="220" fill="url(#glow)" />
      <circle cx="160" cy="1020" r="240" fill="#ffffff" fill-opacity="0.08" />
      <rect x="58" y="58" width="784" height="1084" rx="44" fill="rgba(0,0,0,0.18)" stroke="rgba(255,255,255,0.16)" />
      <text x="90" y="132" fill="rgba(255,255,255,0.86)" font-family="Arial, sans-serif" font-size="34" font-weight="700">${safeCategory}</text>
      <text x="90" y="280" fill="#ffffff" font-family="Georgia, serif" font-size="76" font-weight="700">
        <tspan x="90" dy="0">${safeTitle.slice(0, 22)}</tspan>
        <tspan x="90" dy="92">${safeTitle.slice(22, 44)}</tspan>
      </text>
      <text x="90" y="1070" fill="rgba(255,255,255,0.88)" font-family="Arial, sans-serif" font-size="32">Premium digital edition</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function getBookImageSrc(bookImage, uploadsBase, title, category) {
  if (bookImage) {
    if (/^https?:\/\//i.test(bookImage)) {
      return bookImage;
    }

    if (bookImage.startsWith("/")) {
      return bookImage;
    }

    return `${uploadsBase}/${bookImage}`;
  }

  return buildFallbackCover(title, category);
}
