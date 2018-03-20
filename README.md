# NgLazyForms

Angular Lazy Forms is a project that aims to deliver IoC solution for creating Reactive Forms in Angular. The goal behind the idea is to enable user creation of small loosely coupled components which can be used to create complex forms.


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

Following [demo application](https://github.com/Bielik20/ng-lazy-forms) uses NgLazyForms to recreates application from [Angular Reactive Forms tutorial](https://angular.io/guide/reactive-forms) as for version 5.2.9 with minor changes that are discussed during the explanation. To inspect demo for yourself simply repository and run:
```
npm i
ng serve
```

Recreation steps are presented bellow. If somewhere in the tutorial appears a path or a file that does not exist yet it means that it should be created.

## Setup

Create a new project named `angular-lazy-forms`:
```
ng new angular-lazy-forms
```

Install ng-lazy-forms package:
```
npm i ng-lazy-forms
```


## Create a Base Metadata

Lazy Forms use metadata to generate and manage components called Lazy Controls (discussed latter in this tutorial). It defines basic metadata required to work:

```ts
export abstract class LazyMetadata {
  key: string;
  component: Type<LazyControlComponent>;
}
```

as well as metadata getter and setter methods:

```ts
export function setLazyMetadata(value: LazyMetadata);
export function getLazyMetadata(propertyKey: string, target: object): LazyMetadata | any;
```

However, it is advised to expand it so it can be used it the application. Following example is just a suggestion that should be adjusted for needs of the application. In `src/app/lazy-controls/metadata.ts` paste:

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

- `BaseMetadata` class extends LazyMetadata by adding properties used in field presentation. In this example it is only label but it could include "hint", "placeholder", "validators" etc.
- `MetadataAccessor` wraps `getLazyMetadata` method to allow us easier access to metadata.
- `metadata` function simply wraps setLazyMetadata function shielding it from the rest of the application.


## Create Lazy Controls

Description of this tutorial states:
> The goal behind the idea is to enable user creation of small loosely coupled components which can be used to create complex forms.

Those "small loosely coupled components" are conventionally called "Lazy Controls". They are small, reusable components that depend on metadata to create complex forms. They do not ship with that library, it is up to the developer to create and maintain them.

In this tutorial we are recreating Reactive Forms tutorial but "Super power" and "sidekick" will be made using standard Reactive Forms simply to show that they can be used alongside Lazy Forms.

This means that following Lazy Controls are required:

- `default` - to display standard text/number controls.
- `select` - to display dropdown control.
- `address` - to display 4 encapsulated control (street, city, state, zip code).
- `address-array` - to manage array of addresses.


Lazy Control is a regular Angular Component that implements `LazyControlComponent` class:

```ts
export abstract class LazyControlComponent {
  abstract value: any;
  abstract metadata: LazyMetadata;
  abstract control: AbstractControl;
}
```

Additionally, component can also implement `OnLazySetup` interface

```ts
export interface OnLazySetup {
  onLazySetup();
}
```

Implementing it is advised as it allows component to be rebuild without destroying it. This method is responsible for all the cleaning and set up of the component. Its functionality resembles a little Angular's own `ngOnChanges` method.


Lazy Control also ships with its own Metadata which extends `LazyMetadata` class. It uses this Metadata to build and configure itself as well as tell `LazyForms` which component to create.

> If this seams overwhelming at the moment don't worry. It will become clearer with given examples.

### LazyControlsModule

Before we go and create actual Controls create `src/app/lazy-controls/lazy-controls.module.ts`:

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


### Default Control

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

The file exports two classes `DefaultMetadata` and `DefaultControlComponent`.

`DefaultMetadata` extends `BaseMetadata` class we previously created which extends `LazyMetadata`. This means that we are fulfilling the contract and our `DefaultMetadata` in fact derives from `LazyMetadata`. 

- The `type` field refers to [html input type](https://www.w3schools.com/html/html_form_input_types.asp) with default of "text".
- The `component` field points `LazyControlComponent` that should be generated for this type of Metadata. In this case it points to `DefaultControlComponent`.

`DefaultControlComponent` implements `LazyControlComponent` by overwriting types of fields:

- `value` is expected to be `string`, `number` or a `Date`.
- `metadata` should be of our own type `DefaultMetadata` so that we can use `type` field defined there.
- `control` is a `FormControl` because it renders single control (not array or object).

`onLazySetup` method is very simple in this case, it only creates form every time this control is being build or rebuild.

Control and its Metadata are strongly coupled, they always come together. It is advised to keep them in the same file to avoid circular dependency warning as they both refer each other.

Now, create `src/app/lazy-controls/default/default-control.component.ts`:

```html
<div class="form-group">
  <label class="center-block">{{metadata.label}}:
    <input class="form-control" [formControl]="control" [type]="metadata.type">
  </label>
</div>
```

This template contains few important things:

- `metadata.label` is used to place label of control.
- `control` is passed to `formControl` of an input. 
- `metadata.type` is used to define type of the control.

This way we have created reusable, configurable component capable of displaying input for `text`, `number` and `Date` using delivered metadata. All that remains is to add newly created Control to `LazyControlsModule`:

```ts
declarations: [
  DefaultControlComponent,
],
entryComponents: [
  DefaultControlComponent,
]
```

It is necessary to register it in both `declarations` and `entryComponents`.


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

This Control is very similar to `DefaultControl` with difference that metadata defines `collection` field which is used in template to display select options.

> `DefaultControl` and `SelectControl` could be merged using `type` field of `DefaultMetadata` and `*ngSwitch` into one Control as they are very similar. It is up to the developer to make decision what is the best design choice in for application.

Now, add newly created Control to `LazyControlsModule`:

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

At the moment there is no Address class created. Don't worry we will take care of it soon.

This Control is different as it creates `FormGroup` instead of `FormControl`. It also accepts object as an input, not primitive. However, the biggest change is in the template. Create `src/app/lazy-controls/address/address-control.component.html`:

```html
<div lazyForm [formGroup]="control">
  <lazy-selector [value]="value.street" [metadata]="value.metadata('street')"></lazy-selector>
  <lazy-selector [value]="value.city" [metadata]="value.metadata('city')"></lazy-selector>
  <lazy-selector [value]="value.state" [metadata]="value.metadata('state')"></lazy-selector>
  <lazy-selector [value]="value.zip" [metadata]="value.metadata('zip')"></lazy-selector>
</div>
```

- `lazyForm` directive informs that this element is a container for `LazyControl`s.
- `formGroup` takes as an input parent element. It can be either `FormGroup` or `FormArray`.

This means that every `LazyControl` within `lazyForm` container will be attached to the parent element.

`lazy-selector` is a component responsible for rendering correct component based on the Metadata passed. It takes two mandatory inputs `value` and `metadata`. It is also responsible for attaching itself to the parent element.

Now, add newly created Control to `LazyControlsModule`:

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

- `AddressArrayMetadata` contains `child` field used to render array elements.
- `AddressArrayControlComponent` is responsible for managing array. Besides standard `createForm` method it defines two other `addItem` and `removeItem`. They are very simple and operate on `value` not `control`. `value` itself is shielded from outside the component. This means that any changes to that field in here have no effect on original value.

Create `src/app/lazy-controls/address-array/address-array-control.component.html`:

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

This template also uses `lazyForm` directive to define container for `lazy-selector` which in this cases renders previously created `AddressControlComponent`.

Now, add newly created Control to `LazyControlsModule`:

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


## Address

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
-  extends `MetadataAccessor` to be able to access Metadata through `metadata(propertyKey: string): BaseMetadata;` method.
- defines `update` method so that we can easily assign new values.

`@metadata` attributes defined in `src/app/lazy-controls/metadata.ts` allows for assignment of metadata to given fields. `key` is assigned automatically and is always the same as field name.

- Every field has defined label that will be used in their respective Controls.
- `state` field has defined collection which will be used to present options in `SelectControl`.

## Hero

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

- `id` field doesn't have metadata because it is never used in form nor in display template.


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

`HeroDetailComponent` is simplified compared to classic Reactive Form. Form creation, recreation and revert are done in the same way using `createForm` method. There is no need for deep copy of form addresses because in `hero.update(...)` method an array is recreated anyway which is basically a deep copy.

In `ngOnChanges()` method it is required to use `setTimeout` with no latency. This is because cycle must end before resetting the form. This may change in the future updates.

> There is no logging of the hero name in this tutorial because `LazyForms` are not designed to work with something like that. The idea behind `LazyForms` is to have clearer separation of concerns. Parent component (e.g.`HeroDetailComponent`) is suppose to orchestrate a form as a whole, not particular elements. If there is a need to listen for a particular Control it should be done within that Control.

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

There are only two `LazyForms` specific elements in this template:

- `lazyForm` directive.
- two `lazy-selector` elements.

As discussed at the beginning of the tutorial `sidekick` and `power` remain as classic Reactive Forms elements to show they can be used alongside `LazyForms`. 

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

Adding validation to LazyForms is very simple. Edit `src/app/lazy-controls/metadata.ts`:

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

It adds `ValidatorsMetadata` class which introduces `required` field as well as `get validators` method that created Angular validators array. Other validators can be added as well using this method.

Now, edit all `LazyControl`s:

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

This add validation functionality to our `LazyControl`s.

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

Again run `ng serve` to see that validation does in fact work.
