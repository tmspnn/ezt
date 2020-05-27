import { resetComponentId } from "./componentId";
import Component from "../../types/Component";
import LazyComponent from "../../types/LazyComponent";
import TemplateOptions from "../../types/TemplateOptions";
import createTemplate from "../util/createTemplate";
import declareChildren from "./declareChildren";
import getDOMRefs from "../util/getDOMRefs";
import html2DOM from "../util/html2DOM";
import initChildren from "./initChildren";

export default function createComponent(options: {
  template: string;
  templateOptions?: TemplateOptions;
  children?: (data: { [k: string]: any }) => { [k: string]: LazyComponent } | Array<LazyComponent>;
  init?: (data: { [k: string]: any }, el: HTMLElement, refs: { [k: string]: HTMLElement }) => void;
}): Component {
  const { template, templateOptions, children, init } = options;
  const T = createTemplate(template, templateOptions);

  return function (data: { [k: string]: any }, element?: null | HTMLElement) {
    /* If root component */
    if (!data.eztid) data.eztid = resetComponentId();

    if (children) declareChildren(data, children(data));

    /* Used as template in server side */
    if (typeof element == "undefined") return T(data);

    /* Used as constructor in browser */
    if (element == null) element = html2DOM(T(data));

    if (children) initChildren(data, element!);

    if (init) init(data, element!, getDOMRefs(element!));

    setTimeout(() => element!.removeAttribute("data-eztid"));

    return element!;
  };
}
