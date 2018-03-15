import { AbstractControl } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import { LazyMetadata } from './lazy-metadata';

export abstract class LazyControlComponent {
  abstract value: any;
  abstract metadata: LazyMetadata;
  abstract control: AbstractControl;
}

export interface OnLazySetup {
  onLazySetup();
}

export function instanceOfOnLazySetup(object: any): object is OnLazySetup {
  return 'onLazySetup' in object;
}

export abstract class LazyControlComponentExtended extends LazyControlComponent {
  controlSetStart: Subject<any>;
  controlSetEnd: Subject<any>;

  static supplement(target: LazyControlComponent): LazyControlComponentExtended {
    // supply subjects
    (target as LazyControlComponentExtended).controlSetStart = new Subject();
    (target as LazyControlComponentExtended).controlSetEnd = new Subject();

    // property value
    let _control = target['control'];

    // property getter
    const getter = function () {
      return _control;
    };

    // property setter
    const setter = function (newValue) {
      this.controlSetStart.next();
      _control = newValue;
      this.controlSetEnd.next();
    };

    // Delete property.
    if (delete target['control']) {
      // Create new property with getter and setter
      Object.defineProperty(target, 'control', {
        get: getter,
        set: setter,
        enumerable: true,
        configurable: true
      });
    }

    return target as LazyControlComponentExtended;
  }
}
