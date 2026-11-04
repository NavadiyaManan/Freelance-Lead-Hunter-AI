import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'freelance-lead-hunter-theme';
  readonly dark = signal(this.readSavedTheme());

  constructor() { this.apply(this.dark()); }
  toggle(): void { this.dark.update((value) => !value); this.apply(this.dark()); }

  private readSavedTheme(): boolean {
    try { return localStorage.getItem(this.storageKey) === 'dark'; }
    catch { return false; }
  }
  private apply(dark: boolean): void {
    this.document.documentElement.classList.toggle('app-dark', dark);
    try { localStorage.setItem(this.storageKey, dark ? 'dark' : 'light'); }
    catch { /* Storage may be unavailable in private browsing. */ }
  }
}
