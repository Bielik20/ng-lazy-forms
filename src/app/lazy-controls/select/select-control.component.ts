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
    this.control = new FormControl(this.value, this.metadata.validators);
  }
}
