import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnableBankingService } from '../../../../services/enable-banking.service';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bank-connection',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ProgressSpinnerModule,
    MessageModule,
    InputTextModule,
    FormsModule
  ],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-2">Connect Your Bank</h1>
          <p class="text-xl text-gray-600">Choose your bank to securely connect your accounts</p>
        </div>

        <div class="max-w-md mx-auto mb-8">
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3">
              <i class="pi pi-search text-gray-400"></i>
            </span>
            <input pInputText type="text" [(ngModel)]="searchQuery" 
                   placeholder="Search banks..." 
                   class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />
          </div>
        </div>

        @if (loading) {
          <div class="flex justify-center items-center min-h-[200px]">
            <p-progressSpinner strokeWidth="4" />
          </div>
        }

        @if (error) {
          <div class="max-w-2xl mx-auto mb-6">
            <p-message severity="error" [text]="error" />
          </div>
        }

        @if (!loading && !error) {
          <div class="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-3 gap-6">
            @for (aspsp of filteredAspsps; track $index) {
              <div class="flex flex-col">
                <p-card [style]="{'height': '100%'}" styleClass="shadow-sm hover:shadow-md transition-all duration-200">
                  <ng-template pTemplate="header">
                    <div class="flex items-center justify-center p-6 bg-gray-50" 
                         style="height: 120px">
                      <img [src]="aspsp.logo" [alt]="aspsp.name" 
                           class="max-h-20 max-w-[80%] object-contain">
                    </div>
                  </ng-template>
                  
                  <ng-template pTemplate="content">
                    <div class="flex flex-col gap-2">
                      <h2 class="text-xl font-semibold text-gray-900">{{ aspsp.name }}</h2>
                      <div class="flex items-center gap-2 text-gray-600">
                        <i class="pi pi-globe"></i>
                        <span>{{ aspsp.country }}</span>
                      </div>
                    </div>
                  </ng-template>

                  <ng-template pTemplate="footer">
                    <p-button [label]="loading ? 'Connecting...' : 'Connect'" 
                             icon="pi pi-link" 
                             styleClass="w-full" 
                             [loading]="loading"
                             (onClick)="connectToBank(aspsp)" />
                  </ng-template>
                </p-card>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep {
      .p-card {
        .p-card-content {
          padding: 1.5rem 0;
        }
        .p-card-footer {
          padding: 0;
        }
      }

      .p-inputtext {
        padding-left: 35px;
      }
    }
  `]
})
export class BankConnectionComponent implements OnInit {
  aspsps: any[] = [];
  loading = false;
  error: string | null = null;
  searchQuery: string = '';

  constructor(
    private enableBankingService: EnableBankingService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadAspsps();
  }

  loadAspsps(): void {
    this.loading = true;
    this.enableBankingService.getAspspsList().subscribe({
      next: (response) => {
        if (response.result && response.result.aspsps) {
          this.aspsps = response.result.aspsps;
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load banks. Please try again.';
        this.loading = false;
      }
    });
  }

  connectToBank(aspsp: any): void {
    this.loading = true;
    this.enableBankingService.startUserAuthorization({
      name: aspsp.name,
      country: aspsp.country
    }).subscribe({
      next: (response) => {
        if (response.result && response.result.url) {
          window.location.href = response.result.url;
        }
      },
      error: (error) => {
        this.error = 'Failed to start authorization. Please try again.';
        this.loading = false;
      }
    });
  }

  get filteredAspsps() {
    if (!this.searchQuery) {
      return this.aspsps;
    }
    const query = this.searchQuery.toLowerCase();
    return this.aspsps.filter(aspsp => 
      aspsp.name.toLowerCase().includes(query) || 
      aspsp.country.toLowerCase().includes(query)
    );
  }
} 