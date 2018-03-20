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
