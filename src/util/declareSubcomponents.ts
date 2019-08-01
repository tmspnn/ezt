import SubcomponentDeclaration from "../interfaces/SubcomponentDeclaration";

export default function declareSubcomponents(
  data: { [k: string]: any },
  subcomponents: { [k: string]: SubcomponentDeclaration } | Array<SubcomponentDeclaration>
) {
  if (Array.isArray(subcomponents)) subcomponents = { ...subcomponents };
  data._$ = subcomponents;
  data.$ = {};
  for (let k in subcomponents) {
    if (subcomponents.hasOwnProperty(k)) {
      const sc = (subcomponents as { [k: string]: SubcomponentDeclaration })[k];
      data.$[k] = sc.fn(sc.data);
    }
  }
}
