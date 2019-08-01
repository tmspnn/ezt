export default interface Component {
  (data: { [k: string]: any }, element?: null | HTMLElement): string | HTMLElement;
}
