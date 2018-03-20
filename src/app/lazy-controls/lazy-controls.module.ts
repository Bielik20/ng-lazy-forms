import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LazyFormsModule } from 'ng-lazy-forms';
import { AddressControlComponent } from './address/address-control.component';
import { DefaultControlComponent } from './default/default-control.component';
import { SelectControlComponent } from './select/select-control.component';
import { AddressArrayControlComponent } from './address-array/address-array-control.component';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LazyFormsModule,
  ],
  declarations: [
    DefaultControlComponent,
    SelectControlComponent,
    AddressControlComponent,
    AddressArrayControlComponent,
  ],
  entryComponents: [
    DefaultControlComponent,
    SelectControlComponent,
    AddressControlComponent,
    AddressArrayControlComponent,
  ]
})
export class LazyControlsModule {}
