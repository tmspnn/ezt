import TemplateOptions from "./TemplateOptions";

export interface Component {
  (data: { [k: string]: any }, element?: null | HTMLElement): string | HTMLElement;
}

export interface LazyComponent {
  data: { [k: string]: any };
  fn: Component;
}

export interface ComponentOptions {
  template: string;
  templateOptions?: TemplateOptions;
  children?: (data: { [k: string]: any }) => { [k: string]: LazyComponent } | Array<LazyComponent>;
  init?: (data: { [k: string]: any }, el: HTMLElement, refs: { [k: string]: HTMLElement }) => void;
}

export default Component;
