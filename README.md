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

### 7. Managing Application State with Singleton

We have create a class - `ProjectState` - to manage our state. We have an `array` of `projects` (which is an object with an `id`, a `title`, a `description` and a number of `people`). We also have an array of `listeners` which is an array of `function`, it will help us to share the change of the state "reactively" with our others classes. We decided to create a singleton via a **private constructor**, a **private static** `instance` field and a **static method** `getInstance`. If the instance already exists, we return it, otherwise we call the private constructor to instantiate it.

```ts
class ProjectState {
  private listeners: any[] = []; // we'll change any later
  private projects: any[] = []; // we'll change any later
  private static instance: ProjectState;

  private constructor() {}

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addListener(listenerFn: Function) {
    this.listeners.push(listenerFn);
  }

  addProject(title: string, description: string, numOfPeople: number) {
    const newProject = {
      id: Math.random.toString(), // Not a good practice but ok for our purpose here
      title,
      description,
      people: numOfPeople,
    };
    this.projects.push(newProject);
    for (const listenerFn of this.listeners) {
      // slice allow us to return a copy of the array and not the reference
      listenerFn(this.projects.slice());
    }
  }
}
```

We called the method `addListener` on the `projectState` instance. We passed a function, the projects are returned and I can assign them to the `assignedProjects` (a field which is a array of all the current projects created). We render them via `renderProjects`.

```ts
//...
class ProjectList {
  //...
  assignedProjects: any[]; // we'll change any later
  //...
  constructor(private type: 'active' | 'finished') {
    //...
    projectState.addListener((projects: any[]) => {
      this.assignedProjects = projects;
      this.renderProjects();
    });
    this.attach();
    this.renderContent();
  }

  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
    for (const prjItem of this.assignedProjects) {
      const listItem = document.createElement('li');
      listItem.textContent = prjItem.title;
      listEl.appendChild(listItem);
    }
  }
}
//...
```

### 8. More Classes & Custom Types

We have created a `Project` class to enforce the same project structure everywhere we want to use it. We added a `status` which is an `enum` (`ProjectStatus`). We've also created a new type `Listener`, which is a function which takes `Project` array in arg and return void. We now create a new project by `const newProject = new Project(Math.random.toString(), title, description, numOfPeople, ProjectStatus.Active);`.

```ts
// PROJECT TYPE
enum ProjectStatus {
  Active,
  Finished,
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus,
  ) {}
}

// PROJECT STATE MANAGEMENT
type Listener = (items: Project[]) => void; // Listener type added

class ProjectState {
  private listeners: Listener[] = []; // we replaced any
  private projects: Project[] = []; // we replaced any
  private static instance: ProjectState;

  //...
  addProject(title: string, description: string, numOfPeople: number) {
    const newProject = new Project(Math.random.toString(), title, description, numOfPeople, ProjectStatus.Active);
    this.projects.push(newProject);
    for (const listenerFn of this.listeners) {
      // slice allow us to return a copy of the array and not the reference
      listenerFn(this.projects.slice());
    }
  }
  //...
```

### 9. Filtering Projects with Enums

The idea here is to filter on the projects returned by the listener – `Active` or `Finished`.

```ts
//...
class ProjectList {
  //...
  assignedProjects: Project[];

  constructor(private type: 'active' | 'finished') {
    //...
    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((prj) => {
        if (this.type === 'active') {
          return prj.status === ProjectStatus.Active;
        }
        return prj.status === ProjectStatus.Finished;
      });
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
    //...
  }
  //...
```

### 10. Adding Inheritance & Generics

We created a `Component` abstract class (we can't instantiate it, because the class is incomplete in the sense it contains abstract methods without body and output) where we use generics `<T extends HTMLElement, U extends HTMLElement>` because we could get ≠ types for the `hostElement` and the `element`. We added two abstract methods `configure` and `renderContent` which has to be defined in the concrete subclass.

```ts
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(templateId: string, hostElementId: string, insertAtStart: boolean, newElementId?: string) {
    this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId)! as T;

    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as U;
    if (newElementId) {
      this.element.id = newElementId;
    }

    this.attach(insertAtStart);
  }

  private attach(insertAtBeginning: boolean) {
    this.hostElement.insertAdjacentElement(insertAtBeginning ? 'afterbegin' : 'beforeend', this.element);
  }

  abstract configure(): void;
  abstract renderContent(): void;
}
```

Then we can extends `ProjectList` with `Component`. Same for `ProjectInput`. We take advantage of code reusage (thanks to inheritance).

```ts
class ProjectList extends Component<HTMLDivElement, HTMLElement> {
  assignedProjects: Project[];

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  configure() {
    projectState.addListener((projects: Project[]) => {
      //...
      this.renderProjects();
    });
  }
  //...
```

We can also improve our "state management" by creating a "general" `State` class. With a generic type pass to the `Listener`, `ProjectState` now extends `State` (with Listeners of type `Project`).

```ts
class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super(); // we need to add super here
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, numOfPeople: number) {
    const newProject = new Project(Math.random.toString(), title, description, numOfPeople, ProjectStatus.Active);
    this.projects.push(newProject);
    for (const listenerFn of this.listeners) {
      // slice allow us to return a copy of the array and not the reference
      listenerFn(this.projects.slice());
    }
  }
}
```

### 11. Rendering Project Items with a Class

We've created a `ProjectItem` class which extends `Component`.

```ts
//...
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> {
  private project: Project;

  constructor(hostId: string, project: Project) {
    super('single-project', hostId, false, project.id);
    this.project = project;
    this.configure();
    this.renderContent();
  }

  configure() {}
  renderContent() {
    this.element.querySelector('h2')!.textContent = this.project.title;
    this.element.querySelector('h3')!.textContent = this.project.people.toString();
    this.element.querySelector('p')!.textContent = this.project.description;
  }
}

class ProjectList extends Component<HTMLDivElement, HTMLElement> {
  //...

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
  }

  private renderProjects() {
    for (const prjItem of this.assignedProjects) {
      new ProjectItem(this.element.querySelector('ul')!.id, prjItem); // we created a new instance of ProjectItem for every project
    }
  }
}
//...
```

### 12. Using a Getter

Using a `getter` is a good idea here. We want to display `1 person` or `X (multiple) perons` before "assigned".

```ts
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> {
  //...
  get persons() {
    if (this.project.people === 1) {
      return '1 person';
    } else {
      return `${this.project.people} persons`;
    }
  }
  //...
  renderContent() {
    //...
    this.element.querySelector('h3')!.textContent = this.persons + ' assigned'; // we call it like a property (not like a method/function)
    //...
  }
}
```

### 13. Utilizing Interfaces to Implement Drag & Drop

We created two new interfaces `Draggable` (which will be the `ProjectItem`) and `DragTarget` (which will be the `ProjectList`).

> Note: we need to add `draggable="true"` to the html element which will be draggable – `<li draggable="true">`.

```ts
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dragHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}
```

We have to implement the `Draggable` interface to `ProjectItem`. And we have to implement the methods we have created in the interfaces.

```ts
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
  //...
  @Autobind
  dragStartHandler(event: DragEvent) {
    console.log(event);
  }

  @Autobind
  dragEndHandler(_: DragEvent) {
    console.log('dragend');
  }

  configure() {
    this.element.addEventListener('dragstart', this.dragStartHandler);
    this.element.addEventListener('dragend', this.dragEndHandler);
  }
  //...
}
```
