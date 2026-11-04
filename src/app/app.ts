import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MainLayoutComponent],
  template: '<app-main-layout><router-outlet /></app-main-layout>',
  styleUrl: './app.scss'
})
export class App {}
