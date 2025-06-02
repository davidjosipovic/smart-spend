import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ChartModule,
    DropdownModule,
    FormsModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-semibold text-gray-900">Analytics</h2>
        <p-dropdown [options]="timeRanges" [(ngModel)]="selectedTimeRange"
                   placeholder="Select Time Range" styleClass="w-48">
        </p-dropdown>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <p-card styleClass="shadow-none border">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100 text-blue-600">
              <i class="pi pi-chart-line text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Income</p>
              <p class="text-2xl font-semibold text-gray-900">€12,500</p>
              <p class="text-sm text-green-600">+12.5% from last month</p>
            </div>
          </div>
        </p-card>

        <p-card styleClass="shadow-none border">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-red-100 text-red-600">
              <i class="pi pi-chart-bar text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Expenses</p>
              <p class="text-2xl font-semibold text-gray-900">€8,200</p>
              <p class="text-sm text-red-600">+5.2% from last month</p>
            </div>
          </div>
        </p-card>

        <p-card styleClass="shadow-none border">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100 text-green-600">
              <i class="pi pi-wallet text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Net Savings</p>
              <p class="text-2xl font-semibold text-gray-900">€4,300</p>
              <p class="text-sm text-green-600">+25.8% from last month</p>
            </div>
          </div>
        </p-card>

        <p-card styleClass="shadow-none border">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-purple-100 text-purple-600">
              <i class="pi pi-percentage text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Savings Rate</p>
              <p class="text-2xl font-semibold text-gray-900">34.4%</p>
              <p class="text-sm text-green-600">+3.2% from last month</p>
            </div>
          </div>
        </p-card>
      </div>

      <!-- Main Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <p-card header="Income vs Expenses" styleClass="shadow-none border">
          <p-chart type="line" [data]="incomeExpensesData" [options]="chartOptions"></p-chart>
        </p-card>

        <p-card header="Expense Distribution" styleClass="shadow-none border">
          <p-chart type="doughnut" [data]="expenseDistributionData" [options]="chartOptions"></p-chart>
        </p-card>
      </div>

      <!-- Additional Insights -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <p-card header="Top Spending Categories" styleClass="shadow-none border">
          <div class="space-y-4">
            <div *ngFor="let category of topCategories" class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-2 h-2 rounded-full mr-2" [ngStyle]="{'background-color': category.color}"></div>
                <span class="text-gray-700">{{ category.name }}</span>
              </div>
              <div class="text-right">
                <p class="text-gray-900 font-medium">€{{ category.amount }}</p>
                <p class="text-sm" [ngClass]="category.trend > 0 ? 'text-red-600' : 'text-green-600'">
                  {{ category.trend > 0 ? '+' : '' }}{{ category.trend }}%
                </p>
              </div>
            </div>
          </div>
        </p-card>

        <p-card header="Monthly Trends" styleClass="shadow-none border">
          <p-chart type="bar" [data]="monthlyTrendsData" [options]="chartOptions"></p-chart>
        </p-card>
      </div>
    </div>
  `
})
export class AnalyticsComponent {
  timeRanges = [
    'Last 7 Days',
    'Last 30 Days',
    'Last 3 Months',
    'Last 6 Months',
    'Last Year'
  ];
  selectedTimeRange = 'Last 30 Days';

  incomeExpensesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Income',
        data: [4200, 3800, 4500, 4100, 4800, 4200],
        borderColor: '#22c55e',
        tension: 0.4
      },
      {
        label: 'Expenses',
        data: [2800, 3100, 2900, 3200, 2800, 2800],
        borderColor: '#ef4444',
        tension: 0.4
      }
    ]
  };

  expenseDistributionData = {
    labels: ['Housing', 'Food', 'Transport', 'Entertainment', 'Utilities'],
    datasets: [
      {
        data: [35, 25, 15, 15, 10],
        backgroundColor: ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6']
      }
    ]
  };

  monthlyTrendsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Savings Rate',
        data: [28, 32, 30, 35, 38, 34],
        backgroundColor: '#3b82f6'
      }
    ]
  };

  chartOptions = {
    plugins: {
      legend: {
        position: 'bottom'
      }
    },
    maintainAspectRatio: false
  };

  topCategories = [
    {
      name: 'Housing',
      amount: 1200,
      trend: 5.2,
      color: '#3b82f6'
    },
    {
      name: 'Food',
      amount: 850,
      trend: -2.1,
      color: '#22c55e'
    },
    {
      name: 'Transport',
      amount: 450,
      trend: 8.5,
      color: '#eab308'
    },
    {
      name: 'Entertainment',
      amount: 320,
      trend: 12.3,
      color: '#ef4444'
    },
    {
      name: 'Utilities',
      amount: 280,
      trend: -1.5,
      color: '#8b5cf6'
    }
  ];
}
