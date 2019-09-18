export default interface Action {
  _category: "I" | "O";
  _type: string;
  [k: string]: any;
}
