import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[lazyHost]'
})
export class LazyHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
