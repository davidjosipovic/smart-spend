import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BudgetService, Budget } from '../../services/budget.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

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
    SelectModule,
    DatePickerModule,
    ReactiveFormsModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="space-y-6">
      <p-toast></p-toast>
      <p-confirmDialog></p-confirmDialog>

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
                <h3 class="text-lg font-medium text-gray-900">{{ budget.name }}</h3>
                <p class="text-sm text-gray-500">
                  {{ budget.valid_from | date:'mediumDate' }} - {{ budget.valid_until | date:'mediumDate' }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-sm text-gray-600">Spent</p>
                <p class="text-lg font-semibold text-gray-900">€{{ budget.spent || 0 }}</p>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-600">Progress</span>
                <span class="text-gray-900">{{ ((budget.spent || 0) / budget.spending_limit * 100).toFixed(0) }}%</span>
              </div>
              <p-progressBar [value]="(budget.spent || 0) / budget.spending_limit * 100" 
                           [showValue]="false"
                           [ngClass]="{'bg-red-100': (budget.spent || 0) > budget.spending_limit}">
              </p-progressBar>
            </div>

            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Budget Limit</span>
              <span class="text-gray-900">€{{ budget.spending_limit }}</span>
            </div>

            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Remaining</span>
              <span [ngClass]="{'text-red-600': (budget.spent || 0) > budget.spending_limit, 'text-gray-900': (budget.spent || 0) <= budget.spending_limit}">
                €{{ budget.spending_limit - (budget.spent || 0) }}
              </span>
            </div>

            <div class="flex justify-end space-x-2">
              <p-button icon="pi pi-pencil" styleClass="p-button-text" (click)="showEditDialog(budget)"></p-button>
              <p-button icon="pi pi-trash" styleClass="p-button-text p-button-danger" (click)="confirmDelete(budget)"></p-button>
            </div>
          </div>
        </p-card>
      </div>

      <!-- Create/Edit Budget Dialog -->
      <p-dialog [header]="isEditing ? 'Edit Budget' : 'Create New Budget'" [(visible)]="showDialog" [style]="{width: '450px'}" [modal]="true">
        <form [formGroup]="budgetForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
            <input id="name" type="text" pInputText formControlName="name" class="w-full mt-1">
          </div>

          <div>
            <label for="account_id" class="block text-sm font-medium text-gray-700">Account</label>
            <p-select id="account_id" formControlName="account_id" [options]="accounts" 
                     optionLabel="name" optionValue="id" placeholder="Select an account"
                     styleClass="w-full mt-1">
            </p-select>
          </div>

          <div>
            <label for="spending_limit" class="block text-sm font-medium text-gray-700">Budget Limit</label>
            <p-inputNumber id="spending_limit" formControlName="spending_limit" mode="currency" currency="EUR" locale="en-US"
                          styleClass="w-full mt-1">
            </p-inputNumber>
          </div>

          <div>
            <label for="valid_from" class="block text-sm font-medium text-gray-700">Valid From</label>
            <p-datePicker id="valid_from" formControlName="valid_from" [showTime]="true" [showSeconds]="true"
                         styleClass="w-full mt-1">
            </p-datePicker>
          </div>

          <div>
            <label for="valid_until" class="block text-sm font-medium text-gray-700">Valid Until</label>
            <p-datePicker id="valid_until" formControlName="valid_until" [showTime]="true" [showSeconds]="true"
                         styleClass="w-full mt-1">
            </p-datePicker>
          </div>

          <div *ngIf="isEditing">
            <label for="active" class="block text-sm font-medium text-gray-700">Status</label>
            <p-select id="active" formControlName="active" [options]="[
              {label: 'Active', value: true},
              {label: 'Inactive', value: false}
            ]" styleClass="w-full mt-1">
            </p-select>
          </div>

          <div class="flex justify-end space-x-2">
            <p-button label="Cancel" styleClass="p-button-text" (click)="showDialog = false"></p-button>
            <p-button label="{{isEditing ? 'Update' : 'Create'}}" type="submit"></p-button>
          </div>
        </form>
      </p-dialog>
    </div>
  `
})
export class BudgetsComponent implements OnInit {
  showDialog = false;
  isEditing = false;
  budgetForm: FormGroup;
  budgets: Budget[] = [];
  accounts = [
    { id: '1', name: 'Main Account' },
    { id: '2', name: 'Savings Account' }
  ];

  constructor(
    private fb: FormBuilder,
    private budgetService: BudgetService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.budgetForm = this.fb.group({
      name: ['', Validators.required],
      account_id: ['', Validators.required],
      spending_limit: [null, [Validators.required, Validators.min(0)]],
      valid_from: [null, Validators.required],
      valid_until: [null, Validators.required],
      active: [true]
    });
  }

  ngOnInit() {
    this.loadBudgets();
  }

  loadBudgets() {
    // TODO: Get selected account ID from a service or state management
    const accountId = '1';
    this.budgetService.getBudgets(accountId).subscribe({
      next: (budgets) => {
        this.budgets = budgets;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load budgets'
        });
      }
    });
  }

  showCreateDialog() {
    this.isEditing = false;
    this.budgetForm.reset({ active: true });
    this.showDialog = true;
  }

  showEditDialog(budget: Budget) {
    this.isEditing = true;
    this.budgetForm.patchValue({
      ...budget,
      valid_from: new Date(budget.valid_from),
      valid_until: new Date(budget.valid_until)
    });
    this.showDialog = true;
  }

  onSubmit() {
    if (this.budgetForm.valid) {
      const formValue = this.budgetForm.value;
      const request = {
        ...formValue,
        valid_from: formValue.valid_from.toISOString(),
        valid_until: formValue.valid_until.toISOString()
      };

      if (this.isEditing) {
        this.budgetService.updateBudget(request).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Budget updated successfully'
            });
            this.showDialog = false;
            this.loadBudgets();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update budget'
            });
          }
        });
      } else {
        this.budgetService.createBudget(request).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Budget created successfully'
            });
            this.showDialog = false;
            this.loadBudgets();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to create budget'
            });
          }
        });
      }
    }
  }

  confirmDelete(budget: Budget) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this budget?',
      accept: () => {
        this.budgetService.deleteBudget(budget.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Budget deleted successfully'
            });
            this.loadBudgets();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete budget'
            });
          }
        });
      }
    });
  }
} 