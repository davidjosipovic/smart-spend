import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { DatePickerModule } from 'primeng/datepicker';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToolbarModule } from 'primeng/toolbar';
import { FileUploadModule } from 'primeng/fileupload';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

interface Account {
  id: string;
  account_id: string;
  name: string | null;
  currency: string | null;
}

interface Transaction {
  reference: string;
  booking_date: string;
  transaction_date: string | null;
  amount: number;
  currency: string;
  credit_debit_indicator: 'CRDT' | 'DBIT' | null;
  status: string;
  remittance_information: string;
  merchant_category_code: string | null;
  creditor_name: string | null;
  debtor_name: string | null;
  bank_transaction_code: string | null;
  category: string | null;
}

interface PaginationInfo {
  current_page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
}

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
    DatePickerModule,
    ReactiveFormsModule,
    FormsModule,
    ProgressSpinnerModule,
    ToolbarModule,
    FileUploadModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-semibold text-gray-900">Transactions</h2>
      </div>

      <!-- Account Selection -->
      <div class="bg-white p-4 rounded-lg shadow-sm">
        <div class="mb-4">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Select Account</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div *ngFor="let account of accounts" 
                 class="border rounded-lg p-4 cursor-pointer transition-all duration-200"
                 [class.border-blue-500]="selectedAccount?.id === account.id"
                 [class.bg-blue-50]="selectedAccount?.id === account.id"
                 [class.hover:border-blue-300]="selectedAccount?.id !== account.id"
                 (click)="onAccountSelect(account)">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-medium text-gray-900">{{ account.name || 'Unnamed Account' }}</h4>
                  <p class="text-sm text-gray-500">{{ account.currency || 'N/A' }}</p>
                </div>
                <div class="text-sm text-gray-500">
                  ID: {{ account.account_id }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions Toolbar -->
      <div *ngIf="selectedAccount" class="bg-white p-4 rounded-lg shadow-sm">
        <p-toolbar styleClass="mb-4">
          <ng-template pTemplate="left">
            <div class="flex gap-2">
              <p-button 
                icon="pi pi-sync" 
                label="Sync Transactions" 
                styleClass="p-button-primary"
                [loading]="isSyncing"
                (click)="syncTransactions()">
              </p-button>
              
              <p-fileUpload 
                mode="basic" 
                name="transactions" 
                accept=".csv" 
                [maxFileSize]="1000000"
                chooseLabel="Import CSV"
                styleClass="p-button-secondary"
                (onUpload)="onFileUpload($event)"
                [auto]="true"
                [showUploadButton]="false"
                [showCancelButton]="false">
              </p-fileUpload>
              
              <p-button 
                icon="pi pi-plus" 
                label="New Transaction" 
                styleClass="p-button-success"
                (click)="showNewTransactionDialog()">
              </p-button>
            </div>
          </ng-template>
        </p-toolbar>
      </div>

      <!-- Loading Spinner -->
      <div *ngIf="isLoading" class="flex justify-center items-center p-8">
        <p-progressSpinner [style]="{width: '50px', height: '50px'}" strokeWidth="4" fill="transparent" animationDuration="1.5s"></p-progressSpinner>
      </div>

      <!-- Transactions Table -->
      <p-table [value]="transactions" [paginator]="true" [rows]="pageSize" [first]="first"
               [showCurrentPageReport]="true" currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
               [rowsPerPageOptions]="[10,25,50]" styleClass="p-datatable-sm"
               [totalRecords]="totalRecords"
               [lazy]="true"
               (onPage)="onPageChange($event)"
               *ngIf="selectedAccount && !isLoading">
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
            <td>{{ transaction.booking_date | date:'mediumDate' }}</td>
            <td>{{ transaction.remittance_information }}</td>
            <td>{{ transaction.category || 'Uncategorized' }}</td>
            <td>
              <span class="inline-flex items-center">
                <i class="pi" [ngClass]="transaction.credit_debit_indicator === 'CRDT' ? 'pi-arrow-up text-green-600' : 'pi-arrow-down text-red-600'"></i>
                <span class="ml-1">{{ transaction.credit_debit_indicator === 'CRDT' ? 'Credit' : 'Debit' }}</span>
              </span>
            </td>
            <td class="text-right" [ngClass]="transaction.credit_debit_indicator === 'CRDT' ? 'text-green-600' : 'text-red-600'">
              {{ transaction.credit_debit_indicator === 'CRDT' ? '+' : '-' }}{{ transaction.amount }} {{ transaction.currency }}
            </td>
            <td class="text-center">
              <p-button icon="pi pi-eye" styleClass="p-button-text p-button-rounded" (click)="showTransactionDetails(transaction)"></p-button>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <!-- Transaction Details Dialog -->
      <p-dialog header="Transaction Details" [(visible)]="showDetailsDialog" [style]="{width: '450px'}" [modal]="true">
        <div class="space-y-4" *ngIf="selectedTransaction">
          <div>
            <label class="block text-sm font-medium text-gray-700">Date</label>
            <p>{{ selectedTransaction.booking_date | date:'mediumDate' }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Description</label>
            <p>{{ selectedTransaction.remittance_information }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Category</label>
            <p>{{ selectedTransaction.category || 'Uncategorized' }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Amount</label>
            <p [ngClass]="selectedTransaction.credit_debit_indicator === 'CRDT' ? 'text-green-600' : 'text-red-600'">
              {{ selectedTransaction.credit_debit_indicator === 'CRDT' ? '+' : '-' }}{{ selectedTransaction.amount }} {{ selectedTransaction.currency }}
            </p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Type</label>
            <p>{{ selectedTransaction.credit_debit_indicator === 'CRDT' ? 'Credit' : 'Debit' }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Status</label>
            <p>{{ selectedTransaction.status }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Transaction Date</label>
            <p>{{ selectedTransaction.transaction_date | date:'mediumDate' }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Reference</label>
            <p>{{ selectedTransaction.reference }}</p>
          </div>
          
          <div *ngIf="selectedTransaction.creditor_name">
            <label class="block text-sm font-medium text-gray-700">Creditor</label>
            <p>{{ selectedTransaction.creditor_name }}</p>
          </div>
          
          <div *ngIf="selectedTransaction.debtor_name">
            <label class="block text-sm font-medium text-gray-700">Debtor</label>
            <p>{{ selectedTransaction.debtor_name }}</p>
          </div>
          
          <div *ngIf="selectedTransaction.merchant_category_code">
            <label class="block text-sm font-medium text-gray-700">Merchant Category</label>
            <p>{{ selectedTransaction.merchant_category_code }}</p>
          </div>
          
          <div *ngIf="selectedTransaction.bank_transaction_code">
            <label class="block text-sm font-medium text-gray-700">Bank Transaction Code</label>
            <p>{{ selectedTransaction.bank_transaction_code }}</p>
          </div>
        </div>
      </p-dialog>

      <!-- New Transaction Dialog -->
      <p-dialog header="New Transaction" [(visible)]="showNewTransactionForm" [style]="{width: '450px'}" [modal]="true">
        <form [formGroup]="newTransactionForm" (ngSubmit)="submitNewTransaction()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Description</label>
            <input pInputText formControlName="remittance_information" class="w-full" />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Amount</label>
            <p-inputNumber formControlName="amount" mode="currency" currency="EUR" locale="en-US" class="w-full"></p-inputNumber>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Type</label>
            <p-dropdown formControlName="credit_debit_indicator" [options]="transactionTypes" optionLabel="label" optionValue="value" class="w-full"></p-dropdown>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Date</label>
            <p-datePicker formControlName="booking_date" appendTo="body" [showIcon]="true" dateFormat="yy-mm-dd" class="w-full"></p-datePicker>
          </div>
          
          <div class="flex justify-end gap-2">
            <p-button type="button" label="Cancel" styleClass="p-button-text" (click)="showNewTransactionForm = false"></p-button>
            <p-button type="submit" label="Save" [disabled]="!newTransactionForm.valid"></p-button>
          </div>
        </form>
      </p-dialog>
    </div>
  `
})
export class TransactionsComponent implements OnInit {
  accounts: Account[] = [];
  selectedAccount: Account | null = null;
  transactions: Transaction[] = [];
  showDetailsDialog = false;
  selectedTransaction: Transaction | null = null;
  isLoading = false;
  
  // Pagination state
  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;
  first = 0;

  // New properties
  isSyncing = false;
  showNewTransactionForm = false;
  newTransactionForm: FormGroup;
  transactionTypes = [
    { label: 'Credit', value: 'CRDT' },
    { label: 'Debit', value: 'DBIT' }
  ];

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.newTransactionForm = this.fb.group({
      remittance_information: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0)]],
      credit_debit_indicator: ['DBIT', Validators.required],
      booking_date: [new Date(), Validators.required]
    });
  }

  ngOnInit() {
    this.loadAccounts();
  }

  loadAccounts() {
    this.http.get<{ result: Account[] }>(`${environment.apiUrl}/accounts`).subscribe({
      next: (response) => {
        this.accounts = response.result;
        // Auto-select account if there's only one
        if (this.accounts.length === 1) {
          this.onAccountSelect(this.accounts[0]);
        }
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
      }
    });
  }

  onAccountSelect(account: Account) {
    this.selectedAccount = account;
    this.currentPage = 1; // Reset to first page when selecting new account
    this.loadTransactions(account.account_id);
  }

  loadTransactions(accountId: string) {
    this.isLoading = true;
    const params = {
      page: this.currentPage.toString(),
      pageSize: this.pageSize.toString()
    };
    
    this.http.get<{ result: { transactions: Transaction[], pagination: PaginationInfo } }>(
      `${environment.apiUrl}/transactions/accounts/${accountId}`,
      { params }
    ).subscribe({
      next: (response) => {
        this.transactions = response.result.transactions;
        this.totalRecords = response.result.pagination.total_count;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: any) {  
    this.currentPage = (event.first / event.rows) + 1; // PrimeNG uses 0-based indexing
    this.first = event.first;
    this.pageSize = event.rows;
    if (this.selectedAccount) {
      this.loadTransactions(this.selectedAccount.account_id);
    }
  }

  showTransactionDetails(transaction: Transaction) {
    this.selectedTransaction = transaction;
    this.showDetailsDialog = true;
  }

  syncTransactions() {
    if (!this.selectedAccount) return;
    
    this.isSyncing = true;
    this.http.post(`${environment.apiUrl}/transactions/accounts/${this.selectedAccount.account_id}/synchronize-transactions`, {}).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Transactions synchronized successfully'
        });
        this.loadTransactions(this.selectedAccount!.account_id);
      },
      error: (error) => {
        console.error('Error syncing transactions:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to synchronize transactions'
        });
      },
      complete: () => {
        this.isSyncing = false;
      }
    });
  }

  onFileUpload(event: any) {
    const file = event.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    this.http.post(`${environment.apiUrl}/transactions/accounts/${this.selectedAccount!.account_id}/import-transactions`, formData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Transactions imported successfully'
        });
        this.loadTransactions(this.selectedAccount!.account_id);
      },
      error: (error) => {
        console.error('Error importing transactions:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to import transactions'
        });
      }
    });
  }

  showNewTransactionDialog() {
    this.newTransactionForm.reset({
      credit_debit_indicator: 'DBIT',
      booking_date: new Date()
    });
    this.showNewTransactionForm = true;
  }

  submitNewTransaction() {
    if (!this.newTransactionForm.valid || !this.selectedAccount) return;

    const transaction = {
      ...this.newTransactionForm.value,
      currency: this.selectedAccount.currency || 'EUR',
      status: 'BOOKED'
    };

    this.http.post(`${environment.apiUrl}/transactions/accounts/${this.selectedAccount.account_id}/insert-transaction`, transaction).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Transaction created successfully'
        });
        this.showNewTransactionForm = false;
        this.loadTransactions(this.selectedAccount!.account_id);
      },
      error: (error) => {
        console.error('Error creating transaction:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create transaction'
        });
      }
    });
  }
}
