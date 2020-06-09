# EZT

Template based web development library.

EZT means "Easy Template", It's:

- **Easy** to use. It's built on `lodash.template` and `rxjs`.
- Small. **8.5kB** gzipped.
- Available in both **server side** and **frontend**.
- Available in **IE10+**.

---

## Installation

```shell
npm install ezt
```

---

## Get Started

```javascript
import ezt from "ezt";

const data = [{ id: 1, title: "Make breakfast.", completed: false }];

const itemComponent = ezt("<li><%= todo %></li>");

const listComponent = ezt({
  template: `
  <ul id="list">
    <% for (var i in $) { %>
      <%= $[i] %>
    <% } %>
  </ul>`,
  children: data => {
    return data.map(item => ({
      data: item,
      fn: itemComponent
    }));
  }
});

console.log(listComponent(todos)); // Will print the list.
```

---

## Why?

Template engines works well on producing HTML strings, but they don't define behavior(event listeners, animations, etc.) of a web app. Frontend frameworks based on virtual DOM provide declarative, state-driven UI development, but state management is not easy, and the performance of server side rendering is not so satisfying.

Assume this situation:

- SEO is important for you.
- Your site has intensive user interractions and UI effects.
- Business logic of your site is complicated, and there may be a lot more modules in future.

So we need to:

- Render HTML with high performance on server side.
- Declare UI and interaction of our web app.
- Build flexible and maintainable business logic.

---

## How to?

### **1. Render HTML with high performance on server side.**

On server side, components are just template functions. Components without children can be declared like this:

```javascript
const itemComponent = ezt("<li><%= todo %></li>");
```

or this:

```javascript
const itemComponent = ezt({ template: "<li><%= todo %></li>" });
```

To declare components with children, we need a `children` method:

```javascript
const listComponent = ezt({
  template: `
  <ul id="list">
    <% for (var i in $) { %>
      <%= $[i] %>
    <% } %>
  </ul>`,
  children: data => {
    return data.map(item => ({
      data: item,
      fn: itemComponent
    }));
  }
});
```

Method `chidren` takes a data object, returns an `Array` **or** an `Object` with each item in it has two property: `data`(data passed to the child) and `fn`(the child component).

In the template, dollar sign `$` refers to templates of the children. In the example above, `$[0]` is `<li>Make breakfast.</li>`

Since components are just template functions, we can import them and generate HTML easily:

```javascript
const express = require("express");
const listComponent = require("./components/listComponent");

const app = express();

app.get("/todos", (req, res) => {
  const data = [{ id: 1, title: "Make breakfast.", completed: false }];
  const listHtml = listComponent(data);

  res.set("Content-Type", "text/html");
  res.send(`
    <!doctype html>
    <html lang="en">
      <head></head>
      <body>
        ${listHtml}
      </body>
    </html>
  `);
});

app.listen(3000);
```

---

### **2. Declare UI and interaction of our web app.**

