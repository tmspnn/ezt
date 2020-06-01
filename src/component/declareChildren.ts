import { LazyComponent } from "../../types/Component";
import { getComponentId } from "./componentId";

export default function declareChildren(
  data: { [k: string]: any },
  children: { [k: string]: LazyComponent } | Array<LazyComponent>
) {
  if (data.$) return;
  if (Array.isArray(children)) children = { ...children };
  data._$ = children;
  data.$ = {};
  for (let k in children) {
    if (children.hasOwnProperty(k)) {
      const sc = (children as { [k: string]: LazyComponent })[k];
      sc.data.eztid = getComponentId();
      data.$[k] = sc.fn(sc.data);
    }
  }
}
