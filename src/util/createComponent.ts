import _template from "lodash/template";
import uniqid from "uniqid";
import Component from "../interfaces/Component";
import SubcomponentDeclaration from "../interfaces/SubcomponentDeclaration";
import createTemplate from "./createTemplate";
import declareSubcomponents from "./declareSubcomponents";
import initSubcomponents from "./initSubcomponents";
import html2DOM from "./html2DOM";

export default function createComponent(options: {
  template: string;
  subcomponents?: (data: {
    [k: string]: any;
  }) => { [k: string]: SubcomponentDeclaration } | Array<SubcomponentDeclaration>;
  init?: (data: { [k: string]: any }, el: HTMLElement) => void;
}): Component {
  const { template, subcomponents } = options;
  const _t = createTemplate(template);

  return function(data: { [k: string]: any }, element?: null | HTMLElement) {
    if (!data.eztid) {
      data.eztid = uniqid();
      if (options.subcomponents) {
        declareSubcomponents(data, subcomponents!(data));
      }
    }

    // Used as template on server side
    if (typeof element == "undefined") return _t(data);

    // Used as constructor in browser
    if (element == null) element = html2DOM(_t(data));

    // Initiate subcomponents
    if (options.subcomponents) initSubcomponents(data, element!);

    if (options.init) options.init(data, element!);

    return element!;
  };
}
