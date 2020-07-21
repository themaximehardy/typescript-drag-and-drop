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

### 4. Fetching User Input

Here, we have created a new private function `gatherUserInput` which return a tuple (or void). We have created a simple data validation but very naive and not scalable (we're going to improve it later). In `submitHandler`, we're returning the tuple in a constant `userInput` but need to verify if it is a tuple. Because JS doesn't know what is a tuple we need to check if it is an `array` via `Array.isArray(value)`. We also wanted to clear the inputs after submission, we created `clearInputs`.

```ts
//...
  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    if (
      enteredTitle.trim().length === 0 ||
      enteredDescription.trim().length === 0 ||
      enteredPeople.trim().length === 0
    ) {
      alert('Invalid input, please try again!');
      return;
    }

    return [enteredTitle, enteredDescription, +enteredPeople];
  }

  private clearInputs() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }

  @Autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      const [title, desc, people] = userInput;
      console.log(title, desc, people);
      this.clearInputs();
    }
  }
//...
```

### 5. Creating a Re-Usable Validation Functionality

We've improved our validation functionality. We created a `Validatable` interface with a value (required) and all the validation rules (optional, we added the `?`). Then, we implemented the `validate` function which receive a `Validatable` object in param.

In `gatherUserInput`, we created three `Validatable` objects (titleValidatable, descriptionValidatable, peopleValidatable) which we validated before the "send" the data.

```ts
// VALIDATION
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validatableInput: Validatable) {
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }

  if (validatableInput.minLength != null && typeof validatableInput.value === 'string') {
    isValid = isValid && validatableInput.value.trim().length >= validatableInput.minLength;
  }

  if (validatableInput.maxLength != null && typeof validatableInput.value === 'string') {
    isValid = isValid && validatableInput.value.trim().length <= validatableInput.maxLength;
  }

  if (validatableInput.min != null && typeof validatableInput.value === 'number') {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }

  if (validatableInput.max != null && typeof validatableInput.value === 'number') {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }

  return isValid;
}

//...
class ProjectInput {
  //...
  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true,
    };

    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5,
    };

    const peopleValidatable: Validatable = {
      value: +enteredPeople, // + to transform the value in number
      required: true,
      min: 1,
      max: 5,
    };

    if (!validate(titleValidatable) || !validate(descriptionValidatable) || !validate(peopleValidatable)) {
      alert('Invalid input, please try again!');
      return;
    }

    return [enteredTitle, enteredDescription, +enteredPeople];
  }
  //...
}
```

### 6. Rendering Project Lists

We have implemented a new class `ProjectList`. It is very similar to the `ProjectInput` class. The main differences are the element we select on the HTML (e.g. `#project-list`).

```ts
/**
 * ProjectList class
 */
class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;

  constructor(private type: 'active' | 'finished') {
    this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;
    this.attach();
    this.renderContent();
  }

  private renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId; // we add an id to the `ul` element (based on the list type, active or finished)
    this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS'; // we fill the h2 title (based on the list type, active or finished)
  }

  private attach() {
    this.hostElement.insertAdjacentElement('beforeend', this.element); // we want to add the element before to close the tag
  }
}

//...
const prjInput = new ProjectInput();
const activePrjList = new ProjectList('active'); // we call the active list here
const finishedPrjList = new ProjectList('finished'); // we call the finished list here
```
