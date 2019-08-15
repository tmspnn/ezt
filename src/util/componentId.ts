let id = 0;

export function getComponentId() {
  return ++id;
}

export function resetComponentId() {
  return (id = 0);
}
