import { resetComponentId } from "./componentId";
import { Component, ComponentOptions } from "../../types/Component";
import createTemplate from "../util/createTemplate";
import declareChildren from "./declareChildren";
import getDOMRefs from "../util/getDOMRefs";
import html2DOM from "../util/html2DOM";
import initChildren from "./initChildren";

export default function createComponent(options: string | ComponentOptions): Component {
  const componentOptions: ComponentOptions =
    typeof options == "string" ? { template: options } : options;
  const { template, templateOptions, children, init } = componentOptions;
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
