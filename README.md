# EZT

Template based web development library.

## What is EZT?

EZT means easy template, It's easy(based on lodash.template), small(8.7kB gzipped) and fast(basically vanilla js).

## Installation

```shell
npm install ezt
```

## Get Started

```typescript
import ezt from "ezt";

const myComponent = ezt({ template: "<div>Hello <%= name %>.</div>" });

myComponent({ name: "EZT" }); // "<div>Hello EZT.</div>"
```

## Why?

Template engines works well on producing HTML strings, but they don't define behavior(event listeners, UI effects, etc) of a web app. Frontend frameworks(React, as a example) provide declarative, state-driven UI development, but state management is not easy, and the performance of React's server side rendering is not so satisfying.

Assume this situation:

- SEO is important for you site, you need server side rendering.
- Your site has intensive user interractions and effects, you need to write a lot of javascript.
- The business logic of your site is complicated, you need to manipulate a bunch of datasets and frontend states.
- There may be more business modules in future, you have to make the project extensable.

So we need a tool to:

- Render HTML with high performance on server side.
- Define behavior of DOM elements.
- Create DOM elements if we need to.
- Separate UI state management from business logic.

So we build EZT, based on `lodash.template` and `rxjs`.

## Introducing Component

The definition of component in EZT is:

```typescript
interface Component {
  (data: { [k: string]: any }, element?: null | HTMLElement): string | HTMLElement;
}
```

It takes a data object, an optional HTML element, produces an HTML string, or a DOM element.

Let's dive in with the component in section Get Started:

```typescript
// When The second parameter(element) is undefined,
// component will be used as template engine.
myComponent({ name: "EZT" }); // "<div>Hello EZT.</div>"

// When The second parameter(element) is null,
// a new DOM element will be created,
// and its behavior will be defined.
myComponent({ name: "EZT" }, null); // HTMLDivElement

// When The second parameter(element) is an HTML element,
// its behavior will be defined.
myComponent({ name: "EZT" }, document.getElementById("app")); // HTMLDivElement
```

Now Let's build a more useful component:

```typescript
import ezt from "ezt";

const todoItem = ezt({ template: `<li><%= title %></li>` });

const todoList = ezt({
  template: `
  <div>
    <h1>Todo List</h1>
    <ul>
      <% for (var i in $) { %>
        <%= $[i] %>
      <% } %>
    </ul>
  </div>`,

  subcomponents(data) {
    return data.todos.map(todo => ({
      data: { title: todo },
      fn: todoItem
    }));
  },

  init(data, element) {
    console.log(data, element);
  }
});

// Will produce the todo list HTML.
todoList({
  todos: ["Make breakfast.", "Read a book.", "Play with my dog."]
});
```

ezt is a component factory, the options are:

- `template`: HTML template `string`, required.
- `subcomponents`: a `function` that defines subcomponents as `{ data: { [k: string]: any }; fn: Component; }`, optional. It returns an `object` or an `array`, templates of subcomponents could be accessed with `data.$`.
- `init`: a function that defines the behavior of the component, optional. The first parameter is the data object that passed to the component, the second paramter is the DOM element of the component.

## UI state and business logic

In real world development, we found that seperating UI state management from business logic could make both UI components and business modules reuseable across projects, and it also makes them more maintainable.

We define 4 APIs to separate UI states from business logic:

```typescript
import { Observable } from "rxjs";

interface Action {
  _category: string;
  _type: string;
  [k: string]: any;
}

function triggerAction(type: string, params?: { [k: string]: any }): void;

function filterAction(type: string): Observable<Action>;

function triggerReaction(type: string, params?: { [k: string]: any }): void;

function filterReaction(type: string): Observable<Action>;
```

Actions are operations of the user. Actions will trigger business logic, manipulate datasets, then fire a reaction. UI components will subscribe reactions, then manipulate states and change the UI. So the code will be like this:

```typescript
// main.js
import app from "./components/app";
import user from "./businessModules/user";
import product from "./businessModules/product";
import payment from "./businessModules/payment";

(function main() {
  // Define business logic
  filterAction("buyNowBtnClick").subscribe(() => {
    triggerReaction("onRequest");
    payment
      .create({ uid: user.id, productId: product.id })
      .then(item => {
        user.boughtProducts.push(item);
        triggerReaction("onPaymentSuccess");
      })
      .catch(error => {
        triggerReaction("onPaymentFail", {
          message: error.message
        });
      })
      .finally(() => {
        triggerReaction("onRequestEnd");
      });
  });

  // Initiate app
  app(window.initData, document.getElementById("app"));
})();
```

Business logic are triggered by actions, and could be defined in function main. Business modules could be written in Object-Oriented pattern(as a class), and keep the data of their domains:

```typescript
// businessModules/user.js
class User {
  id = null;
  boughtProducts = [];
}

// businessModules/product.js
class Product {
  id = null;
  price = 0;
}

// businessModules/payment.js
class Payment {
  id = null;

  create(options) {
    return ajax.post("/api/payments", {
      uid: options.uid,
      productId: options.productId
    });
  }
}
```

Then UI components would be like this:

```typescript
import ezt, { getDOMRefs, triggerAction, filterReaction } from "ezt"

const app = ezt({
  template: `
  <div>
    ...
    <button data-ref="buyNowBtn">Buy Now</button>
  </div>`,

  subcomponents(data) { ... },

  init(data, element) {
    // DOM refs
    const refs = getDOMRefs(element);

    // Local states
    let btnAvailable = true;

    refs.buyNowBtn.addEventListener("click", () => triggerAction("buyNowBtnClick"));

    filterReaction("onPaymentSuccess").subscribe(() => {
      btnAvailable = false;
      refs.buyNowBtn.classList.add("disabled");
    });
  }
});
```

UI state changes are triggered by reactions. We don't use virtual DOM, so we have to manipulate DOM by hands. In Action-Reaction pattern, DOM manipulation could be split into multiple reaction subscriptions, so it's usually not annoying. We can get DOM references with helper function `getDOMRefs`, It will refer to the DOM elements which have custom attribute `data-ref`.

## Documentation

- Interfaces:

  ```typescript
  interface Component {
    (data: { [k: string]: any }, element?: null | HTMLElement): string | HTMLElement;
  }

  interface SubcomponentDeclaration {
    data: { [k: string]: any };
    fn: Component;
  }

  interface Action {
    _category: string;
    _type: string;
    [k: string]: any;
  }
  ```

- Component factory:

  ```typescript
  // These are equivillant:
  //   import ezt from "ezt";
  //   import { createComponent } from "ezt";

  function createComponent(options: {
    template: string;
    subcomponents?: (data: {
      [k: string]: any;
    }) => { [k: string]: SubcomponentDeclaration } | Array<SubcomponentDeclaration>;
    init?: (data: { [k: string]: any }, el: HTMLElement) => void;
  }): Component;
  ```

- Interactions:

  ```typescript
  function triggerAction(type: string, params?: { [k: string]: any }): void;

  function filterAction(type: string): Observable<Action>;

  function triggerReaction(type: string, params?: { [k: string]: any }): void;

  function filterReaction(type: string): Observable<Action>;
  ```

- Helpers:

  ```typescript
  function getDOMRefs(element: HTMLElement): { [k: string]: HTMLElement };
  ```
