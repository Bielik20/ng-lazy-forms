import {
  Component, ComponentFactory, ComponentFactoryResolver, ComponentRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild
} from '@angular/core';
import { cloneDeep} from 'lodash';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { instanceOfOnLazySetup, LazyControlComponent, LazyControlComponentExtended } from './lazy-control.component';
import { LazyHostDirective } from './lazy-host.directive';
import { LazyMetadata } from './lazy-metadata';
import { LazySelectorService } from './lazy-selector.service';

@Component({
  selector: 'lazy-selector',
  template: `
    <ng-template lazyHost></ng-template>`,
})
export class LazySelectorComponent implements OnInit, OnDestroy {
  @Input() value: any;
  @Input() metadata: LazyMetadata;
  @Output() onComponentCreate = new EventEmitter<LazyControlComponent>();
  @ViewChild(LazyHostDirective) host: LazyHostDirective;
  private childRef: ComponentRef<LazyControlComponent>;
  private child: LazyControlComponentExtended;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
              private lazySelectorService: LazySelectorService) { }

  ngOnInit() {
    this.createChild();
    this.lazySelectorService.onReset.takeUntil(this.ngUnsubscribe).subscribe(() => {
      if (instanceOfOnLazySetup(this.child)) {
        this.resetChild();
      } else {
        this.createChild();
      }
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private addChildControl() {
    setTimeout(() => {
      this.lazySelectorService.addControl(this.child.metadata.key, this.child.control);
      this.onComponentCreate.next(this.child);
    });
  }

  private removeChildControl() {
    setTimeout(() => {
      this.lazySelectorService.removeControl(this.child.metadata.key, this.child.control);
    });
  }

  private createChild() {
    this.buildChild();
    this.setHooks();
    this.resetChild();
  }

  private resetChild() {
    this.setChildInputs();
    this.addChildControlIfExists();
    this.setupChildIfPossible();
  }

  private buildChild() {
    const viewContainerRef = this.host.viewContainerRef;
    viewContainerRef.clear();
    this.childRef = viewContainerRef.createComponent(this.getComponentFactory());
    this.child = LazyControlComponentExtended.supplement(this.childRef.instance);
  }

  private getComponentFactory(): ComponentFactory<LazyControlComponent> {
    return this.componentFactoryResolver.resolveComponentFactory(this.metadata.component);
  }

  private setHooks() {
    this.childRef.onDestroy(() => this.removeChildControl());
    this.child.controlSetStart.takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        if (this.child.control) { this.removeChildControl(); }
      });
    this.child.controlSetEnd.takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        this.addChildControl();
      });
  }

  private setChildInputs() {
    this.child.value = cloneDeep(this.value);
    this.child.metadata = this.metadata;
  }

  private addChildControlIfExists() {
    if (!!this.child.control && !instanceOfOnLazySetup(this.child)) {
      console.warn('LazyForms: "control" assignment in constructor. Consider using ngOnInit.', this.child);
      this.addChildControl();
    }
  }

  private setupChildIfPossible() {
    if (instanceOfOnLazySetup(this.child)) {
      this.child.onLazySetup();
    }
  }
}
