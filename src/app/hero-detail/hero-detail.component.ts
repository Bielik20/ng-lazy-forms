import { Component, Input, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HeroService } from '../hero.service';
import { Hero } from '../models/hero';


@Component({
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: ['./hero-detail.component.css']
})
export class HeroDetailComponent implements OnChanges {
  @Input() hero: Hero;
  heroForm: FormGroup;

  constructor(private fb: FormBuilder, private heroService: HeroService) {
    this.createForm();
  }

  ngOnChanges() {
    setTimeout(() => this.createForm());
  }

  onSubmit() {
    this.hero.update(this.heroForm.value);
    this.heroService.updateHero(this.hero).subscribe(/* error handling */);
    this.heroForm.markAsPristine();
  }

  createForm() {
    this.heroForm = this.fb.group({
      power: '',
      sidekick: ''
    });
  }

  revert() { this.createForm(); }
}
