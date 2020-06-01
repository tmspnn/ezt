import _template from "lodash/template";
import TemplateOptions from "../../types/TemplateOptions";

export default function createTemplate(t: string, options?: TemplateOptions) {
  return _template(t.replace(/(<[\w-_]+\b[^><]*)>/i, "$1 data-eztid=<%= eztid %>>"), options);
}
