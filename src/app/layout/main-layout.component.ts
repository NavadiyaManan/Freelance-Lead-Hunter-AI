import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { ThemeService } from '../core/services/theme.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <div class="mobile-scrim" [class.visible]="menuOpen()" (click)="menuOpen.set(false)" aria-hidden="true"></div>
      <aside class="sidebar" [class.open]="menuOpen()">
        <a class="brand" routerLink="/dashboard" (click)="menuOpen.set(false)">
          <span class="brand-mark"><i class="pi pi-sparkles"></i></span>
          <span class="brand-copy"><strong>Lead Hunter</strong><small>FREELANCE AI</small></span>
          <button class="icon-button sidebar-close" aria-label="Close menu" (click)="$event.preventDefault(); menuOpen.set(false)"><i class="pi pi-times"></i></button>
        </a>
        <div class="workspace-pill"><span class="workspace-dot"></span> Personal workspace <i class="pi pi-angle-down"></i></div>
        <nav aria-label="Main navigation">
          <div class="nav-group"><div class="nav-label">WORKSPACE</div>
            <a routerLink="/dashboard" routerLinkActive="active" (click)="menuOpen.set(false)"><i class="pi pi-th-large"></i><span>Dashboard</span></a>
            <a routerLink="/discovery" routerLinkActive="active" (click)="menuOpen.set(false)"><i class="pi pi-compass"></i><span>Business Discovery</span><span class="nav-new">NEW</span></a>
            <a routerLink="/leads" routerLinkActive="active" (click)="menuOpen.set(false)"><i class="pi pi-briefcase"></i><span>All Leads</span></a>
          </div>
          <div class="nav-group"><div class="nav-label">INTELLIGENCE</div>
            <a routerLink="/website-audit" routerLinkActive="active" (click)="menuOpen.set(false)"><i class="pi pi-globe"></i><span>Website Audit</span></a>
            <a routerLink="/ai-analysis" routerLinkActive="active" (click)="menuOpen.set(false)"><i class="pi pi-bolt"></i><span>AI Analysis</span></a>
          </div>
          <div class="nav-group"><div class="nav-label">OUTREACH</div>
            <a routerLink="/message-approval" routerLinkActive="active" (click)="menuOpen.set(false)"><i class="pi pi-send"></i><span>Message Approval</span></a>
            <a routerLink="/reports" routerLinkActive="active" (click)="menuOpen.set(false)"><i class="pi pi-chart-bar"></i><span>Reports</span></a>
          </div>
          <div class="nav-group"><div class="nav-label">PREFERENCES</div>
            <a routerLink="/settings" routerLinkActive="active" (click)="menuOpen.set(false)"><i class="pi pi-cog"></i><span>Settings</span></a>
          </div>
        </nav>
        <div class="sidebar-bottom">
          <div class="help-card"><span class="help-icon"><i class="pi pi-lightbulb"></i></span><strong>Make your next move</strong><p>Start with a local business search and see what you can uncover.</p><a routerLink="/discovery">Explore discovery <i class="pi pi-arrow-right"></i></a></div>
          <div class="profile"><div class="avatar">MK</div><div class="profile-copy"><strong>Manan K.</strong><small>Free workspace</small></div><button class="icon-button profile-more" aria-label="Profile options"><i class="pi pi-ellipsis-h"></i></button></div>
        </div>
      </aside>
      <main class="main-area">
        <header class="topbar">
          <div class="topbar-left"><button class="icon-button menu-toggle" aria-label="Open menu" (click)="menuOpen.set(true)"><i class="pi pi-bars"></i></button><div class="breadcrumbs"><span>Workspace</span><i class="pi pi-angle-right"></i><strong>{{ pageTitle() }}</strong></div></div>
          <div class="topbar-actions"><span class="demo-indicator"><span></span> DEMO MODE</span><span class="top-divider"></span><button class="icon-button theme-button" [attr.aria-label]="theme.dark() ? 'Switch to light mode' : 'Switch to dark mode'" (click)="theme.toggle()"><i [class]="theme.dark() ? 'pi pi-sun' : 'pi pi-moon'"></i></button><div class="top-avatar" aria-label="Manan K.">MK</div></div>
        </header>
        <section class="page-content"><ng-content /></section>
      </main>
    </div>
  `,
  styles: [`
    :host { display:block; min-height:100vh; }
    .shell { min-height:100vh; }
    .sidebar { position:fixed; z-index:30; inset:0 auto 0 0; width:252px; display:flex; flex-direction:column; padding:22px 14px 14px; background:var(--surface-card); border-right:1px solid var(--surface-border); transition:transform .22s ease; }
    .brand { height:40px; display:flex; align-items:center; gap:11px; padding:0 8px; text-decoration:none; color:var(--text-color); }
    .brand-mark { width:34px; height:34px; display:grid; place-items:center; border-radius:11px; color:white; background:linear-gradient(145deg,#6e7cf7,#4856d9); box-shadow:0 5px 12px #5261df33; }
    .brand-copy { display:grid; gap:2px; line-height:1; }.brand-copy strong { font-size:15px; letter-spacing:-.3px; }.brand-copy small { color:var(--text-color-secondary); font-size:9px; font-weight:750; letter-spacing:1.5px; }
    .workspace-pill { margin:26px 4px 27px; padding:10px 11px; display:flex; align-items:center; gap:8px; border:1px solid var(--surface-border); border-radius:9px; color:var(--text-color-secondary); font-size:11px; font-weight:550; }.workspace-pill .pi-angle-down { margin-left:auto; font-size:11px; }.workspace-dot { width:7px;height:7px;border-radius:50%;background:#36b984;box-shadow:0 0 0 3px #36b98424; }
    nav { overflow:auto; }.nav-group { margin-bottom:26px; }.nav-label { padding:0 10px 9px; color:var(--text-color-secondary); font-size:9px; font-weight:750; letter-spacing:1.25px; }.nav-group a { height:38px; padding:0 10px; margin:2px 0; display:flex; align-items:center; gap:11px; color:var(--text-color-secondary); text-decoration:none; border-radius:8px; font-size:12px; font-weight:550; transition:.15s; }.nav-group a .pi { width:16px; font-size:14px; }.nav-group a:hover { background:var(--surface-hover); color:var(--text-color); }.nav-group a.active { background:#5865e910; color:#5967e9; font-weight:680; }.app-dark .nav-group a.active { color:#9ba5ff; background:#818cf81d; }.nav-new { margin-left:auto; padding:3px 5px; color:#5462e4; background:#5865e912; border-radius:4px; font-size:8px; font-weight:800; letter-spacing:.4px; }
    .sidebar-bottom { margin-top:auto; }.help-card { padding:13px 12px 12px; margin:0 2px 14px; border-radius:10px; background:linear-gradient(145deg,#f7f8ff,#f0f2ff); border:1px solid #e8eaff; }.app-dark .help-card { background:#222741; border-color:#2f3655; }.help-icon { width:27px;height:27px;display:grid;place-items:center;border-radius:8px;color:#5865e9;background:#e5e8ff;margin-bottom:9px;font-size:12px; }.help-card strong { font-size:11px; }.help-card p { margin:5px 0 9px; color:var(--text-color-secondary); font-size:10px; line-height:1.55; }.help-card a { color:#5967e9; font-size:10px; text-decoration:none; font-weight:680; }.help-card a .pi { font-size:9px; margin-left:4px; }
    .profile { padding:11px 5px 2px; border-top:1px solid var(--surface-border); display:flex;align-items:center;gap:9px; }.avatar,.top-avatar { display:grid;place-items:center;background:#e5e8ff;color:#525fda;font-weight:750; }.avatar { width:31px;height:31px;border-radius:50%;font-size:10px; }.profile-copy { display:grid;gap:3px; }.profile-copy strong { font-size:11px; }.profile-copy small { color:var(--text-color-secondary);font-size:9px; }.icon-button { display:grid;place-items:center;border:0;background:transparent;color:var(--text-color-secondary);cursor:pointer;border-radius:8px; }.profile-more { margin-left:auto;width:28px;height:28px; }.sidebar-close,.menu-toggle,.mobile-scrim { display:none; }
    .main-area { min-height:100vh; margin-left:252px; }.topbar { position:sticky;top:0;z-index:20;height:66px;padding:0 32px;display:flex;align-items:center;justify-content:space-between;background:color-mix(in srgb,var(--surface-ground) 92%,transparent);backdrop-filter:blur(12px);border-bottom:1px solid var(--surface-border); }.breadcrumbs {display:flex;align-items:center;gap:10px;color:var(--text-color-secondary);font-size:11px;}.breadcrumbs .pi {font-size:9px;}.breadcrumbs strong {color:var(--text-color);font-weight:650;}.topbar-actions {display:flex;align-items:center;gap:15px;}.demo-indicator {display:flex;align-items:center;gap:6px;color:var(--text-color-secondary);font-size:9px;font-weight:800;letter-spacing:.8px;}.demo-indicator span {width:6px;height:6px;border-radius:50%;background:#e8a338;}.top-divider {height:22px;width:1px;background:var(--surface-border);}.theme-button {width:31px;height:31px;font-size:13px; }.theme-button:hover,.icon-button:hover {background:var(--surface-hover);color:var(--text-color);}.top-avatar {width:30px;height:30px;border-radius:50%;font-size:9px;}.page-content {max-width:1480px;margin:0 auto;padding:31px 34px 50px;}
    @media(max-width:960px) { .sidebar { transform:translateX(-100%);box-shadow:none; }.sidebar.open {transform:translateX(0);box-shadow:14px 0 35px #10152a20;}.mobile-scrim.visible {display:block;position:fixed;inset:0;z-index:25;background:#0d14234d;}.sidebar-close,.menu-toggle {display:grid;width:32px;height:32px;}.main-area {margin-left:0;}.topbar {padding:0 22px;}.page-content {padding:26px 22px 40px;} }
    @media(max-width:540px) { .topbar {height:58px;padding:0 14px;}.page-content {padding:22px 14px 32px;}.topbar-actions {gap:10px;}.demo-indicator {font-size:8px;}.breadcrumbs {font-size:10px;gap:7px;} }
  `]
})
export class MainLayoutComponent {
  protected readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  protected readonly menuOpen = signal(false);
  protected readonly pageTitle = signal(this.titleFromPath(this.router.url));
  constructor() {
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.pageTitle.set(this.titleFromPath(event.urlAfterRedirects)));
  }
  private titleFromPath(path: string): string {
    const segment = path.split('/').filter(Boolean).pop() ?? 'dashboard';
    const known: Record<string, string> = { dashboard: 'Dashboard', discovery: 'Business Discovery', leads: 'All Leads', 'website-audit': 'Website Audit', 'ai-analysis': 'AI Analysis', 'message-approval': 'Message Approval', reports: 'Reports', settings: 'Settings' };
    return known[segment] ?? 'Dashboard';
  }
}
