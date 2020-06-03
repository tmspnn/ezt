import { Subscription, UnaryFunction } from "rxjs";

export as namespace ezt;

export = EZT;

declare function EZT(options: string | EZT.ComponentOptions): EZT.Component;

declare namespace EZT {
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
    children?: (data: {
      [k: string]: any;
    }) => { [k: string]: LazyComponent } | Array<LazyComponent>;
    init?: (
      data: { [k: string]: any },
      el: HTMLElement,
      refs: { [k: string]: HTMLElement }
    ) => void;
  }

  export interface TemplateOptions {
    escape?: RegExp;
    evaluate?: RegExp;
    imports?: { [k: string]: any };
    interpolate?: RegExp;
    sourceURL?: string;
    variable?: string;
  }

  export function createComponent(options: string | ComponentOptions): Component;

  export interface Action {
    category: "I" | "O";
    type: string;
    args: any;
  }

  export class Controller {
    _subscriptions: Array<Subscription>;

    bind(): void;

    unbind(): void;

    dispatch(name: string, args: any): Controller;

    respond(name: string, args: any): Controller;

    _on(
      actionName: string,
      pipes: () => void | UnaryFunction<any, any> | UnaryFunction<any, any>[],
      handler?: () => void
    ): Controller;
  }

  export function dispatch(type: string, args: any): void;

  export function respondTo(
    reaction: string,
    pipes: () => void | UnaryFunction<any, any> | UnaryFunction<any, any>[],
    handler?: () => void
  ): Subscription;
}
