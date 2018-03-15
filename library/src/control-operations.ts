import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';

export abstract class ControlOperations {
  static create(form: AbstractControl): ControlOperations {
    if (form instanceof FormGroup) {
      return new FormGroupOperations(form);
    }
    if (form instanceof FormArray) {
      return new FormArrayOperations(form);
    }
    // if (form instanceof FormControl) {
    //   return new FormControlOperations(form);
    // }
    throw new Error('Invalid argument. Must be FormGroup or FormArray.');
  }

  abstract addControl(name: string, control: AbstractControl);

  abstract removeControl(name: string, control: AbstractControl);
}

class FormGroupOperations implements ControlOperations {
  constructor(private form: FormGroup) { }

  addControl(name: string, control: AbstractControl) {
    this.form.addControl(name, control);
  }

  removeControl(name: string, control: AbstractControl) {
    this.form.removeControl(name);
  }
}

class FormArrayOperations implements ControlOperations {
  constructor(private form: FormArray) { }

  addControl(name: string, control: AbstractControl) {
    this.form.push(control);
  }

  removeControl(name: string, control: AbstractControl) {
    const index = this.form.controls.indexOf(control);
    this.form.removeAt(index);
  }
}

class FormControlOperations implements ControlOperations {
  constructor(private form: FormControl) { }

  addControl(name: string, control: FormControl) {
    this.form.setValidators(control.validator);
    this.form.setAsyncValidators(control.asyncValidator);
    this.form.setValue(control.value);
    control.valueChanges.subscribe(() => {
      this.form.setValidators(control.validator);
      this.form.setAsyncValidators(control.asyncValidator);
      this.form.setValue(control.value);
    });
  }

  removeControl(name: string, control: FormControl) { }
}
