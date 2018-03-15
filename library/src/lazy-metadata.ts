import { Type } from '@angular/core';
import { LazyControlComponent } from './lazy-control.component';

export abstract class LazyMetadata {
  key: string;
  abstract readonly component: Type<LazyControlComponent>;

  constructor(options: {} = {}) {
    this.key = options['key'];
    this.component = options['component'];
  }
}

export function setLazyMetadata(value: LazyMetadata) {
  return function (target: Object, key: string) {
    value.key = key;
    Reflect.defineMetadata('lazy-forms-metadata', value, target, key);
  };
}

export function getLazyMetadata(propertyKey: string, target: object): LazyMetadata | any {
  return Reflect.getMetadata('lazy-forms-metadata', target, propertyKey);
}
