import { Directive, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { LazyFormService } from './lazy-form.service';
import { LazySelectorService } from './lazy-selector.service';

@Directive({
  selector: '[lazyForm]',
  providers: [
    LazyFormService,
    { provide: LazySelectorService, useExisting: LazyFormService },
  ],
})
export class LazyFormDirective implements OnInit, OnChanges {
  @Input() formGroup: AbstractControl;

  constructor(private lazyFormService: LazyFormService) { }

  ngOnInit() {
    this.lazyFormService.initialize(this.formGroup);
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes[propName].isFirstChange()) { continue; }
      this.lazyFormService.initialize(this.formGroup);
    }
  }
}
