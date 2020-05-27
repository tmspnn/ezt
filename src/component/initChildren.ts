export default function initChildren(data: { [k: string]: any }, element: HTMLElement) {
  for (let k in data._$) {
    if (data._$.hasOwnProperty(k)) {
      const sc = data._$[k];
      const el = element.querySelector(`[data-eztid="${sc.data.eztid}"]`);
      if (!el) throw new Error(`Missing child ${k}, context: ${JSON.stringify(data)}`);
      sc.fn(sc.data, el);
    }
  }
}
