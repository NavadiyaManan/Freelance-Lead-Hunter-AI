import { Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { DashboardService } from "../../core/services/dashboard.service";

@Component({
  selector: "app-dashboard",
  template: `
    <div class="page-heading"><div><div class="eyebrow"><span class="live-dot"></span> YOUR WORKSPACE</div><h1>Good morning, Manan <span class="wave" aria-hidden="true">&#10022;</span></h1><p class="subtitle">A clear view of your lead discovery activity.</p></div><a class="primary-link" routerLink="/discovery"><i class="pi pi-plus"></i> Discover businesses</a></div>
    @if (noticeVisible) {
      <div class="demo-note"><i class="pi pi-info-circle"></i><span><strong>Dashboard API</strong> &mdash; development seed records are labeled and are not verified prospects.</span><button aria-label="Dismiss notice" (click)="noticeVisible = false"><i class="pi pi-times"></i></button></div>
    }
    @if (data.loading()) {
      <div class="demo-note" role="status"><i class="pi pi-spin pi-spinner"></i><span>Loading dashboard data...</span></div>
    } @else if (data.error()) {
      <div class="demo-note error-alert" role="alert"><i class="pi pi-exclamation-triangle"></i><span>{{ data.error() }}</span><button class="primary-link" type="button" style="border:0;cursor:pointer" (click)="data.load()"><i class="pi pi-refresh"></i> Retry</button></div>
    } @else {
      <section class="stats-grid" aria-label="Lead statistics">
        <article class="stat-card"><div class="stat-top"><span>Total businesses</span><span class="stat-icon indigo"><i class="pi pi-building"></i></span></div><strong>{{ data.total() }}</strong><div class="stat-foot"><span class="neutral-pill">Non-deleted records</span></div></article>
        <article class="stat-card"><div class="stat-top"><span>New leads</span><span class="stat-icon blue"><i class="pi pi-sparkles"></i></span></div><strong>{{ data.newLeads() }}</strong><div class="stat-foot"><span class="neutral-pill">Last 30 UTC days</span></div></article>
        <article class="stat-card"><div class="stat-top"><span>Qualified leads</span><span class="stat-icon green"><i class="pi pi-check-circle"></i></span></div><strong>{{ data.qualified() }}</strong><div class="stat-foot"><span class="neutral-pill">All time</span></div></article>
        <article class="stat-card"><div class="stat-top"><span>Interested prospects</span><span class="stat-icon amber"><i class="pi pi-heart"></i></span></div><strong>{{ data.interested() }}</strong><div class="stat-foot"><span class="neutral-pill">All time</span></div></article>
      </section>
      <div class="dashboard-grid">
        <section class="panel recent">
          <div class="panel-head"><div><h2>Recent businesses</h2><p>Latest records in your workspace</p></div><a routerLink="/discovery">View all <i class="pi pi-arrow-right"></i></a></div>
          @if (data.recentLeads().length > 0) {
            <div class="table-wrap"><table><thead><tr><th>BUSINESS</th><th>CATEGORY</th><th>LOCATION</th><th>RATING</th></tr></thead><tbody>
              @for (business of data.recentLeads(); track business.id) {
                <tr><td><div class="biz-cell"><span class="biz-avatar">{{ initials(business.businessName) }}</span><span><strong>{{ business.businessName }}</strong>@if (business.source === "Development seed") { <small class="development-badge">DEVELOPMENT DATA</small> }</span></div></td><td><span class="category-pill">{{ business.categoryName ?? "Uncategorized" }}</span></td><td>{{ location(business.city, business.country) }}</td><td><span class="rating">@if (business.rating !== null) { <i class="pi pi-star-fill"></i> } {{ business.rating ?? "—" }}</span></td></tr>
              }
            </tbody></table></div>
          } @else {
            <div class="dashboard-empty"><strong>No recent businesses</strong><span>Businesses will appear here when they are available in the dashboard data.</span></div>
          }
          <div class="table-foot">Ratings and reviews are shown only when supplied <span>Showing {{ data.recentLeads().length }} of {{ data.total() }}</span></div>
        </section>
        <section class="panel distribution">
          <div class="panel-head"><div><h2>Business categories</h2><p>Distribution in your dataset</p></div></div>
          @if (data.populatedCategories().length > 0) {
            <div class="chart-summary"><div class="donut" [style.background]="categoryGradient()"><div><strong>{{ data.total() }}</strong><small>businesses</small></div></div><div class="legend">
              @for (category of data.populatedCategories(); track category.categoryId ?? category.categoryCode; let index = $index) {
                <div><i class="legend-dot" [style.background]="categoryColor(index)"></i><span>{{ category.categoryName }}</span><strong>{{ category.leadCount }}</strong></div>
              }
            </div></div>
          } @else {
            <div class="dashboard-empty"><strong>No category data yet</strong><span>Category totals will appear when businesses are categorized.</span></div>
          }
          <div class="source-foot"><i class="pi pi-database"></i> Based on dashboard API records</div>
        </section>
        <section class="panel status-panel">
          <div class="panel-head"><div><h2>Lead status overview</h2><p>Pipeline status across records</p></div><a routerLink="/leads">View pipeline <i class="pi pi-arrow-right"></i></a></div>
          @if (data.total() > 0) {
            <div class="status-bars">
              @for (status of data.statusDistribution(); track status.statusCode) {
                <div class="status-row"><div><span class="status-label"><i class="status-dot s-{{ status.statusCode.toLowerCase() }}"></i>{{ status.statusName }}</span><strong>{{ status.leadCount }}</strong></div><div class="progress"><span class="fill-{{ status.statusCode.toLowerCase() }}" [style.width.%]="percent(status.leadCount)"></span></div></div>
              }
            </div>
          } @else {
            <div class="dashboard-empty"><strong>No leads yet</strong><span>The status breakdown will appear when the dashboard has leads.</span></div>
          }
        </section>
        <section class="panel getting-started"><div class="panel-head"><div><h2>Getting started</h2><p>Your path from discovery to outreach</p></div><span class="step-count">1 of 5</span></div><div class="steps"><div class="step active"><span class="step-number">1</span><div><strong>Discover businesses</strong><small>Find potential clients in your target market</small></div><i class="pi pi-arrow-right"></i></div><div class="step"><span class="step-number">2</span><div><strong>Audit websites</strong><small>Identify online presence opportunities</small></div><i class="pi pi-lock"></i></div><div class="step"><span class="step-number">3</span><div><strong>Analyze opportunities</strong><small>Qualify leads with AI powered insights</small></div><i class="pi pi-lock"></i></div><div class="step"><span class="step-number">4</span><div><strong>Generate messages</strong><small>Prepare personalized outreach drafts</small></div><i class="pi pi-lock"></i></div><div class="step"><span class="step-number">5</span><div><strong>Approve outreach</strong><small>Review every message before sending</small></div><i class="pi pi-lock"></i></div></div></section>
        <section class="panel trend-panel">
          <div class="panel-head"><div><h2>Daily lead creation trend</h2><p>Last 30 UTC days</p></div></div>
          @if (data.total() > 0) {
            <div class="trend-scroll"><div class="trend-chart" role="img" aria-label="Daily lead creation counts for the last 30 UTC days">
              @for (point of data.leadTrend(); track point.date; let index = $index) {
                <div class="trend-day" [attr.aria-label]="point.date + ': ' + point.leadCount + ' leads'"><span class="trend-count">{{ point.leadCount }}</span><div class="trend-track"><span class="trend-bar" [style.height.%]="trendHeight(point.leadCount)"></span></div><small class="trend-date">{{ trendLabel(point.date, index) }}</small></div>
              }
            </div></div>
          } @else {
            <div class="dashboard-empty"><strong>No trend data yet</strong><span>Daily lead creation will appear here once leads are recorded.</span></div>
          }
        </section>
      </div>
    }
  `,  styles: [`
    :host{display:block;color:var(--text-color)}.page-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:22px}.eyebrow{display:flex;align-items:center;gap:7px;color:#6874dd;font-size:9px;font-weight:800;letter-spacing:1.4px}.live-dot{width:6px;height:6px;border-radius:50%;background:#6574ec}h1{margin:8px 0 5px;font-size:26px;letter-spacing:-.8px;font-weight:720}.wave{font-size:19px;color:#ecb65d}.subtitle{margin:0;color:var(--text-color-secondary);font-size:12px}.primary-link{height:37px;padding:0 14px;display:inline-flex;align-items:center;gap:8px;border-radius:8px;background:#5967e9;color:white;text-decoration:none;font-size:11px;font-weight:650;box-shadow:0 4px 10px #5967e92a}.primary-link .pi{font-size:10px}.demo-note{height:40px;display:flex;align-items:center;gap:9px;padding:0 12px;margin-bottom:17px;border:1px solid #e9e4d0;border-radius:8px;background:#fffdf6;color:#686354;font-size:10px}.app-dark .demo-note{background:#2c291f;border-color:#4b4530;color:#c9c2a8}.demo-note>.pi{color:#c99b44;font-size:12px}.demo-note strong{font-weight:720}.demo-note button{margin-left:auto;border:0;background:transparent;color:inherit;cursor:pointer;font-size:10px}.notice-dismissed{margin:10px 0 18px;padding:10px;color:var(--text-color-secondary);font-size:11px}.stats-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:17px}.stat-card,.panel{background:var(--surface-card);border:1px solid var(--surface-border);border-radius:11px;box-shadow:0 2px 8px #1d26400a}.stat-card{padding:16px 17px 14px;min-height:124px}.stat-top{display:flex;align-items:center;justify-content:space-between;color:var(--text-color-secondary);font-size:10px;font-weight:550}.stat-icon{width:29px;height:29px;display:grid;place-items:center;border-radius:8px;font-size:12px}.indigo{color:#5f69df;background:#eff0ff}.blue{color:#3c91d5;background:#eaf6ff}.green{color:#2ea579;background:#e7f7f0}.amber{color:#c18a32;background:#fff5e4}.app-dark .indigo{background:#34375d}.app-dark .blue{background:#1e3a50}.app-dark .green{background:#1c4137}.app-dark .amber{background:#493d28}.stat-card>strong{display:block;margin:8px 0 9px;font-size:23px;letter-spacing:-.6px}.stat-foot{display:flex;align-items:center}.neutral-pill{color:var(--text-color-secondary);font-size:9px}.panel{padding:16px 17px}.dashboard-grid{display:grid;grid-template-columns:1.45fr 1fr;gap:14px}.recent{grid-column:1}.distribution{grid-column:2}.status-panel{grid-column:1}.getting-started{grid-column:2}.panel-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px}.panel-head h2{margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:-.1px}.panel-head p{margin:0;color:var(--text-color-secondary);font-size:9px}.panel-head>a{margin-top:3px;color:#5967e9;text-decoration:none;font-size:9px;font-weight:650}.panel-head>a .pi{font-size:8px;margin-left:4px}.table-wrap{overflow-x:auto}table{width:100%;border-collapse:collapse;white-space:nowrap}th{text-align:left;padding:9px 8px;color:var(--text-color-secondary);font-size:8px;letter-spacing:.7px;font-weight:750;border-bottom:1px solid var(--surface-border)}td{padding:10px 8px;border-bottom:1px solid var(--surface-border);color:var(--text-color-secondary);font-size:9px}tbody tr:last-child td{border-bottom:0}.biz-cell{display:flex;align-items:center;gap:8px;color:var(--text-color)}.biz-cell strong{font-size:9px;font-weight:630}.biz-avatar{width:25px;height:25px;display:grid;place-items:center;flex:0 0 25px;border-radius:7px;background:#f0edff;color:#7461ce;font-size:8px;font-weight:750}.app-dark .biz-avatar{background:#33304e;color:#b4a6ff}.category-pill{padding:4px 6px;border-radius:5px;background:var(--surface-ground);font-size:8px}.rating{color:var(--text-color-secondary)}.rating .pi{color:#e8b149;font-size:8px}.table-foot{display:flex;justify-content:space-between;padding-top:9px;border-top:1px solid var(--surface-border);color:var(--text-color-secondary);font-size:8px}.table-foot span{font-weight:650}.dots{border:0;background:transparent;color:var(--text-color-secondary);font-size:11px}.chart-summary{display:flex;align-items:center;justify-content:space-around;min-height:122px}.donut{width:116px;height:116px;display:grid;place-items:center;border-radius:50%;background:conic-gradient(#7178eb 0deg 360deg);position:relative}.donut:before{content:'';position:absolute;inset:10px;border-radius:50%;background:var(--surface-card)}.donut>div{z-index:1;display:grid;text-align:center;gap:2px}.donut strong{font-size:19px}.donut small{font-size:8px;color:var(--text-color-secondary)}.legend{display:grid;gap:15px}.legend>div{display:grid;grid-template-columns:9px auto auto;align-items:center;gap:7px;font-size:9px;color:var(--text-color-secondary)}.legend strong{color:var(--text-color);font-size:9px}.legend-dot{width:7px;height:7px;border-radius:50%}.legend-dot.violet{background:#7178eb}.legend-dot.gray{background:#dce0ec}.muted-legend{opacity:.55}.source-foot{margin-top:10px;padding-top:9px;border-top:1px solid var(--surface-border);color:var(--text-color-secondary);font-size:8px}.source-foot .pi{font-size:9px;margin-right:5px}.status-bars{display:grid;gap:12px}.status-row>div:first-child{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}.status-label{display:flex;align-items:center;gap:7px;color:var(--text-color-secondary);font-size:9px}.status-row strong{font-size:9px}.status-dot{width:7px;height:7px;border-radius:50%}.s-new,.fill-new{background:#6474e9}.s-qualified,.fill-qualified{background:#32ab83}.s-contacted,.fill-contacted{background:#e6ac45}.s-interested,.fill-interested{background:#b076d9}.progress{height:5px;border-radius:6px;background:var(--surface-ground);overflow:hidden}.progress span{display:block;height:100%;border-radius:6px;min-width:0}.step-count{padding:4px 7px;border-radius:5px;background:#f0f1ff;color:#636fe4;font-size:8px;font-weight:700}.app-dark .step-count{background:#34375d;color:#b0b7ff}.steps{display:grid;gap:8px}.step{display:flex;align-items:center;gap:9px;min-height:36px;padding:4px 6px;border-radius:7px}.step.active{background:#f5f5ff}.app-dark .step.active{background:#252943}.step-number{width:22px;height:22px;display:grid;place-items:center;flex:0 0 22px;border:1px solid var(--surface-border);border-radius:50%;color:var(--text-color-secondary);font-size:9px;font-weight:700}.step.active .step-number{border-color:#6a75eb;background:#6a75eb;color:white}.step>div{display:grid;gap:3px}.step strong{font-size:9px;font-weight:650}.step small{color:var(--text-color-secondary);font-size:8px}.step>.pi{margin-left:auto;color:#a2a8b7;font-size:9px}.step.active>.pi{color:#6874dd}
    @media(max-width:1050px){.stats-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.dashboard-grid{grid-template-columns:1fr 1fr}.recent{grid-column:span 2}.distribution,.status-panel,.getting-started{grid-column:auto}}
    @media(max-width:680px){.page-heading{align-items:flex-start;gap:12px}.page-heading h1{font-size:21px}.primary-link{white-space:nowrap;padding:0 10px;font-size:9px}.dashboard-grid{grid-template-columns:1fr}.recent,.distribution,.status-panel,.getting-started{grid-column:1}.stats-grid{gap:9px}.stat-card{padding:13px;min-height:115px}.panel{padding:14px}.table-foot{font-size:7px}}
    .development-badge{display:inline-block;margin-top:3px;padding:2px 5px;border-radius:4px;background:#fff5df;color:#9a7535;font-size:7px;font-weight:750;letter-spacing:.35px}.dashboard-empty{display:grid;justify-items:center;gap:7px;padding:20px 10px;color:var(--text-color-secondary);text-align:center;font-size:9px}.dashboard-empty strong{color:var(--text-color);font-size:10px}.trend-panel{grid-column:1/-1}.trend-scroll{overflow-x:auto}.trend-chart{display:grid;grid-template-columns:repeat(30,minmax(15px,1fr));gap:5px;min-width:620px;height:145px;align-items:end;padding:8px 2px 0}.trend-day{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:4px}.trend-count{min-height:9px;color:var(--text-color-secondary);font-size:7px}.trend-track{width:100%;height:105px;display:flex;align-items:flex-end;overflow:hidden;border-radius:4px 4px 0 0;background:var(--surface-ground)}.trend-bar{width:100%;min-height:2px;border-radius:4px 4px 0 0;background:#7178eb;transition:height .2s ease}.trend-date{min-height:9px;color:var(--text-color-secondary);font-size:7px;white-space:nowrap}.error-alert{border-color:#f0d3d3;background:#fff7f7;color:#8a3d42}.app-dark .error-alert{border-color:#573638;background:#352426;color:#edb9bb}.distribution .legend{max-height:160px;overflow:auto}
  `]
})
export class DashboardComponent {
  protected readonly data = inject(DashboardService);
  protected noticeVisible = true;
  private readonly categoryColors = ["#7178eb", "#48a88c", "#e7ab45", "#b076d9", "#4c9dd0", "#d87678"];

  constructor() {
    this.data.load();
  }

  protected initials(name: string): string {
    return name.trim().split(" ").slice(0, 2).map((word) => word[0] ?? "").join("").toUpperCase();
  }

  protected location(city: string | null, country: string | null): string {
    return [city, country].filter((part): part is string => !!part).join(", ") || "—";
  }

  protected percent(value: number): number {
    return this.data.total() ? Math.round(value / this.data.total() * 100) : 0;
  }

  protected categoryColor(index: number): string {
    return this.categoryColors[index % this.categoryColors.length];
  }

  protected categoryGradient(): string {
    const categories = this.data.populatedCategories();
    const total = categories.reduce((sum, item) => sum + item.leadCount, 0);
    if (!total) return "conic-gradient(#dce0ec 0deg 360deg)";
    let start = 0;
    const slices = categories.map((item, index) => {
      const end = start + item.leadCount / total * 360;
      const slice = this.categoryColor(index) + " " + start + "deg " + end + "deg";
      start = end;
      return slice;
    });
    return "conic-gradient(" + slices.join(", ") + ")";
  }

  protected trendHeight(value: number): number {
    const peak = Math.max(1, ...this.data.leadTrend().map((item) => item.leadCount));
    return value === 0 ? 2 : Math.max(5, value / peak * 100);
  }

  protected trendLabel(date: string, index: number): string {
    const lastIndex = this.data.leadTrend().length - 1;
    return index === 0 || index % 5 === 0 || index === lastIndex ? date.slice(5) : "";
  }
}
