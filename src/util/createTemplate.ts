import _template from "lodash/template";
import TemplateOptions from "../interfaces/TemplateOptions";

export default function createTemplate(t: string, options?: TemplateOptions) {
  const strGroup = t.match(/(<[\w-_]+)\s?(.*)/);
  if (!strGroup) throw new Error("Invalid template: " + t);
  const s1 = strGroup[1];
  const s2 = strGroup[2];
  if (!s1 || !s2) throw new Error("Invalid template: " + t);
  return _template(s1 + ' data-eztid="<%= eztid %>" ' + s2, options);
}
