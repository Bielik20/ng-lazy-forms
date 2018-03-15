import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import { ControlOperations } from './control-operations';
import { LazySelectorService } from './lazy-selector.service';

@Injectable()
export class LazyFormService implements LazySelectorService {
  onReset = new Subject();
  private controlOperations: ControlOperations;

  addControl(name: string, control: AbstractControl) {
    this.controlOperations.addControl(name, control);
  }

  removeControl(name: string, control: AbstractControl) {
    this.controlOperations.removeControl(name, control);
  }

  /** It will initialize or reinitialize form */
  initialize(form: AbstractControl) {
    this.controlOperations = ControlOperations.create(form);
    this.resetChildren();
  }

  // Only work during reinitialization because before that no one subscribe to OnReset()
  private resetChildren() {
    this.onReset.next();
  }
}
