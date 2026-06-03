/* ============================================================
   Icon component — renders Lucide icons from the UMD global.
   Falls back gracefully if an icon name isn't found.
   ============================================================ */
const _iconCache = {};

function getIconNode(name) {
  if (_iconCache[name] !== undefined) return _iconCache[name];
  const L = window.lucide;
  let node = null;
  if (L) {
    // lucide UMD exposes named icons (PascalCase) and an `icons` map
    node = (L.icons && (L.icons[name] || L.icons[toKebab(name)])) || L[name] || null;
  }
  _iconCache[name] = node;
  return node;
}

function toKebab(s) {
  return s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/\s+/g, "-").toLowerCase();
}

function Icon({ name, size = 18, strokeWidth = 2, className = "", style = {}, ...rest }) {
  const node = getIconNode(name);
  if (!node) {
    // fallback: empty box so layout doesn't break
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style} {...rest} />
    );
  }
  // node is [tag, attrs, childrenArray] — children live at index [2]
  let children = Array.isArray(node) ? node[2] : (node.children || []);
  if (!Array.isArray(children)) children = [];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      className={className} style={{ flex: "none", display: "block", ...style }}
      {...rest}
    >
      {children.map((child, i) => {
        if (!Array.isArray(child)) return null;
        const [tag, attrs] = child;
        return React.createElement(tag, { key: i, ...(attrs || {}) });
      })}
    </svg>
  );
}

window.Icon = Icon;
