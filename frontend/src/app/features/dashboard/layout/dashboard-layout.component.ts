import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MenubarModule,
    SidebarModule,
    ButtonModule,
    MenuModule,
    AvatarModule
  ],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex">
              <div class="flex-shrink-0 flex items-center">
                <h1 class="text-2xl font-bold text-primary">SmartSpend</h1>
              </div>
            </div>
            
            <div class="flex items-center">
              <p-avatar icon="pi pi-user" styleClass="mr-2" shape="circle"></p-avatar>
              <p-menu #menu [popup]="true" [model]="userMenuItems"></p-menu>
              <p-button icon="pi pi-ellipsis-v" (click)="menu.toggle($event)" 
                        styleClass="p-button-text p-button-rounded"></p-button>
            </div>
          </div>
        </div>
      </header>

      <div class="flex">
        <!-- Sidebar -->
        <aside class="w-64 bg-white shadow-sm h-[calc(100vh-4rem)] fixed">
          <nav class="mt-5 px-2">
            <a routerLink="/dashboard/overview" routerLinkActive="bg-gray-100" 
               class="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
              <i class="pi pi-home mr-3 text-gray-400 group-hover:text-gray-500"></i>
              Overview
            </a>
            
            <a routerLink="/dashboard/budgets" routerLinkActive="bg-gray-100"
               class="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
              <i class="pi pi-wallet mr-3 text-gray-400 group-hover:text-gray-500"></i>
              Budgets
            </a>
            
            <a routerLink="/dashboard/transactions" routerLinkActive="bg-gray-100"
               class="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
              <i class="pi pi-list mr-3 text-gray-400 group-hover:text-gray-500"></i>
              Transactions
            </a>
            
            <a routerLink="/dashboard/analytics" routerLinkActive="bg-gray-100"
               class="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
              <i class="pi pi-chart-line mr-3 text-gray-400 group-hover:text-gray-500"></i>
              Analytics
            </a>
          </nav>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 ml-64">
          <div class="py-6">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <router-outlet></router-outlet>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep {
      .p-menu {
        min-width: 200px;
      }
    }
  `]
})
export class DashboardLayoutComponent {
  constructor(
    private authService: AuthService) { }

  userMenuItems: MenuItem[] = [
    {
      label: 'Profile',
      icon: 'pi pi-user'
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog'
    },
    {
      separator: true
    },
    {
      label: 'Sign out',
      icon: 'pi pi-sign-out',
      command: () => {
        this.authService.logout();
      }
    }
  ];
} 