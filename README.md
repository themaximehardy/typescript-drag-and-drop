# TypeScript: Drag And Drop Project

### 1. DOM Element Selection & OOP Rendering

The idea here, we created the `class` `ProjectInput` where we initialised `templateElement` and `hostElement` in the constructor. We knew their types (`HTMLTemplateElement` and `HTMLDivElement`) and we were sure they will be available on the page. We can use `!`. We got the content from `#project-input` by using `document.importNode` and we specified the `form` element which is the first child. Then, we attached the `form` in the `#app` element.

```ts
class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;

  constructor() {
    this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = 'user-input';
    this.attach();
  }

  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element);
  }
}

const prjInput = new ProjectInput();
```

### 2. Interacting with DOM Elements

We added the access to all the inputs _title, description and people_ in the constructor and then we added a listener on the form when the user **submit** it. We created `configure` and we bound the `this` from the class. In this case we wanted to `console.log` the value of title when we submitted the form.

```ts
class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  // INPUTS
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = 'user-input';

    // GET ACCESS TO ALL THE INPUTS
    this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

    this.configure();
    this.attach();
  }

  private submitHandler(event: Event) {
    event.preventDefault();
    console.log(this.titleInputElement.value);
  }

  private configure() {
    this.element.addEventListener('submit', this.submitHandler.bind(this)); // we need to bind the "this" from the class
  }

  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element);
  }
}

const prjInput = new ProjectInput();
```

### 3. Creating and Using an "Autobind" Decorator

We created a **decorator**, more precisely, a **method decorator**. Now we can automatically `bind` the `this`.

```ts
/**
 * Autobind decorator (method decorator)
 * @param _ (target, not used here)
 * @param _2 (methodName, not used here)
 * @param descriptor
 */
function Autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjustedDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjustedDescriptor;
}
```

We used it, as showed below:

```ts
@Autobind
  private submitHandler(event: Event) { ... }
```
