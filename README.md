# EZT

Template based web development library.

## What is EZT?

EZT means easy template, It's:

- **Easy**. Based on lodash.template.
- **Small**. 8.7kB gzipped.
- **Fast**. It's vanilla js.
- Available in **IE10+**.

## Installation

```shell
npm install ezt
```

## Get Started

```typescript
import ezt from "ezt";

const myComponent = ezt({
  template: "<div>Hello <%= name %>.</div>"
});

myComponent({ name: "EZT" }); // "<div>Hello EZT.</div>"
```

## Why?

Template engines works well on producing HTML strings, but they don't define behavior(event listeners, UI effects, etc.) of a web app. Frontend frameworks(React, as a example) provide declarative, state-driven UI development, but state management is not easy, and the performance of React's server side rendering is not so satisfying.

Assume this situation:

- SEO is important for you site, you need server side rendering.
- Your site has intensive user interractions and UI effects, you need to write a lot of javascript.
- Business logic of your site is complicated, you need to manipulate a bunch of datasets and frontend states.
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

It takes a data **object**, an optional **DOM element**, produces an **HTML string**, or a **DOM element**.

Let's dive in with the component in section Get Started:

```typescript
// When The second parameter(element) is undefined,
// component will be used as template.
myComponent({ name: "EZT" }); // "<div>Hello EZT.</div>"

// When The second parameter(element) is null,
// a new DOM element will be created.
myComponent({ name: "EZT" }, null); // HTMLDivElement

// When The second parameter(element) is an HTML element,
// its behavior will be defined(see next code section).
myComponent({ name: "EZT" }, document.getElementById("my-component")); // HTMLDivElement
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
    // Define behavior of your component here.
    ...
  }
});

const todos = ["Make breakfast.", "Read a book.", "Play with my dog."];

// Will produce the todo list HTML.
todoList({ todos });

// Will produce a new todo list DOM element,
// and its behavior will be defined by the "init" method.
todoList({ todos }, null);

// Will define the behavior of the selected element.
todoList({ todos }, document.getElementById("todo-list"));
```

```ezt``` is a component factory, the options are:

- `template`: HTML template `string`, **required**.
- `templateOptions`: lodash template options, see [here](https://lodash.com/docs/4.17.15#template). **Optional**.
- `subcomponents`: a `function` that defines subcomponents as `{ data: { [k: string]: any }; fn: Component; }`, **optional**. It returns an `object` or an `array`, templates of subcomponents could be accessed with `data.$`.
- `init`: a `function` that defines the behavior of the component, **optional**. The first parameter is the data object that passed to the component, the second paramter is the DOM element of the component.

## Business logic and UI state management

In real world development, we found that **seperating UI state management from business logic** could make both UI components and business modules **reuseable** across projects, and it also makes them more **maintainable**.

We define **4 APIs** to separate UI states from business logic:

```typescript
import { Observable } from "rxjs";

interface Action {
  _category: string;
  _type: string;
  [k: string]: any;
}

function dispatchAction(type: string, params?: { [k: string]: any }): void;

function filterAction(type: string): Observable<Action>;

function dispatchReaction(type: string, params?: { [k: string]: any }): void;

function filterReaction(type: string): Observable<Action>;
```

Actions are dispatched by user interactions(click, swipe, etc.). Actions will drive business logic(manipulate datasets), then trigger reactions. UI components will subscribe reactions, then manipulate UI states and DOM. So code will be like this:

```typescript
// main.js
import app from "./components/app";
import statistics from "./modules/statistics";

filterAction("clickBtn").subscribe(() => {
  const clickTimes = statistics.addBtnClickTimes();
  dispatchReaction("onBtnClick", { clickTimes });
});

document.body.appendChild(app({}, null));


// statistics.js
class Statistics {
  clickTimes = 0;
  
  addBtnClickTimes() {
    return ++this.clickTimes;
  }
}

export default new Statistics();


// app.js
import ezt, { dispatchAction, filterReaction, getDOMRefs } from "ezt"

export default ezt({
  template: `
  <div>
    <span>The button has been clicked <b data-ref="times">0</b> times.</span>
    <button data-ref="btn">Click Me</button>
  </div>`,
  
  init(data, element) {
    const refs = getDOMRefs(element);
    
    refs.btn.addEventListener("click", () => {
      dispatchAction("clickBtn");
    });
    
    filterReaction("onBtnClick", params => {
      data.clickTimes = params.clickTimes;
      refs.times.textContent = data.clickTimes;
    });
  }
});
```

The Action-Reaction pattern defines input and output of business modules and UI components.

- For business modules, Input is defined by ```filterAction```, output is defined by ```dispatchReaction```.
- For UI components, Input is defined by ```filterReaction```, output is defined by ```dispatchAction```.

In this pattern, business modules could be written in Object-Oriented pattern(as a class), keep the data of their domains, and provide public methods. UI components can focus on reactions, manipulating local data(include states), and the DOM. We don't use virtual DOM, so we have to **manipulate DOM by hands**. In Action-Reaction pattern, DOM manipulation could be split into multiple reaction subscriptions, so most of the time it's not annoying. We can get DOM references with helper function `getDOMRefs`, It will refer to the DOM elements which have custom attribute `data-ref`.

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
  function dispatchAction(type: string, params?: { [k: string]: any }): void;

  function filterAction(type: string): Observable<Action>;

  function dispatchReaction(type: string, params?: { [k: string]: any }): void;

  function filterReaction(type: string): Observable<Action>;
  ```

- Helpers:

  ```typescript
  function getDOMRefs(element: HTMLElement): { [k: string]: HTMLElement };
  ```
