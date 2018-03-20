import { DefaultMetadata } from '../lazy-controls/default/default-control.component';
import { metadata, MetadataAccessor } from '../lazy-controls/metadata';
import { SelectMetadata } from '../lazy-controls/select/select-control.component';

export class Address extends MetadataAccessor {
  @metadata(new DefaultMetadata({ label: 'Street' }))
  street = '';

  @metadata(new DefaultMetadata({ label: 'City' }))
  city = '';

  @metadata(new SelectMetadata({
    label: 'State',
    collection: ['CA', 'MD', 'OH', 'VA']
  }))
  state = '';

  @metadata(new DefaultMetadata({ label: 'Zip Code' }))
  zip = '';

  constructor(options: {} = {}) {
    super();
    this.update(options as Address);
  }

  update(options: Address) {
    this.street = options.street || this.street;
    this.city = options.city || this.city;
    this.state = options.state || this.state;
    this.zip = options.zip || this.zip;
  }
}
