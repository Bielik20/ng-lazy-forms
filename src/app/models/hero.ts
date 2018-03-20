import { AddressArrayMetadata } from '../lazy-controls/address-array/address-array-control.component';
import { DefaultMetadata } from '../lazy-controls/default/default-control.component';
import { metadata, MetadataAccessor } from '../lazy-controls/metadata';
import { Address } from './address';

export class Hero extends MetadataAccessor {
  id = 0;

  @metadata(new DefaultMetadata({ 
    label: 'Name',
    required: true
  }))
  name = '';

  @metadata(new AddressArrayMetadata({ label: 'Address' }))
  addresses: Address[];

  constructor(options: {} = {}) {
    super();
    this.update(options as Hero);
  }

  update(options: Hero) {
    this.id = options.id || this.id;
    this.name = options.name || this.name;

    this.addresses = [];
    for (const address of options.addresses) {
      this.addresses.push(new Address(address));
    }
  }
}
