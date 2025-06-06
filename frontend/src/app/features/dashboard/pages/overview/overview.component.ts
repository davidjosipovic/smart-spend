import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ChartModule,
    ButtonModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-semibold text-gray-900">Overview</h2>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <p-card styleClass="shadow-none border">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100 text-blue-600">
              <i class="pi pi-wallet text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Balance</p>
              <p class="text-2xl font-semibold text-gray-900">€{{ analytics?.total_balance || 0 }}</p>
            </div>
          </div>
        </p-card>

        <p-card styleClass="shadow-none border">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100 text-green-600">
              <i class="pi pi-arrow-up text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Income</p>
              <p class="text-2xl font-semibold text-gray-900">€{{ analytics?.total_income || 0 }}</p>
            </div>
          </div>
        </p-card>

        <p-card styleClass="shadow-none border">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-red-100 text-red-600">
              <i class="pi pi-arrow-down text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Expenses</p>
              <p class="text-2xl font-semibold text-gray-900">€{{ analytics?.total_expenses || 0 }}</p>
            </div>
          </div>
        </p-card>

        <p-card styleClass="shadow-none border">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-purple-100 text-purple-600">
              <i class="pi pi-chart-pie text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Savings</p>
              <p class="text-2xl font-semibold text-gray-900">€{{ analytics?.savings || 0 }}</p>
            </div>
          </div>
        </p-card>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <p-card header="Monthly Overview" styleClass="shadow-none border h-full">
          <div class="flex items-center h-full w-full">
            <p-chart type="line" [data]="monthlyData" [options]="chartOptions" [style]="{'display': 'block', 'width': '100%'}"></p-chart>
          </div>
        </p-card>

        <p-card header="Expense Categories" styleClass="shadow-none border h-full">
          <p-chart type="doughnut" [data]="categoryData" [options]="chartOptions"></p-chart>
        </p-card>
      </div>

      <!-- Recent Transactions -->
      <p-card header="Recent Transactions" styleClass="shadow-none border">
        <div class="space-y-4">
          <div *ngFor="let transaction of analytics?.recent_transactions" 
               class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center">
              <div class="p-2 rounded-full" [ngClass]="transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'">
                <i class="pi" [ngClass]="transaction.type === 'income' ? 'pi-arrow-up text-green-600' : 'pi-arrow-down text-red-600'"></i>
              </div>
              <div class="ml-4">
                <p class="font-medium text-gray-900">{{ transaction.description }}</p>
                <p class="text-sm text-gray-500">{{ transaction.date }}</p>
              </div>
            </div>
            <p class="font-medium" [ngClass]="transaction.type === 'income' ? 'text-green-600' : 'text-red-600'">
              {{ transaction.type === 'income' ? '+' : '-' }}€{{ transaction.amount }}
            </p>
          </div>
        </div>
      </p-card>
    </div>

    <style>
      :host ::ng-deep { 
        .p-card-body,
        .p-card-content {
          height: 100%;
        }
      }
    </style>
  `
})
export class OverviewComponent implements OnInit {
  analytics: any;
  monthlyData: any;
  categoryData: any;
  chartOptions = {
    plugins: {
      legend: {
        position: 'bottom'
      }
    },
    maintainAspectRatio: false
  };

  constructor(private http: HttpClient, private cdRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadAnalytics();
  }

  loadAnalytics() {
    this.http.get(`${environment.apiUrl}/transactions/analytics`).subscribe({
      next: (response: any) => {
        this.analytics = response.result;
        this.updateCharts();
        this.cdRef.detectChanges();
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
      }
    });
  }

  updateCharts() {
    // Update monthly data chart
    this.monthlyData = {
      labels: this.analytics.monthly_data.labels,
      datasets: [
        {
          label: 'Income',
          data: this.analytics.monthly_data.income,
          borderColor: '#22c55e',
          tension: 0.4
        },
        {
          label: 'Expenses',
          data: this.analytics.monthly_data.expenses,
          borderColor: '#ef4444',
          tension: 0.4
        }
      ]
    };

    // Update category data chart
    this.categoryData = {
      labels: this.analytics.category_data.labels,
      datasets: [
        {
          data: this.analytics.category_data.data,
          backgroundColor: [
            '#3b82f6', // blue
            '#22c55e', // green
            '#eab308', // yellow
            '#ef4444', // red
            '#8b5cf6', // purple
            '#f97316', // orange
            '#06b6d4', // cyan
            '#ec4899'  // pink
          ]
        }
      ]
    };
  }
} 