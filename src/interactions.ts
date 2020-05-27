import { Subject } from "rxjs";
import { filter, pluck } from "rxjs/operators";
import Action from "../types/Action";

const s$ = new Subject<Action>();

function dispatchInteraction(category: "I" | "O", type: string, args: any) {
  s$.next({ category, type, args });
}

function filterInteraction(category: "I" | "O", type: string) {
  return s$.pipe(
    filter(a => a.category == category && a.type == type),
    pluck("args")
  );
}

export function dispatchAction(type: string, args: any) {
  dispatchInteraction("I", type, args);
}

export function filterAction(type: string) {
  return filterInteraction("I", type);
}

export function dispatchReaction(type: string, args: any) {
  dispatchInteraction("O", type, args);
}

export function filterReaction(type: string) {
  return filterInteraction("O", type);
}
