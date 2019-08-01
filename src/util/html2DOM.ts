import isBrowser from "./isBrowser";

const parser = isBrowser ? new DOMParser() : null;

export default function html2DOM(html: string): null | HTMLElement {
  if (!parser) return null;
  const doc = parser.parseFromString(html, "text/html");
  return doc.body.firstChild as HTMLElement;
}
