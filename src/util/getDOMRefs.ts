export default function getDOMRefs(element: HTMLElement) {
  const refs: { [k: string]: HTMLElement } = {};
  for (let i = 0, len = element.children.length; i < len; i++) {
    walkThrough(element.children[i] as HTMLElement, refs);
  }
  return refs;
}

function walkThrough(element: HTMLElement, refs: { [k: string]: HTMLElement }) {
  const { eztid, ref } = element.dataset;
  if (eztid) return;
  if (ref) refs[ref] = element;
  for (let i = 0, len = element.children.length; i < len; i++) {
    walkThrough(element.children[i] as HTMLElement, refs);
  }
}
