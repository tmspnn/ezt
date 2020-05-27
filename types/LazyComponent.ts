import Component from "./Component";

export default interface LazyComponent {
  data: { [k: string]: any };
  fn: Component;
}
