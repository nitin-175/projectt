export function resolveMediaUrl(path: string | null | undefined) {
  if (!path || path.trim() === "") {
    return "";
  }

  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  
  if (path.startsWith("www.")) {
    return `https://${path}`;
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `https://projectt-1-g2ww.onrender.com ${normalized}`;
}
