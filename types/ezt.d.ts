import { Observable } from "rxjs";

export as namespace ezt;

export = EZT;

declare function EZT(options: {
  template: string;
  templateOptions?: EZT.TemplateOptions;
  subcomponents?: (data: {
    [k: string]: any;
  }) => { [k: string]: EZT.SubcomponentDeclaration } | Array<EZT.SubcomponentDeclaration>;
  init?: (data: { [k: string]: any }, el: HTMLElement) => void;
}): EZT.Component;

declare namespace EZT {
  export interface Component {
    (data: { [k: string]: any }, element?: null | HTMLElement): string | HTMLElement;
  }

  export interface SubcomponentDeclaration {
    data: { [k: string]: any };
    fn: Component;
  }

  export interface Action {
    _category: "I" | "O";
    _type: string;
    [k: string]: any;
  }

  export interface TemplateOptions {
    escape?: RegExp;
    evaluate?: RegExp;
    imports?: { [k: string]: any };
    interpolate?: RegExp;
    sourceURL?: string;
    variable?: string;
  }

  export function createComponent(options: {
    template: string;
    templateOptions?: TemplateOptions;
    subcomponents?: (data: {
      [k: string]: any;
    }) => { [k: string]: SubcomponentDeclaration } | Array<SubcomponentDeclaration>;
    init?: (data: { [k: string]: any }, el: HTMLElement) => void;
  }): Component;

  export function dispatchAction(type: string, params?: { [k: string]: any }): void;

  export function filterAction(type: string): Observable<Action>;

  export function dispatchReaction(type: string, params?: { [k: string]: any }): void;

  export function filterReaction(type: string): Observable<Action>;

  export function getDOMRefs(element: HTMLElement): { [k: string]: HTMLElement };
}
