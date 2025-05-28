import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';

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
        <p-button label="Add Transaction" icon="pi pi-plus"></p-button>
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
              <p class="text-2xl font-semibold text-gray-900">$24,500</p>
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
              <p class="text-2xl font-semibold text-gray-900">$4,200</p>
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
              <p class="text-2xl font-semibold text-gray-900">$2,800</p>
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
              <p class="text-2xl font-semibold text-gray-900">$1,400</p>
            </div>
          </div>
        </p-card>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <p-card header="Monthly Overview" styleClass="shadow-none border">
          <p-chart type="line" [data]="monthlyData" [options]="chartOptions"></p-chart>
        </p-card>

        <p-card header="Expense Categories" styleClass="shadow-none border">
          <p-chart type="doughnut" [data]="categoryData" [options]="chartOptions"></p-chart>
        </p-card>
      </div>

      <!-- Recent Transactions -->
      <p-card header="Recent Transactions" styleClass="shadow-none border">
        <div class="space-y-4">
          <div *ngFor="let transaction of recentTransactions" 
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
  `
})
export class OverviewComponent {
  monthlyData = {
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

  categoryData = {
    labels: ['Housing', 'Food', 'Transport', 'Entertainment', 'Utilities'],
    datasets: [
      {
        data: [35, 25, 15, 15, 10],
        backgroundColor: ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6']
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

  recentTransactions = [
    {
      description: 'Salary Deposit',
      date: 'Today, 10:30 AM',
      amount: '4,200',
      type: 'income'
    },
    {
      description: 'Grocery Shopping',
      date: 'Yesterday, 2:15 PM',
      amount: '120',
      type: 'expense'
    },
    {
      description: 'Electric Bill',
      date: 'Mar 15, 2024',
      amount: '85',
      type: 'expense'
    },
    {
      description: 'Freelance Payment',
      date: 'Mar 14, 2024',
      amount: '750',
      type: 'income'
    }
  ];
} 