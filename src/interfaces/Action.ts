export default interface Action {
  _category: string;
  _type: string;
  [k: string]: any;
}
