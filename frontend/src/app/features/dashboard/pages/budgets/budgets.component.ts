import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ProgressBarModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-semibold text-gray-900">Budgets</h2>
        <p-button label="Create Budget" icon="pi pi-plus" (click)="showCreateDialog()"></p-button>
      </div>

      <!-- Budget Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <p-card *ngFor="let budget of budgets" styleClass="shadow-none border">
          <div class="space-y-4">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg font-medium text-gray-900">{{ budget.category }}</h3>
                <p class="text-sm text-gray-500">{{ budget.period }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm text-gray-600">Spent</p>
                <p class="text-lg font-semibold text-gray-900">€{{ budget.spent }}</p>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-600">Progress</span>
                <span class="text-gray-900">{{ (budget.spent / budget.limit * 100).toFixed(0) }}%</span>
              </div>
              <p-progressBar [value]="budget.spent / budget.limit * 100" 
                           [showValue]="false"
                           [ngClass]="{'bg-red-100': budget.spent > budget.limit}">
              </p-progressBar>
            </div>

            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Budget Limit</span>
              <span class="text-gray-900">€{{ budget.limit }}</span>
            </div>

            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Remaining</span>
              <span [ngClass]="{'text-red-600': budget.spent > budget.limit, 'text-gray-900': budget.spent <= budget.limit}">
                €{{ budget.limit - budget.spent }}
              </span>
            </div>
          </div>
        </p-card>
      </div>

      <!-- Create Budget Dialog -->
      <p-dialog header="Create New Budget" [(visible)]="showDialog" [style]="{width: '450px'}" [modal]="true">
        <form [formGroup]="budgetForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label for="category" class="block text-sm font-medium text-gray-700">Category</label>
            <p-dropdown id="category" formControlName="category" [options]="categories" 
                       optionLabel="name" placeholder="Select a category"
                       styleClass="w-full mt-1">
            </p-dropdown>
          </div>

          <div>
            <label for="limit" class="block text-sm font-medium text-gray-700">Budget Limit</label>
            <p-inputNumber id="limit" formControlName="limit" mode="currency" currency="EUR" locale="en-US"
                          styleClass="w-full mt-1">
            </p-inputNumber>
          </div>

          <div>
            <label for="period" class="block text-sm font-medium text-gray-700">Period</label>
            <p-dropdown id="period" formControlName="period" [options]="periods" 
                       placeholder="Select a period"
                       styleClass="w-full mt-1">
            </p-dropdown>
          </div>

          <div class="flex justify-end space-x-2">
            <p-button label="Cancel" styleClass="p-button-text" (click)="showDialog = false"></p-button>
            <p-button label="Create" type="submit"></p-button>
          </div>
        </form>
      </p-dialog>
    </div>
  `
})
export class BudgetsComponent {
  showDialog = false;
  budgetForm: FormGroup;

  categories = [
    { name: 'Housing', value: 'housing' },
    { name: 'Food', value: 'food' },
    { name: 'Transport', value: 'transport' },
    { name: 'Entertainment', value: 'entertainment' },
    { name: 'Utilities', value: 'utilities' }
  ];

  periods = [
    'Monthly',
    'Weekly',
    'Yearly'
  ];

  budgets = [
    {
      category: 'Housing',
      period: 'Monthly',
      limit: 1200,
      spent: 850
    },
    {
      category: 'Food',
      period: 'Monthly',
      limit: 500,
      spent: 320
    },
    {
      category: 'Transport',
      period: 'Monthly',
      limit: 300,
      spent: 150
    },
    {
      category: 'Entertainment',
      period: 'Monthly',
      limit: 200,
      spent: 250
    },
    {
      category: 'Utilities',
      period: 'Monthly',
      limit: 150,
      spent: 120
    }
  ];

  constructor(private fb: FormBuilder) {
    this.budgetForm = this.fb.group({
      category: ['', Validators.required],
      limit: [null, [Validators.required, Validators.min(0)]],
      period: ['Monthly', Validators.required]
    });
  }

  showCreateDialog() {
    this.showDialog = true;
  }

  onSubmit() {
    if (this.budgetForm.valid) {
      console.log(this.budgetForm.value);
      this.showDialog = false;
    }
  }
} 