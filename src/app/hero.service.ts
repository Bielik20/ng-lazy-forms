import { Injectable } from '@angular/core';
import 'rxjs/add/operator/delay';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { Hero } from './models/hero';
import 'rxjs/add/operator/map';


const HEROES: any[] = [
  {
    id: 1,
    name: 'Whirlwind',
    addresses: [
      { street: '123 Main', city: 'Anywhere', state: 'CA', zip: '94801' },
      { street: '456 Maple', city: 'Somewhere', state: 'VA', zip: '23226' },
    ]
  },
  {
    id: 2,
    name: 'Bombastic',
    addresses: [
      { street: '789 Elm', city: 'Smallville', state: 'OH', zip: '04501' },
    ]
  },
  {
    id: 3,
    name: 'Magneta',
    addresses: []
  },
];

@Injectable()
export class HeroService {
  delayMs = 500;

  // Fake server get; assume nothing can go wrong
  getHeroes(): Observable<Hero[]> {
    return of(HEROES).delay(this.delayMs) // simulate latency with delay
      .map(heroes => {
        const temp = [];
        for (const hero of heroes) {
          temp.push(new Hero(hero));
        }
        return temp;
      });
  }

  // Fake server update; assume nothing can go wrong
  updateHero(hero: Hero): Observable<Hero> {
    const oldHero = HEROES.find(h => h.id === hero.id);
    const newHero = Object.assign(oldHero, hero); // Demo: mutate cached hero
    return of(newHero).delay(this.delayMs); // simulate latency with delay
  }
}
