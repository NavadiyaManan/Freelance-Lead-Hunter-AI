import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-placeholder',
  imports: [RouterLink],
  template: `<div class="placeholder"><span class="icon"><i class="pi pi-wrench"></i></span><div class="eyebrow">COMING IN A FUTURE PHASE</div><h1>{{ heading }}</h1><p>This workspace area is part of the product roadmap. It will become available in a later phase.</p><a routerLink="/dashboard"><i class="pi pi-arrow-left"></i> Back to dashboard</a></div>`,
  styles: [`:host{display:block}.placeholder{min-height:65vh;display:grid;align-content:center;justify-items:center;text-align:center;color:var(--text-color)}.icon{width:45px;height:45px;display:grid;place-items:center;border-radius:13px;background:#eef0ff;color:#626ee3;font-size:16px;margin-bottom:15px}.app-dark .icon{background:#303455}.eyebrow{font-size:9px;color:#6874dd;font-weight:800;letter-spacing:1px}.placeholder h1{margin:8px 0;font-size:25px}.placeholder p{max-width:400px;color:var(--text-color-secondary);font-size:11px;line-height:1.6}.placeholder a{margin-top:10px;color:#5967e9;text-decoration:none;font-size:10px;font-weight:650}.placeholder a .pi{font-size:9px;margin-right:4px}`]
})
export class PlaceholderComponent {
  private readonly route = inject(ActivatedRoute);
  protected readonly heading = this.route.snapshot.data['heading'] as string;
}
