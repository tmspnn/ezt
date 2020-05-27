import { Subscription, UnaryFunction } from "rxjs";
import { dispatchAction, dispatchReaction, filterAction } from "./interactions";

export default class Controller {
  _subscriptions: Array<Subscription> = [];

  bind() {
    const proto = this.constructor.prototype;
    Object.getOwnPropertyNames(proto).forEach(m => {
      if (typeof m != "function" || m == "constructor") return;
      if (!proto[m].pipes) return this._on(m, proto[m].bind(this));
      if (typeof proto[m].pipes == "function" || Array.isArray(proto[m].pipes)) {
        return this._on(m, proto[m].pipes, proto[m].bind(this));
      }
      throw new TypeError(`TypeError: ${m}.pipes should be a function or an array.`);
    });
  }

  unbind() {
    this._subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
    this._subscriptions.length = 0;
  }

  dispatch(name: string, args: any) {
    dispatchAction(name, args);
    return this;
  }

  respond(name: string, args: any) {
    dispatchReaction(name, args);
    return this;
  }

  _on(
    actionName: string,
    pipes: () => void | UnaryFunction<any, any> | UnaryFunction<any, any>[],
    handler?: () => void
  ) {
    const observable = filterAction(actionName);
    const subscribable = !handler
      ? observable
      : Array.isArray(pipes)
      ? (observable as any).pipe(pipes as UnaryFunction<any, any>[])
      : observable.pipe(pipes as UnaryFunction<any, any>);
    const subscription = subscribable.subscibe(handler || pipes, (e: any) => {
      console.error(`Error in ${actionName}: ${e}`);
    });
    this._subscriptions.push(subscription);
    return this;
  }
}
