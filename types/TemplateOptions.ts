export default interface TemplateOptions {
  escape?: RegExp;
  evaluate?: RegExp;
  imports?: { [k: string]: any };
  interpolate?: RegExp;
  sourceURL?: string;
  variable?: string;
}
