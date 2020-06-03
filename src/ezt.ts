import { Subscription, UnaryFunction } from "rxjs";
import { filterReaction } from "./interactions";
import createComponent from "./component/createComponent";

export { default as Controller } from "./Controller";
export { default as createComponent } from "./component/createComponent";
export { dispatchAction as dispatch } from "./interactions";

export default createComponent;

export function respondTo(
  reaction: string,
  pipes: () => void | UnaryFunction<any, any> | UnaryFunction<any, any>[],
  handler?: () => void
): Subscription {
  const observable = filterReaction(reaction);
  const subscribable = !handler
    ? observable
    : Array.isArray(pipes)
    ? (observable as any).pipe(...(pipes as UnaryFunction<any, any>[]))
    : observable.pipe(pipes as UnaryFunction<any, any>);
  return subscribable.subscribe(handler || pipes, (e: any) => {
    console.error(`Error in ${reaction}: ${e}`);
  });
}
