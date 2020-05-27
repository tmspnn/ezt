export default interface Action {
  category: "I" | "O";
  type: string;
  args: any;
}
