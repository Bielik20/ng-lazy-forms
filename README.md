# NgLazyForms

**Context**: In the Angular framework there are two [types of forms](https://www.scaler.com/topics/html/html-forms/), template driven and reactive. Both of them are effective for their respective use cases but neither addresses the problem of reusability and logic encapsulation. This flaw results in very bulky and complex form components.

**Objective**: Angular Lazy Forms is a project that aims to deliver IoC solution for creating Reactive Forms in Angular. The goal behind the idea is to enable user creation of small loosely coupled components which can be used to create complex forms.

Available on:
- [GitHub](https://github.com/Bielik20/ng-lazy-forms)
- [npm](https://www.npmjs.com/package/ng-lazy-forms)


## Installation

To use library simply run

```
npm i ng-lazy-forms
```

And import LazyFormsModule module in your `app.module.ts`:

```
imports: [
  ...
  LazyFormsModule,
],
```


# Demo and Tutorial

Following [demo application](https://github.com/Bielik20/ng-lazy-forms) uses **NgLazyForms** to recreates application from [Angular Reactive Forms tutorial](https://angular.io/guide/reactive-forms) as for version 5.2.9 with minor changes that are discussed in the tutorial. To inspect demo for yourself simply clone repository and run:
```
npm i
ng serve
```

Recreation steps are presented below. If somewhere in the tutorial appears a path or a file that does not exist yet it means that it should be created.

## Setup

Create a new project named `angular-lazy-forms`:

```
ng new angular-lazy-forms
```

Install **NgLazyForms** package:

```
npm i ng-lazy-forms
```

## Vocabulary

**NgLazyForms** use **LazyMetadata**s to generate and manage components called **LazyControl**s.

- Component that implements **LazyControl** is refered as **CustomLazyControl**.
- Its metadata (which implements **LazyMetadata**) is refered as **CustomLazyMetadata**.

### **LazyMetadata**

**NgLazyForms** define **LazyMetadata** as well as getter and setter:

```ts
export abstract class LazyMetadata {
  key: string;
  component: Type<LazyControlComponent>;
}
```

```ts
export function setLazyMetadata(value: LazyMetadata);
export function getLazyMetadata(propertyKey: string, target: object): LazyMetadata | any;
```

### **LazyControl**

**NgLazyForms** define **LazyControl** as well as optional **OnLazySetup** interface:

```ts
export abstract class LazyControlComponent {
  abstract value: any;
  abstract metadata: LazyMetadata;
  abstract control: AbstractControl;
}
```

```ts
export interface OnLazySetup {
  onLazySetup();
}
```

Implementing **OnLazySetup** is advised as it allows a component to be rebuild without destroying it. This method is responsible for all the cleaning and set up of the component. Its functionality resembles quite a bit Angular's own **ngOnChanges** method. It is up to developer to provide it.

### **CustomLazyControl** with **CustomLazyMetadata**

**CustomLazyControl** always comes with its own **CustomLazyMetadata**. It uses this metadata to build and configure itself. They are strongly coupled:

- **CustomLazyControl** expects its **CustomLazyMetadata** as an input.
- **CustomLazyMetadata** keeps a reference to its **CustomLazyControl** to tell **NgLazyForms** what component to create.

It is advised to keep them in the same file to avoid circular dependency warning as they both refer each other. Example of such a relation:

```ts
export class CustomLazyMetadata extends LazyMetadata {
  component = CustomLazyControl;
  ...
}

@Component({...})
export class CustomLazyControl implements LazyControlComponent {
  @Input() value: any;
  @Input() metadata: CustomLazyMetadata;
  control: AbstractControl;
  ...
}
```

> If this seems overwhelming at the moment don't worry. It will become clearer with examples.

## Create a **BaseMetadata**

**NgLazyForms** define **LazyMetadata** but it is advised to expand it so it can be used it the application. Following example is just a suggestion that should be adjusted for needs of every application. 

In `src/app/lazy-controls/metadata.ts` paste:

```ts
import { LazyMetadata, getLazyMetadata, setLazyMetadata } from 'ng-lazy-forms';

export abstract class BaseMetadata extends LazyMetadata {
  label?: string;

  constructor(options: {} = {}) {
    super(options);
    this.label = options['label'];
  }
}

export abstract class MetadataAccessor {
  metadata(propertyKey: string): BaseMetadata {
    return getLazyMetadata(propertyKey, this);
  }
}

export function metadata(value: BaseMetadata) {
  return setLazyMetadata(value);
}
```

- **BaseMetadat** class extends **LazyMetadata** by adding properties used by **CustomLazyControl**s to build and customize itself. In this example, it is only the "label" but it could include "hint", "placeholder", "validators" etc.
- `MetadataAccessor` wraps `getLazyMetadata` method to provide easier access to metadata.
- `metadata` function simply wraps `setLazyMetadata` function shielding it from the rest of the application.


## Create **CustomLazyControl**s

> The goal behind the idea is to enable user creation of small loosely coupled components which can be used to create complex forms.

Those "small loosely coupled components" are conventionally called **CustomLazyControl**s. They should be small, reusable components that implement **LazyControl**. They depend on **CustomLazyMetadata** to build and customize itself. 

Both **CustomLazyControl**s and **CustomLazyMetadata**s do not ship with that library, it is up to the developer to create and maintain them.

In this tutorial, the Reactive Forms tutorial application is being recreated using **NgLazyForms** with exception of "Superpower" and "Sidekick". They are made using standard Reactive Forms to demonstrate that they can be used alongside **NgLazyForms**.

This means that following **CustomLazyControl**s are required:

- **DefaultControl** - to display standard text/number controls.
- **SelectControl** - to display drop-down control.
- **AddressControl** - to display 4 encapsulated control (street, city, state, zip code).
- **AddressArrayControl** - to manage an array of addresses.


### **LazyControlsModule**

First create **LazyControlsModule**, `src/app/lazy-controls/lazy-controls.module.ts`:

```ts
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LazyFormsModule } from 'ng-lazy-forms';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LazyFormsModule,
  ]
  declarations: [
  ],
  entryComponents: [
  ]
})
export class LazyControlsModule {}
```

Created **CustomLazyControl**s must be added to both `declarations` and `entryComponents` arrays.


### **DefaultControl**

Create `src/app/lazy-controls/default/default-control.component.ts`:

```ts
import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { LazyControlComponent, OnLazySetup } from 'ng-lazy-forms';
import { BaseMetadata } from '../metadata';


export class DefaultMetadata extends BaseMetadata {
  type: string;
  component = DefaultControlComponent;

  constructor(options: {} = {}) {
    super(options);
    this.type = options['type'] || 'text';
  }
}

@Component({
  templateUrl: './default-control.component.html',
  styleUrls: ['./default-control.component.css']
})
export class DefaultControlComponent implements LazyControlComponent, OnLazySetup {
  @Input() value: string | number | Date;
  @Input() metadata: DefaultMetadata;
  control: FormControl;

  constructor() { }

  onLazySetup() {
    this.createForm();
  }

  private createForm() {
    this.control = new FormControl(this.value);
  }
}
```

This file exports **DefaultControl** and **DefaultMetadata**.

**DefaultMetadata** extends **BaseMetadata** and by extention **LazyMetadata**. This means that the contract is fulfilled and **DefaultMetadata** in fact derives from **LazyMetadata**. 

- The `type` field refers to [html input type](https://www.w3schools.com/html/html_form_input_types.asp) with default of "text".
- The `component` field keeps a reference to the **DefaultControl**. It tells **NgLazyForms** that for **DefaultMetadata** the **DefaultControl** should be rendered.

**DefaultControl** implements **LazyControl** by introducing these fields:

- The `value` is expected to be a `string`, `number` or a `Date`.
- The `metadata` should be of its own **DefaultMetadata** type so that so that **DefaultControl** can use fields introduced by it (i.e. `type`).
- The `control` is a `FormControl` because it renders a single control (not an array or an object).

`onLazySetup` method is very simple in this case. It creates a form every time this control is being built or rebuilt.

Now, create `src/app/lazy-controls/default/default-control.component.ts`:

```html
<div class="form-group">
  <label class="center-block">{{metadata.label}}:
    <input class="form-control" [formControl]="control" [type]="metadata.type">
  </label>
</div>
```

This template contains few important things:

- The `metadata.label` is used to place a label of a control.
- The `control` is passed to `formControl` of an input. 
- The `metadata.type` is used to define a type of a control.

This way created **DefaultControl** is configurable and reusable. It is capable of displaying input for `text`, `number` and `Date` using configuration from **DefaultMetadata**.

All that remains is to add newly created **DefaultControl** to **LazyControlsModule**:

```ts
declarations: [
  DefaultControlComponent,
],
entryComponents: [
  DefaultControlComponent,
]
```


### Select Control

Create `src/app/lazy-controls/select/select-control.component.ts`:

```ts
import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { LazyControlComponent, OnLazySetup } from 'ng-lazy-forms';
import { BaseMetadata } from '../metadata';


export class SelectMetadata extends BaseMetadata {
  collection: any[];
  component = SelectControlComponent;

  constructor(options: {} = {}) {
    super(options);
    this.collection = options['collection'] || [];
  }
}

@Component({
  templateUrl: './select-control.component.html',
  styleUrls: ['./select-control.component.css']
})
export class SelectControlComponent implements LazyControlComponent, OnLazySetup {
  @Input() value: any;
  @Input() metadata: SelectMetadata;
  control: FormControl;

  constructor() { }

  onLazySetup() {
    this.createForm();
  }

  private createForm() {
    this.control = new FormControl(this.value);
  }
}
```

and `src/app/lazy-controls/select/select-control.component.html`:

```html
<div class="form-group">
  <label class="center-block">{{metadata.label}}:
    <select class="form-control" [formControl]="control">
      <option *ngFor="let option of metadata.collection" [value]="option">{{option}}</option>
    </select>
  </label>
</div>
```

This Control is very similar to **DefaultControl** with a difference that **SelectMetadata** defines a `collection` field which is used in the template to display select options.

> `DefaultControl` and `SelectControl` could be merged using `type` field of `DefaultMetadata` similar to the way it is done in [Angular Dynamic Forms tutorial](https://angular.io/guide/dynamic-form#question-form-components). It is up to the developer to make the decision what is the best design choice for given application.

Now, add newly created **SelectControl** to **LazyControlsModule**:

```ts
declarations: [
  ...,
  SelectControlComponent
],
entryComponents: [
  ...,
  SelectControlComponent
]
```


### Address Control

Create `src/app/lazy-controls/address/address-control.component.ts`:

```ts
import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { LazyControlComponent, OnLazySetup } from 'ng-lazy-forms';
import { Address } from '../../models/address';
import { BaseMetadata } from '../metadata';


export class AddressMetadata extends BaseMetadata {
  component = AddressControlComponent;
}

@Component({
  templateUrl: './address-control.component.html',
  styleUrls: ['./address-control.component.css']
})
export class AddressControlComponent implements LazyControlComponent, OnLazySetup {
  @Input() value: Address;
  @Input() metadata: AddressMetadata;
  control: FormGroup;

  constructor() { }

  onLazySetup() {
    this.createForm();
  }

  private createForm() {
    this.control = new FormGroup({});
  }
}
```

At the moment there is no Address class created. It will be added later in this tutorial.

**AddressControl** is different as it creates `FormGroup` instead of `FormControl`. It also accepts an object as an input, not primitive. However, the biggest change is in the template. 

Create `src/app/lazy-controls/address/address-control.component.html`:

```html
<div lazyForm [formGroup]="control">
  <lazy-selector [value]="value.street" [metadata]="value.metadata('street')"></lazy-selector>
  <lazy-selector [value]="value.city" [metadata]="value.metadata('city')"></lazy-selector>
  <lazy-selector [value]="value.state" [metadata]="value.metadata('state')"></lazy-selector>
  <lazy-selector [value]="value.zip" [metadata]="value.metadata('zip')"></lazy-selector>
</div>
```

- `lazyForm` directive informs that this element is a container for **CustomLazyControl**s.
- `formGroup` takes as an input parent element. It can be either `FormGroup` or `FormArray`.

This means that every `lazy-selector` (**CustomLazyControl**) within `lazyForm` container will be attached to the parent element.

`lazy-selector` is a component responsible for rendering correct component based on the **CustomLazyMetadata** passed. It takes two mandatory inputs `value` and `metadata`. It is also responsible for attaching itself to the parent element.

Now, add newly created **AddressControl** to **LazyControlsModule**:

```ts
declarations: [
  ...,
  AddressControlComponent
],
entryComponents: [
  ...,
  AddressControlComponent
]
```


### Address Array Control

Create `src/app/lazy-controls/address-array/address-array-control.component.ts`:

```ts
import { Component, Input } from '@angular/core';
import { FormArray } from '@angular/forms';
import { LazyControlComponent, OnLazySetup } from 'ng-lazy-forms';
import { Address } from '../../models/address';
import { AddressMetadata } from '../address/address-control.component';
import { BaseMetadata } from '../metadata';


export class AddressArrayMetadata extends BaseMetadata {
  component = AddressArrayControlComponent;
  child: AddressMetadata;

  constructor(options: {} = {}) {
    super(options);
    this.child = new AddressMetadata(options['child']);
  }
}

@Component({
  templateUrl: './address-array-control.component.html',
  styleUrls: ['./address-array-control.component.css']
})
export class AddressArrayControlComponent implements LazyControlComponent, OnLazySetup {
  @Input() value: Address[];
  @Input() metadata: AddressArrayMetadata;
  control: FormArray;

  constructor() { }

  onLazySetup() {
    this.createForm();
  }

  private createForm() {
    this.control = new FormArray([]);
  }

  addItem() {
    this.control.markAsDirty();
    this.value.push(new Address());
  }

  removeItem(index: number) {
    this.control.markAsDirty();
    this.value.splice(index, 1);
  }
}
```

- **AddressArrayMetadata** contains `child` field of type **AddressMetadata** used to render elements of an array.
- **AddressArrayControl** is responsible for managing an array. Besides standard `createForm` method it defines two other, `addItem` and `removeItem`. They are very simple and operate on `value`, not `control`. `value` itself is shielded from outside the component. This means that any changes to that field in here have no effect on original value.

Create `src/app/lazy-controls/address-array/address-array-control.component.html`:l`:

```html
<div lazyForm [formGroup]="control" class="well well-lg">
  <div *ngFor="let item of value; let i=index" style="margin-bottom: 40px">
    <h4>
      <span (click)="removeItem(i)" style="cursor: pointer" class="glyphicon glyphicon-trash text-danger"></span>
      {{metadata.label}} #{{i + 1}}
    </h4>
    <div style="margin-left: 1em;">
      <lazy-selector [value]="item" [metadata]="metadata.child"></lazy-selector>
    </div>
  </div>
  <button (click)="addItem()" type="button">Add a Secret Lair</button>
</div>
```

This template also uses `lazyForm` directive to define a container for `lazy-selector` which in this cases renders previously created **AddressControl**.

Now, add newly created **AddressArrayControl** to **LazyControlsModule**:

```ts
declarations: [
  ...,
  AddressArrayControlComponent
],
entryComponents: [
  ...,
  AddressArrayControlComponent
]
```


## Create Models


### Address

Create `src/app/models/address.ts`:

```ts
import { DefaultMetadata } from '../lazy-controls/default/default-control.component';
import { metadata, MetadataAccessor } from '../lazy-controls/metadata';
import { SelectMetadata } from '../lazy-controls/select/select-control.component';

export class Address extends MetadataAccessor {
  @metadata(new DefaultMetadata({ label: 'Street' }))
  street = '';

  @metadata(new DefaultMetadata({ label: 'City' }))
  city = '';

  @metadata(new SelectMetadata({
    label: 'State',
    collection: ['CA', 'MD', 'OH', 'VA']
  }))
  state = '';

  @metadata(new DefaultMetadata({ label: 'Zip Code' }))
  zip = '';

  constructor(options: {} = {}) {
    super();
    this.update(options as Address);
  }

  update(options: Address) {
    this.street = options.street || this.street;
    this.city = options.city || this.city;
    this.state = options.state || this.state;
    this.zip = options.zip || this.zip;
  }
}

```

`Address` class:
-  extends **MetadataAccessor** to be able to access metadata through `metadata(propertyKey: string): BaseMetadata;` method.
- defines `update` method so that we can easily assign new values.

`@metadata` attributes defined in `src/app/lazy-controls/metadata.ts` allows for the assignment of metadata to given fields. `key` is assigned automatically and is always the same as a field name.

- Every field has a defined label that will be used in their respective **CustomLazyControl**s.
- `state` field has a defined collection which will be used to present options in **SelectControl**.

### Hero

Create `src/app/models/hero.ts`:

```ts
import { AddressArrayMetadata } from '../lazy-controls/address-array/address-array-control.component';
import { DefaultMetadata } from '../lazy-controls/default/default-control.component';
import { metadata, MetadataAccessor } from '../lazy-controls/metadata';
import { Address } from './address';

export class Hero extends MetadataAccessor {
  id = 0;

  @metadata(new DefaultMetadata({ label: 'Name' }))
  name = '';

  @metadata(new AddressArrayMetadata({ label: 'Address' }))
  addresses: Address[];

  constructor(options: {} = {}) {
    super();
    this.update(options as Hero);
  }

  update(options: Hero) {
    this.id = options.id || this.id;
    this.name = options.name || this.name;

    this.addresses = [];
    for (const address of options.addresses) {
      this.addresses.push(new Address(address));
    }
  }
}
```

- `id` field doesn't have metadata because it is never used in a form nor in a display template.


## Create Hero Detail component

Create `src/app/hero-detail/hero-detail.component.ts`:

```ts
import { Component, Input, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HeroService } from '../hero.service';
import { Hero } from '../models/hero';


@Component({
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: ['./hero-detail.component.css']
})
export class HeroDetailComponent implements OnChanges {
  @Input() hero: Hero;
  heroForm: FormGroup;

  constructor(private fb: FormBuilder, private heroService: HeroService) {
    this.createForm();
  }

  ngOnChanges() {
    setTimeout(() => this.createForm());
  }

  onSubmit() {
    this.hero.update(this.heroForm.value);
    this.heroService.updateHero(this.hero).subscribe(/* error handling */);
    this.heroForm.markAsPristine();
  }

  createForm() {
    this.heroForm = this.fb.group({
      power: '',
      sidekick: ''
    });
  }

  revert() { this.createForm(); }
}
```

`HeroDetailComponent` is simplified compared to the one in Reactive Forms tutorial. Form create, recreate, and revert operations are done in the same way using `createForm` method. There is no need for a deep copy of form addresses because in `hero.update(...)` method an array is recreated which server as a deep copy.

In `ngOnChanges()` method it is required to use `setTimeout` with no latency. This is because cycle must end before resetting the form. This may change in the future updates.

> There is no logging of the hero name in this tutorial because **NgLazyForms** are not designed to work with something like that. The idea behind **NgLazyForms** is to have a clearer separation of concerns. Parent component (e.g. `HeroDetailComponent`) is supposed to orchestrate a form as a whole, not particular elements. If there is a need to listen for a particular **CustomLazyControl** it should be done within that **CustomLazyControl**.

Create template `src/app/hero-detail/hero-detail.component.html`:

```html
<form lazyForm [formGroup]="heroForm" (ngSubmit)="onSubmit()">
  <div style="margin-bottom: 1em">
    <button type="submit"
            [disabled]="heroForm.pristine" class="btn btn-success">Save</button> &nbsp;
    <button type="button" (click)="revert()"
            [disabled]="heroForm.pristine" class="btn btn-danger">Revert</button>
  </div>

  <!-- Hero Detail Controls -->
  <lazy-selector [value]="hero.name" [metadata]="hero.metadata('name')"></lazy-selector>
  <lazy-selector [value]="hero.addresses" [metadata]="hero.metadata('addresses')"></lazy-selector>

  <div class="form-group radio">
    <h4>Super power:</h4>
    <label class="center-block"><input type="radio" formControlName="power" value="flight">Flight</label>
    <label class="center-block"><input type="radio" formControlName="power" value="x-ray vision">X-ray vision</label>
    <label class="center-block"><input type="radio" formControlName="power" value="strength">Strength</label>
  </div>
  <div class="checkbox">
    <label class="center-block">
      <input type="checkbox" formControlName="sidekick">I have a sidekick.
    </label>
  </div>
</form>

<p>heroForm value: {{ heroForm.value | json}}</p>
```

There are only two **NgLazyForms** specific elements in this template:

- `lazyForm` directive.
- two `lazy-selector` elements.

As discussed at the beginning of this tutorial `sidekick` and `power` remain as classic Reactive Forms elements to show they can be used alongside **NgLazyForms**. 

## Finishing Application

Create `src/app/hero-list/hero-list.component.ts`:

```ts
import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/finally';
import { Observable } from 'rxjs/Observable';
import { HeroService } from '../hero.service';
import { Hero } from '../models/hero';


@Component({
  selector: 'app-hero-list',
  templateUrl: './hero-list.component.html',
  styleUrls: ['./hero-list.component.css']
})
export class HeroListComponent implements OnInit {
  heroes: Observable<Hero[]>;
  isLoading = false;
  selectedHero: Hero;

  constructor(private heroService: HeroService) { }

  ngOnInit() { this.getHeroes(); }

  getHeroes() {
    this.isLoading = true;
    this.heroes = this.heroService.getHeroes()
    // Todo: error handling
      .finally(() => this.isLoading = false);
    this.selectedHero = undefined;
  }

  select(hero: Hero) { this.selectedHero = hero; }
}
```

Create `src/app/hero-list/hero-list.component.html`:

```html
<h3 *ngIf="isLoading"><i>Loading heroes ... </i></h3>
<h3 *ngIf="!isLoading">Select a hero:</h3>

<nav>
  <button (click)="getHeroes()" class="btn btn-primary">Refresh</button>
  <a *ngFor="let hero of heroes | async" (click)="select(hero)">{{hero.name}}</a>
</nav>

<div *ngIf="selectedHero">
  <hr>
  <h2>Hero Detail</h2>
  <h3>Editing: {{selectedHero.name}}</h3>
  <app-hero-detail [hero]="selectedHero"></app-hero-detail>
</div>
```

Edit `src/app/app.component.html`

```html
<div class="container">
  <h1>Lazy Forms</h1>
  <app-hero-list></app-hero-list>
</div>
```

Create `src/app/hero.service.ts`:

```ts
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/delay';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { Hero } from './models/hero';
import 'rxjs/add/operator/map';


const HEROES: any[] = [
  {
    id: 1,
    name: 'Whirlwind',
    addresses: [
      { street: '123 Main', city: 'Anywhere', state: 'CA', zip: '94801' },
      { street: '456 Maple', city: 'Somewhere', state: 'VA', zip: '23226' },
    ]
  },
  {
    id: 2,
    name: 'Bombastic',
    addresses: [
      { street: '789 Elm', city: 'Smallville', state: 'OH', zip: '04501' },
    ]
  },
  {
    id: 3,
    name: 'Magneta',
    addresses: []
  },
];

@Injectable()
export class HeroService {
  delayMs = 500;

  // Fake server get; assume nothing can go wrong
  getHeroes(): Observable<Hero[]> {
    return of(HEROES).delay(this.delayMs) // simulate latency with delay
      .map(heroes => {
        const temp = [];
        for (const hero of heroes) {
          temp.push(new Hero(hero));
        }
        return temp;
      });
  }

  // Fake server update; assume nothing can go wrong
  updateHero(hero: Hero): Observable<Hero> {
    const oldHero = HEROES.find(h => h.id === hero.id);
    const newHero = Object.assign(oldHero, hero); // Demo: mutate cached hero
    return of(newHero).delay(this.delayMs); // simulate latency with delay
  }
}
```

Edit `src/app/add.module.ts`:

```ts
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { LazyFormsModule } from 'ng-lazy-forms';
import { AppComponent } from './app.component';
import { HeroDetailComponent } from './hero-detail/hero-detail.component';
import { HeroListComponent } from './hero-list/hero-list.component';
import { HeroService } from './hero.service';
import { LazyControlsModule } from './lazy-controls/lazy-controls.module';


@NgModule({
  declarations: [
    AppComponent,
    HeroDetailComponent,
    HeroListComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    LazyFormsModule,
    LazyControlsModule,
  ],
  providers: [HeroService],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

Edit `src/styles.css`:

```css
/* Master Styles */
h1 {
  color: #369;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 250%;
}
h2, h3 {
  color: #444;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: lighter;
}
body {
  margin: 2em;
}
body, input[text], button {
  color: #888;
  font-family: Cambria, Georgia;
}
a {
  cursor: pointer;
  cursor: hand;
}
button {
  font-family: Arial;
  background-color: #eee;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  cursor: hand;
}
button:hover {
  background-color: #cfd8dc;
}
button:disabled {
  background-color: #eee;
  color: #aaa;
  cursor: auto;
}

/* Navigation link styles */
nav a {
  padding: 5px 10px;
  text-decoration: none;
  margin-right: 10px;
  margin-top: 10px;
  display: inline-block;
  background-color: #eee;
  border-radius: 4px;
}
nav a:visited, a:link {
  color: #607D8B;
}
nav a:hover {
  color: #039be5;
  background-color: #CFD8DC;
}
nav a.active {
  color: #039be5;
}

/* everywhere else */
* {
  font-family: Arial, Helvetica, sans-serif;
}


/*
Copyright 2017-2018 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
```

## Test Application

Run `ng serve` to test the application. It should work just like the demo created in Reactive Forms tutorial.

## Add Validation

Adding validation to **NgLazyForms** is very simple. Edit `src/app/lazy-controls/metadata.ts`:

```ts
import { ValidatorFn, Validators } from '@angular/forms';
import { LazyMetadata, getLazyMetadata, setLazyMetadata } from 'ng-lazy-forms';

abstract class ValidatorsMetadata extends LazyMetadata {
  required?: boolean;

  constructor(options: {} = {}) {
    super(options);
    this.required = options['required'] || false;
  }

  get validators(): ValidatorFn[] {
    const array = [];
    if (this.required) { array.push(Validators.required); }
    return array;
  }
}

export abstract class BaseMetadata extends ValidatorsMetadata {
  label?: string;

  constructor(options: {} = {}) {
    super(options);
    this.label = options['label'];
  }
}

export abstract class MetadataAccessor {
  metadata(propertyKey: string): BaseMetadata {
    return getLazyMetadata(propertyKey, this);
  }
}

export function metadata(value: BaseMetadata) {
  return setLazyMetadata(value);
}
```

It adds **ValidatorsMetadata** class which introduces `required` field as well as `get validators(): ValidatorFn[]` method that creates Angular validators array. Other validators can be added as well using this technique.

Now, edit all **CustomLazyControl**s:

```ts
// Address Control
private createForm() {
  this.control = new FormGroup({}, this.metadata.validators);
}

// Address Array Control
private createForm() {
  this.control = new FormArray([], this.metadata.validators);
}

// Default Control
private createForm() {
  this.control = new FormControl(this.value, this.metadata.validators);
}

// Select Control
private createForm() {
  this.control = new FormControl(this.value, this.metadata.validators);
}
```

This adds validation functionality to **CustomLazyControl**s.

### Test Validation

To test validation edit `src/app/models/hero.ts`:

```ts
@metadata(new DefaultMetadata({ 
  label: 'Name',
  required: true
}))
name = '';
```

This will make `name` field required.

Now, at the end of `src/app/hero-detail/hero-detail.component.html` add this line:

```html
<p>heroForm status: {{ heroForm.status | json }}</p>
```

Run again `ng serve` to see that validation does in fact work.
