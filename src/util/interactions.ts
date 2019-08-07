import { Observable, Subject } from "rxjs";
import { filter } from "rxjs/operators";
import Action from "../interfaces/Action";

const actionSubject$ = new Subject<Action>();

function dispatchInteraction(category: string, type: string, params: { [k: string]: any } = {}) {
  actionSubject$.next({
    ...params,
    _category: category,
    _type: type
  });
}

function filterInteraction(category: string, type: string) {
  return actionSubject$.pipe(filter(a => a._category == category && a._type == type));
}

export function dispatchAction(type: string, params?: { [k: string]: any }) {
  dispatchInteraction("action", type, params);
}

export function filterAction(type: string): Observable<Action> {
  return filterInteraction("action", type);
}

export function dispatchReaction(type: string, params?: { [k: string]: any }) {
  dispatchInteraction("reaction", type, params);
}

export function filterReaction(type: string): Observable<Action> {
  return filterInteraction("reaction", type);
}
