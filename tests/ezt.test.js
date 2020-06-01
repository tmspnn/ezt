const ezt = require("../dist/ezt").default;
const { createComponent, Controller, dispatch, respondTo } = require("../dist/ezt");

test("Module", () => {
  expect(typeof ezt).toBe("function");
  expect(createComponent).toEqual(ezt);
});

test("createComponent: used as template engine in server side", () => {
  const data = [{ todo: "Make breakfast." }, { todo: "Read a book." }, { todo: "Walk my dog." }];
  const itemComponent = ezt("<li><%= todo %></li>");
  const listComponent = ezt({
    template: `
      <div>
        <h1>Todos: </h1>
        <ol>
          <% for (var i in $) { %>
            <%= $[i] %>
          <% } %>
        </ol>
      </div>`,
    children: data => {
      return data.map(item => {
        return {
          data: item,
          fn: itemComponent
        };
      });
    }
  });
  expect(listComponent(data).replace(/\s{2,}/g, " ")).toEqual(
    `
  <div data-eztid=0>
    <h1>Todos: </h1>
    <ol>
      <li data-eztid=1>Make breakfast.</li>
      <li data-eztid=2>Read a book.</li>
      <li data-eztid=3>Walk my dog.</li>
    </ol>
  </div>`.replace(/\s{2,}/g, " ")
  );
});

// test("createComponent", () => {
//   expect(typeof createComponent).toBe("function");
//   expect(ezt).toEqual(createComponent);
//   expect(typeof getDOMRefs).toBe("function");
//   expect(typeof dispatchAction).toBe("function");
//   expect(typeof filterAction).toBe("function");
//   expect(typeof dispatchReaction).toBe("function");
//   expect(typeof filterReaction).toBe("function");
// });

// test("createComponent", () => {
//   const parser = new DOMParser();
//   const data = { name: "EZT" };
//   let c = null;

//   const testComponent = ezt({
//     template: '<div class="test">Hello <%= name %>!</div>',
//     init(_data, element) {
//       element.addEventListener("click", () => {
//         element.textContent = "clicked!";
//       });
//     }
//   });

//   // Used as template
//   c = testComponent(data);
//   expect(typeof c).toBe("string");

//   // Used to create DOM element
//   c = testComponent(data, null);
//   expect(c instanceof HTMLElement).toBeTruthy();
//   expect(c.textContent).toBe("Hello EZT!");

//   // Connect to existing element
//   const div = html2DOM('<div class="test">Hello EZT!</div>');
//   document.body.appendChild(div);
//   testComponent(data, div);
//   div.dispatchEvent(new MouseEvent("click"));
//   expect(div.textContent).toBe("clicked!");

//   function html2DOM(html) {
//     const doc = parser.parseFromString(html, "text/html");
//     return doc.body.firstChild;
//   }
// });

// test("interactions", () => {
//   filterAction("click").subscribe(params => {
//     dispatchReaction("onClick", params);
//   });

//   const testComponent = ezt({
//     template: `<div class="test"><span data-ref="span">Hello EZT!</span></div>`,
//     init(_data, element) {
//       const refs = getDOMRefs(element);
//       let times = 0;

//       element.addEventListener("click", () => {
//         dispatchAction("click", { times: ++times });
//       });

//       filterReaction("onClick").subscribe(params => {
//         refs.span.textContent = `clicked ${params.times} times`;
//       });
//     }
//   });

//   const el = testComponent({}, null);
//   document.body.appendChild(el);
//   el.dispatchEvent(new MouseEvent("click"));
//   expect(el.children[0].textContent).toBe("clicked 1 times");
//   el.dispatchEvent(new MouseEvent("click"));
//   expect(el.children[0].textContent).toBe("clicked 2 times");
// });
