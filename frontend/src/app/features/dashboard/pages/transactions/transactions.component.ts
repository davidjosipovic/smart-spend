import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface Account {
  id: string;
  account_id: string;
  name: string | null;
  currency: string | null;
}

interface Transaction {
  entry_reference: string;
  transaction_amount: {
    amount: string;
    currency: string;
  };
  creditor: {
    name: string;
  };
  credit_debit_indicator: 'CRDT' | 'DBIT';
  status: string;
  booking_date: string;
  value_date: string;
  remittance_information: string[];
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
    CalendarModule,
    ReactiveFormsModule,
    FormsModule,
    ProgressSpinnerModule
  ],
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

      <!-- Loading Spinner -->
      <div *ngIf="isLoading" class="flex justify-center items-center p-8">
        <p-progressSpinner [style]="{width: '50px', height: '50px'}" strokeWidth="4" fill="transparent" animationDuration="1.5s"></p-progressSpinner>
      </div>

      <!-- Transactions Table -->
      <p-table [value]="transactions" [paginator]="true" [rows]="10" 
               [showCurrentPageReport]="true" currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
               [rowsPerPageOptions]="[10,25,50]" styleClass="p-datatable-sm"
               *ngIf="selectedAccount && !isLoading">
        <ng-template pTemplate="header">
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Type</th>
            <th class="text-right">Amount</th>
            <th class="text-center">Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-transaction>
          <tr>
            <td>{{ transaction.booking_date | date:'mediumDate' }}</td>
            <td>{{ transaction.creditor.name }}</td>
            <td>
              <span class="inline-flex items-center">
                <i class="pi" [ngClass]="transaction.credit_debit_indicator === 'CRDT' ? 'pi-arrow-up text-green-600' : 'pi-arrow-down text-red-600'"></i>
                <span class="ml-1">{{ transaction.credit_debit_indicator === 'CRDT' ? 'Credit' : 'Debit' }}</span>
              </span>
            </td>
            <td class="text-right" [ngClass]="transaction.credit_debit_indicator === 'CRDT' ? 'text-green-600' : 'text-red-600'">
              {{ transaction.credit_debit_indicator === 'CRDT' ? '+' : '-' }}{{ transaction.transaction_amount.amount }} {{ transaction.transaction_amount.currency }}
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
            <p>{{ selectedTransaction.creditor.name }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Amount</label>
            <p [ngClass]="selectedTransaction.credit_debit_indicator === 'CRDT' ? 'text-green-600' : 'text-red-600'">
              {{ selectedTransaction.credit_debit_indicator === 'CRDT' ? '+' : '-' }}{{ selectedTransaction.transaction_amount.amount }} {{ selectedTransaction.transaction_amount.currency }}
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
            <label class="block text-sm font-medium text-gray-700">Value Date</label>
            <p>{{ selectedTransaction.value_date | date:'mediumDate' }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Reference</label>
            <p>{{ selectedTransaction.entry_reference }}</p>
          </div>
          
          <div *ngIf="selectedTransaction.remittance_information?.length">
            <label class="block text-sm font-medium text-gray-700">Additional Information</label>
            <p>{{ selectedTransaction.remittance_information[0] }}</p>
          </div>
        </div>
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

  constructor(private http: HttpClient) {}

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
    this.loadTransactions(account.account_id);
  }

  loadTransactions(accountId: string) {
    this.isLoading = true;
    this.http.get<{ result: { transactions: Transaction[] } }>(`${environment.apiUrl}/enable-banking/accounts/${accountId}/transactions`).subscribe({
      next: (response) => {
        this.transactions = response.result.transactions;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.isLoading = false;
      }
    });
  }

  showTransactionDetails(transaction: Transaction) {
    this.selectedTransaction = transaction;
    this.showDetailsDialog = true;
  }
}
