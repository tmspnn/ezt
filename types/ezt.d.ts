import { Observable } from "rxjs";
import Component from "../src/interfaces/Component";
import SubcomponentDeclaration from "../src/interfaces/SubcomponentDeclaration";

declare function ezt(options: {
  template: string;
  subcomponents?: (data: {
    [k: string]: any;
  }) => { [k: string]: SubcomponentDeclaration } | Array<SubcomponentDeclaration>;
  init?: (data: { [k: string]: any }, el: HTMLElement) => void;
}): Component;

declare namespace ezt {
  interface Component {
    (data: { [k: string]: any }, element?: null | HTMLElement): string | HTMLElement;
  }

  interface SubcomponentDeclaration {
    data: { [k: string]: any };
    fn: Component;
  }

  interface Action {
    _category: string;
    _type: string;
    [k: string]: any;
  }

  function createComponent(options: {
    template: string;
    subcomponents?: (data: {
      [k: string]: any;
    }) => { [k: string]: SubcomponentDeclaration } | Array<SubcomponentDeclaration>;
    init?: (data: { [k: string]: any }, el: HTMLElement) => void;
  }): Component;

  function triggerAction(type: string, params?: { [k: string]: any }): void;

  function filterAction(type: string): Observable<Action>;

  function triggerReaction(type: string, params?: { [k: string]: any }): void;

  function filterReaction(type: string): Observable<Action>;
}