EZT uses [`lodash.template`](https://lodash.com/docs/4.17.15#template) and UI declaration is just the same:

```js
let t = ezt("hello <%= name %>!");

t({ name: "John" }); // "hello John!"

t = ezt("<b><%- value %></b>");

t({ value: "<script>" }); // "<b>&lt;script&gt;</b>"

t = ezt('<%= "\\<%- value %\\>" %>');

t({ value: "This value will be ignored" }); // "<%- value %>"
```

for more examples, you can check [lodash docs](https://lodash.com/docs/4.17.15#template).

EZT is based no template, not virtual DOM, so there is no `setState`. EZT adopts traditional **MVC** instead of state-centralized
patterns. Components are in view layer, they can either dispatch an action or respond to data change. Let's make the example above more practical, if we want to remove a todo item:

```javascript
// components/itemComponent.js
import { dispatch, respondTo } from "ezt";

const itemComponent = ezt({
  template: `
  <li>
    <span>
      <%= id %>.<%= title %>
    </span>
    <button data-ref="btn">Remove</button>
  </li>`,
  init(data, el, refs) {
    const { id } = data;
    const { btn } = refs;
    const subscriptions = {};

    btn.addEventListener("click", () => {
      dispatch("removeItem", id);
    });

    subscriptions.onRemove = respondTo("itemRemoved", id => {
      if (id === data.id) {
        subscriptions.onRemove.unsubscribe();
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      }
    });
  }
});

export default itemComponent;
```

The `init` method is used to define the client side behavior of components. `data` is the data object passed to the component, `el` is the DOM element of the component, and refs is the reference to the DOM elements with attribute `data-ref`.

When rerendering, DOM manipulation is still needed, so libraries like [`jQuery`](https://jquery.com/) or [`DOM7`](https://framework7.io/docs/dom7.html) are recommended.

**Why we still choose to manipulate DOM by hand?**

- With components, There won't be a lot of DOM-related code on top level(`window` or `document`), all DOM manipulations are local(deal with the component itself), so most of the time it's not complicated.

- Template engines don't deal with event listeners, we have to add them in `init` method.

- Most of the UI changes are implemented by CSS. CSS is a natual state machine.

- No concerns on `componentShouldUpdate`, `forceUpdate` .etc, and subscriptions are more flexible than component lifecycle hooks.

---

Now let's handle the actions dispatched by `itemComponent`

```javascript
// controllers/listController.js
import { Controller } from "ezt";
import listModel from "../models/listModel";

class ListController extends Controller {
  removeItem(id) {
    if (listModel.removeTodoItemById(id)) {
      this.respond("itemRemoved", id);
    }
  }
}

export default new ListController();
```

Actions dispatched by components will be handled by corresponding methods of controllers. Controllers' methods are bind to themselves, so we **don't** have to write `removeItemById = id => {...}`.

Models can be simple objects:

```javascript
// models/listModel.js
class ListModel {
  todos = [];

  constructor(todos) {
    this.todos = todos;
  }

  removeTodoItemById(id) {
    const index = this.todos.findIndex(item => item.id === id);
    return index > -1 ? this.todos.splice(index, 1) : null;
  }
}

export default new ListModel([{ id: 1, title: "Make breakfast.", completed: false }]);
```

Then we can run our app:

```javascript
// main.js
import listModel from "./models/listModel";
import listComponent from "./components/listComponent";
import listController from "./controllers/listController";

listController.bind();

listComponent(listModel.todos, document.getElementById("list"));
```

---

### **3. Build flexible and maintainable business logic.**

Domain Driven Design(DDD) is recommended. We can have multiple domains(models) and each domain provides methods to manipulate data. Ajax requests are sent in controllers.

```javascript
// models/listModel.js
class listModel {
  ...

  toggleTodoItem(id) {
    const item = this.todos.find(todo => todo.id === id);
    if (item) {
      item.completed = !item.completed;
      return item;
    }
    return null;
  }
}

// controllers/listController.js
import logModel from "../models/logModel";

class ListController {
  ...

  toggleItem(id) {
    /* Assume we've made another module: logModel */
    const log = logModel.getLogContent(id);

    return http.post("path/to/log/system", log).then(res => {
      console.log("log uploaded");
      const item = listModel.toggleTodoItem(id);
      this.respond("itemToggled", item);
    });
  }
}

```

---

## Docs

- [Component](#ezt-component)
- [ComponentOptions](#ezt-component-options)
- [Controller](#ezt-controller)
- [createComponent](#ezt-create-component)
- [dispatch](#ezt-dispatch)
- [ezt](#ezt-ezt)
- [LazyComponent](#ezt-lazy-component)
- [respondTo](#ezt-respond-to)
- [TemplateOptions](#ezt-template-options)

### <a name="ezt-action"></a> `ezt.Component`

```typescript
interface Component {
  (data: { [k: string]: any }, element?: null | HTMLElement): string | HTMLElement;
}
```

### <a name="ezt-component-options"></a> `ezt.ComponentOptions`

```typescript
interface ComponentOptions {
  template: string;
  templateOptions?: TemplateOptions;
  children?: (data: { [k: string]: any }) => { [k: string]: LazyComponent } | Array<LazyComponent>;
  init?: (data: { [k: string]: any }, el: HTMLElement, refs: { [k: string]: HTMLElement }) => void;
}
```

### <a name="ezt-controller"></a> `ezt.Controller`

```typescript
import { Subscription, UnaryFunction } from "rxjs";

abstract class Controller {
  _subscriptions: Array<Subscription>;

  bind(): void;

  unbind(): void;

  dispatch(name: string, args: any): Controller;

  respond(name: string, args: any): Controller;

  _on(
    actionName: string,
    pipes: () => void | UnaryFunction<any, any> | UnaryFunction<any, any>[],
    handler?: () => void
  ): Controller;
}
```

Example:

```javascript
import { throttleTime, delay } from "rxjs/operators";
import { Controller, dispatch, respondTo } from "ezt";

class MyController extends Controller {
  log(content) {
    console.log("myController.log: " + content);
  }
}

const myController = new MyController();

myController.bind(); // myController is listening to actions now
dispatch("log", "testing log"); // myController.log: testing log

respondTo("logged", content => {
  console.log("respondTo.logged: " + content);
});
myController.respond("logged", "records logged"); // respondTo.logged: records logged

myController.unbind(); // myController is not listening to actions any more
dispatch("log", "testing log"); // Won't print

// Still able to send responses
myController.respond("logged", "records logged"); // respondTo.logged: records logged

// We can add pipes for methods
myController.log.pipes = throttleTime(100);

// Multiple pipes
myController.log.pipes = [throttleTime(100), delay(20)];
```

### <a name="ezt-create-component"></a> `ezt.createComponent`

See [`ezt`](#ezt-ezt).

### <a name="ezt-dispatch"></a> `ezt.dispatch`

```typescript
function dispatch(type: string, args: any): void;
```

### <a name="ezt-ezt"></a> `ezt`

```typescript
function ezt(options: string | ComponentOptions): Component;
```

Example:

```javascript
const greetingDiv = ezt({
  template: "<div>Hello <%= name %></div>",
  init(data, el) {
    el.addEventListener("click", () => {
      el.textContent = 😀;
    });
  }
});

greetDiv("Mike"); // <div>Hello Mike</div>

greetingDiv("Mike", null) // Will produce a new HTMLDivElement. Use this when we want to create a new component in browser.

greetingDiv("Mike", document.getElementById("greeting-div")); // Will call init method on the selected div.
```

### <a name="ezt-lazy-component"></a> `ezt.LazyComponent`

```typescript
interface LazyComponent {
  data: { [k: string]: any };
  fn: Component;
}
```

### <a name="ezt-respond-to"></a> `ezt.respondTo`

```typescript
import { Subscription, UnaryFunction } from "rxjs";

function respondTo(
  reaction: string,
  pipes: () => void | UnaryFunction<any, any> | UnaryFunction<any, any>[],
  handler?: () => void
): Subscription;
```

Example:

```javascript
import { throttleTime, delay } from "rxjs/operators";

const subscriptions1 = respondTo("itemRemoved", id => {
  console.log(`item with id = ${id} is removed`);
});
subscriptions1.unsubscribe();

/* We can add pipes */
const subscriptions2 = respondTo("itemRemoved", throttleTime(100), id => {
  console.log(`item with id = ${id} is removed`);
});
subscription2.unsubscribe();

/* Multiple pipes */
const subscriptions3 = respondTo("itemRemoved", [throttleTime(100), delay(20)], id => {
  console.log(`item with id = ${id} is removed`);
});
subscription3.unsubscribe();
```

### <a name="ezt-template-options"></a> `ezt.TemplateOptions`

```typescript
interface TemplateOptions {
  escape?: RegExp;
  evaluate?: RegExp;
  imports?: { [k: string]: any };
  interpolate?: RegExp;
  sourceURL?: string;
  variable?: string;
}
```
