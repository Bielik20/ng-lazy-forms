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
    this.control = new FormGroup({}, this.metadata.validators);
  }
}
