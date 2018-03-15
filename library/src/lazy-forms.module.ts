import 'reflect-metadata';
import { NgModule } from '@angular/core';
import { LazyFormDirective } from './lazy-form.directive';
import { LazyHostDirective } from './lazy-host.directive';
import { LazySelectorComponent } from './lazy-selector.component';

@NgModule({
  imports: [],
  declarations: [LazyFormDirective, LazyHostDirective, LazySelectorComponent],
  exports: [LazyFormDirective, LazySelectorComponent],
})
export class LazyFormsModule {}
