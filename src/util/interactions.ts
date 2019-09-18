import { Subject } from "rxjs";
import { filter } from "rxjs/operators";
import Action from "../interfaces/Action";

const s$ = new Subject<Action>();

function dispatchInteraction(
  _category: "I" | "O",
  _type: string,
  params: { [k: string]: any } = {}
) {
  s$.next({
    ...params,
    _category,
    _type
  });
}

function filterInteraction(_category: string, _type: string) {
  return s$.pipe(filter(a => a._category == _category && a._type == _type));
}

export function dispatchAction(type: string, params?: { [k: string]: any }) {
  dispatchInteraction("I", type, params);
}

export function filterAction(type: string) {
  return filterInteraction("I", type);
}

export function dispatchReaction(type: string, params?: { [k: string]: any }) {
  dispatchInteraction("O", type, params);
}

export function filterReaction(type: string) {
  return filterInteraction("O", type);
}
