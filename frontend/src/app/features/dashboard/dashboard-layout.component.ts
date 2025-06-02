import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container-fluid">
          <a class="navbar-brand" routerLink="/dashboard">Smart Spend</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav">
              <li class="nav-item">
                <a class="nav-link" routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Overview</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/dashboard/transactions" routerLinkActive="active">Transactions</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/dashboard/bank-connection" routerLinkActive="active">Connect Bank</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <main class="container-fluid py-4">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    main {
      flex: 1;
    }
  `]
})
export class DashboardLayoutComponent {} 