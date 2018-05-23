import { Type } from '@angular/core';
import { LazyControlComponent } from './lazy-control.component';

export abstract class LazyMetadata {
  key: string;
  abstract readonly component: Type<LazyControlComponent>;

  constructor(options: {} = {}) {
    this.key = options['key'];
  }
}

export function setLazyMetadata(value: LazyMetadata) {
  return function (target: object, key: string) {
    value.key = key;
    Reflect.defineMetadata('lazy-forms-metadata', value, target, key);
  };
}

// TODO: Change it, so it is similar (target, key)
export function getLazyMetadata(propertyKey: string, target: object): LazyMetadata | any {
  return Reflect.getMetadata('lazy-forms-metadata', target, propertyKey);
}
