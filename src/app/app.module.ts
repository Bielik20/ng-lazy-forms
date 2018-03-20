import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { LazyFormsModule } from 'ng-lazy-forms';
import { AppComponent } from './app.component';
import { HeroDetailComponent } from './hero-detail/hero-detail.component';
import { HeroListComponent } from './hero-list/hero-list.component';
import { HeroService } from './hero.service';
import { LazyControlsModule } from './lazy-controls/lazy-controls.module';


@NgModule({
  declarations: [
    AppComponent,
    HeroDetailComponent,
    HeroListComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    LazyFormsModule,
    LazyControlsModule,
  ],
  providers: [HeroService],
  bootstrap: [AppComponent]
})
export class AppModule {}
