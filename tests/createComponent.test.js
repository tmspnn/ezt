const ezt = require("../dist/ezt").default;

test("createComponent: used as template engine in server side", () => {
  const data = ["Make breakfast.", "Read a book.", "Walk my dog."];
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
      return data.map(todo => {
        return {
          data: { todo },
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

test("createComponent: used in client side to create DOM elements", () => {
  const myComponent = ezt("<div>Hello <%= name %>!</div>");
  const myElement = myComponent({ name: "EZT" }, null);
  expect(myElement instanceof HTMLElement).toBe(true);
  expect(myElement.textContent).toBe("Hello EZT!");
});

test("createComponent: used in client to bind events", () => {
  const btnComponent = ezt({
    template: "<button>Click me!</button>",
    init(data, el) {
      el.addEventListener("click", () => {
        data.clicked = true;
        el.textContent = "Clicked!";
      });
    }
  });
  const data = { clicked: false };
  const btnElement = document.createElement("button");
  btnElement.textContent = "Click me!";
  btnComponent(data, btnElement);
  btnElement.dispatchEvent(new MouseEvent("click"));
  expect(btnElement.textContent).toBe("Clicked!");
  expect(data.clicked).toBe(true);
});
