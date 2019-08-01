const ezt = require("../dist/ezt").default;
const {
  createComponent,
  getDOMRefs,
  triggerAction,
  filterAction,
  triggerReaction,
  filterReaction
} = require("../dist/ezt");

test("module props", () => {
  expect(typeof createComponent).toBe("function");
  expect(ezt).toEqual(createComponent);
  expect(typeof getDOMRefs).toBe("function");
  expect(typeof triggerAction).toBe("function");
  expect(typeof filterAction).toBe("function");
  expect(typeof triggerReaction).toBe("function");
  expect(typeof filterReaction).toBe("function");
});

test("createComponent", () => {
  const parser = new DOMParser();
  const data = { name: "EZT" };
  let c = null;

  const testComponent = ezt({
    template: '<div class="test">Hello <%= name %>!</div>',
    init(_data, element) {
      element.addEventListener("click", () => {
        element.textContent = "clicked!";
      });
    }
  });

  // Used as template
  c = testComponent(data);
  expect(typeof c).toBe("string");

  // Used to create DOM element
  c = testComponent(data, null);
  expect(c instanceof HTMLElement).toBeTruthy();
  expect(c.textContent).toBe("Hello EZT!");

  // Connect to existing element
  const div = html2DOM('<div class="test">Hello EZT!</div>');
  document.body.appendChild(div);
  testComponent(data, div);
  div.dispatchEvent(new MouseEvent("click"));
  expect(div.textContent).toBe("clicked!");

  function html2DOM(html) {
    const doc = parser.parseFromString(html, "text/html");
    return doc.body.firstChild;
  }
});

test("interactions", () => {
  filterAction("componentClickedTimes").subscribe(params => {
    triggerReaction("onComponentClickedTimes", params);
  });

  const testComponent = ezt({
    template: `<div class="test"><span data-ref="span">Hello EZT!</span></div>`,
    init(_data, element) {
      const refs = getDOMRefs(element);
      let times = 0;

      element.addEventListener("click", () => {
        triggerAction("componentClickedTimes", { times: ++times });
      });

      filterReaction("onComponentClickedTimes").subscribe(params => {
        refs.span.textContent = `clicked ${params.times} times`;
      });
    }
  });

  const el = testComponent({}, null);
  document.body.appendChild(el);
  el.dispatchEvent(new MouseEvent("click"));
  expect(el.children[0].textContent).toBe("clicked 1 times");
  el.dispatchEvent(new MouseEvent("click"));
  expect(el.children[0].textContent).toBe("clicked 2 times");
});
