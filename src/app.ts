// MODELS
/// <reference path="models/drag-drop.ts" />
/// <reference path="models/project.ts" />
//STATE
/// <reference path="state/project-state.ts" />
//UTIL
/// <reference path="util/validation.ts" />
// DECORATORS
/// <reference path="decorators/autobind.ts" />
// COMPONENTS
/// <reference path="components/project-list.ts" />
/// <reference path="components/project-input.ts" />

namespace App {
  new ProjectInput();
  new ProjectList('active');
  new ProjectList('finished');
}
