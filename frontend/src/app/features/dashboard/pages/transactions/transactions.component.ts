import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    CalendarModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-semibold text-gray-900">Transactions</h2>
        <p-button label="Add Transaction" icon="pi pi-plus" (click)="showCreateDialog()"></p-button>
      </div>

      <!-- Filters -->
      <div class="bg-white p-4 rounded-lg shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <p-calendar formControlName="dateRange" selectionMode="range" 
                       [showButtonBar]="true" styleClass="w-full">
            </p-calendar>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <p-dropdown formControlName="category" [options]="categories" 
                       optionLabel="name" placeholder="All Categories"
                       styleClass="w-full">
            </p-dropdown>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <p-dropdown formControlName="type" [options]="types" 
                       placeholder="All Types"
                       styleClass="w-full">
            </p-dropdown>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <span class="p-input-icon-left w-full">
              <i class="pi pi-search"></i>
              <input type="text" pInputText formControlName="search" 
                     placeholder="Search transactions" class="w-full">
            </span>
          </div>
        </div>
      </div>

      <!-- Transactions Table -->
      <p-table [value]="transactions" [paginator]="true" [rows]="10" 
               [showCurrentPageReport]="true" currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
               [rowsPerPageOptions]="[10,25,50]" styleClass="p-datatable-sm">
        <ng-template pTemplate="header">
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Type</th>
            <th class="text-right">Amount</th>
            <th class="text-center">Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-transaction>
          <tr>
            <td>{{ transaction.date | date:'mediumDate' }}</td>
            <td>{{ transaction.description }}</td>
            <td>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [ngClass]="getCategoryClass(transaction.category)">
                {{ transaction.category }}
              </span>
            </td>
            <td>
              <span class="inline-flex items-center">
                <i class="pi" [ngClass]="transaction.type === 'income' ? 'pi-arrow-up text-green-600' : 'pi-arrow-down text-red-600'"></i>
                <span class="ml-1">{{ transaction.type }}</span>
              </span>
            </td>
            <td class="text-right" [ngClass]="transaction.type === 'income' ? 'text-green-600' : 'text-red-600'">
              {{ transaction.type === 'income' ? '+' : '-' }}€{{ transaction.amount }}
            </td>
            <td class="text-center">
              <p-button icon="pi pi-pencil" styleClass="p-button-text p-button-rounded mr-2"></p-button>
              <p-button icon="pi pi-trash" styleClass="p-button-text p-button-rounded p-button-danger"></p-button>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <!-- Create Transaction Dialog -->
      <p-dialog header="Add Transaction" [(visible)]="showDialog" [style]="{width: '450px'}" [modal]="true">
        <form [formGroup]="transactionForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
            <input id="description" type="text" pInputText formControlName="description" 
                   class="w-full mt-1" placeholder="Enter description">
          </div>

          <div>
            <label for="amount" class="block text-sm font-medium text-gray-700">Amount</label>
            <p-inputNumber id="amount" formControlName="amount" mode="currency" currency="EUR" locale="en-US"
                          styleClass="w-full mt-1">
            </p-inputNumber>
          </div>

          <div>
            <label for="category" class="block text-sm font-medium text-gray-700">Category</label>
            <p-dropdown id="category" formControlName="category" [options]="categories" 
                       optionLabel="name" placeholder="Select a category"
                       styleClass="w-full mt-1">
            </p-dropdown>
          </div>

          <div>
            <label for="type" class="block text-sm font-medium text-gray-700">Type</label>
            <p-dropdown id="type" formControlName="type" [options]="types" 
                       placeholder="Select type"
                       styleClass="w-full mt-1">
            </p-dropdown>
          </div>

          <div>
            <label for="date" class="block text-sm font-medium text-gray-700">Date</label>
            <p-calendar id="date" formControlName="date" [showButtonBar]="true"
                       styleClass="w-full mt-1">
            </p-calendar>
          </div>

          <div class="flex justify-end space-x-2">
            <p-button label="Cancel" styleClass="p-button-text" (click)="showDialog = false"></p-button>
            <p-button label="Add" type="submit"></p-button>
          </div>
        </form>
      </p-dialog>
    </div>
  `
})
export class TransactionsComponent {
  showDialog = false;
  transactionForm: FormGroup;
  filterForm: FormGroup;

  categories = [
    { name: 'Housing', value: 'housing' },
    { name: 'Food', value: 'food' },
    { name: 'Transport', value: 'transport' },
    { name: 'Entertainment', value: 'entertainment' },
    { name: 'Utilities', value: 'utilities' }
  ];

  types = [
    'Income',
    'Expense'
  ];

  transactions = [
    {
      date: new Date('2024-03-15'),
      description: 'Salary Deposit',
      category: 'Income',
      type: 'income',
      amount: 4200
    },
    {
      date: new Date('2024-03-14'),
      description: 'Grocery Shopping',
      category: 'Food',
      type: 'expense',
      amount: 120
    },
    {
      date: new Date('2024-03-13'),
      description: 'Electric Bill',
      category: 'Utilities',
      type: 'expense',
      amount: 85
    },
    {
      date: new Date('2024-03-12'),
      description: 'Freelance Payment',
      category: 'Income',
      type: 'income',
      amount: 750
    }
  ];

  constructor(private fb: FormBuilder) {
    this.transactionForm = this.fb.group({
      description: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      type: ['expense', Validators.required],
      date: [new Date(), Validators.required]
    });

    this.filterForm = this.fb.group({
      dateRange: [null],
      category: [null],
      type: [null],
      search: ['']
    });
  }

  getCategoryClass(category: string): string {
    const classes: { [key: string]: string } = {
      'Housing': 'bg-blue-100 text-blue-800',
      'Food': 'bg-green-100 text-green-800',
      'Transport': 'bg-yellow-100 text-yellow-800',
      'Entertainment': 'bg-purple-100 text-purple-800',
      'Utilities': 'bg-red-100 text-red-800',
      'Income': 'bg-emerald-100 text-emerald-800'
    };
    return classes[category] || 'bg-gray-100 text-gray-800';
  }

  showCreateDialog() {
    this.showDialog = true;
  }

  onSubmit() {
    if (this.transactionForm.valid) {
      console.log(this.transactionForm.value);
      this.showDialog = false;
    }
  }
} 