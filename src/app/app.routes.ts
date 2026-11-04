import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { DiscoveryComponent } from './features/discovery/discovery.component';
import { PlaceholderComponent } from './features/placeholder/placeholder.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: DashboardComponent, title: 'Dashboard' },
  { path: 'discovery', component: DiscoveryComponent, title: 'Business Discovery' },
  { path: 'leads', component: PlaceholderComponent, title: 'All Leads', data: { heading: 'All Leads' } },
  { path: 'website-audit', component: PlaceholderComponent, title: 'Website Audit', data: { heading: 'Website Audit' } },
  { path: 'ai-analysis', component: PlaceholderComponent, title: 'AI Analysis', data: { heading: 'AI Analysis' } },
  { path: 'message-approval', component: PlaceholderComponent, title: 'Message Approval', data: { heading: 'Message Approval' } },
  { path: 'reports', component: PlaceholderComponent, title: 'Reports', data: { heading: 'Reports' } },
  { path: 'settings', component: PlaceholderComponent, title: 'Settings', data: { heading: 'Settings' } },
  { path: '**', redirectTo: 'dashboard' }
];
