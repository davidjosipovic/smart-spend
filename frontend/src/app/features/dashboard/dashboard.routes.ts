import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layout/dashboard-layout.component';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      },
      {
        path: 'overview',
        loadComponent: () => import('./pages/overview/overview.component').then(m => m.OverviewComponent)
      },
      {
        path: 'budgets',
        loadComponent: () => import('./pages/budgets/budgets.component').then(m => m.BudgetsComponent)
      },
      {
        path: 'transactions',
        loadComponent: () => import('./pages/transactions/transactions.component').then(m => m.TransactionsComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./pages/analytics/analytics.component').then(m => m.AnalyticsComponent)
      },
      {
        path: 'bank-connection',
        loadComponent: () => import('./pages/bank-connection/bank-connection.component').then(m => m.BankConnectionComponent)
      },
      {
        path: 'callback',
        loadComponent: () => import('./pages/bank-callback/bank-callback.component').then(m => m.BankCallbackComponent)
      }
    ]
  }
]; 