import Component from "./Component";

export default interface SubcomponentDeclaration {
  data: { [k: string]: any };
  fn: Component;
}
