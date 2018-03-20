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
    this.control = new FormControl(this.value, this.metadata.validators);
  }
}
