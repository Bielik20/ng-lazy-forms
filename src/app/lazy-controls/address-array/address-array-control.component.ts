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
    this.control = new FormArray([], this.metadata.validators);
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
