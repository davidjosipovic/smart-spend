import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EnableBankingService } from '../../../../services/enable-banking.service';
import { jwtDecode } from 'jwt-decode';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-bank-callback',
  standalone: true,
  imports: [CommonModule, Toast],
  template: `
    <div class="container mt-4">
      @if (loading) {
        <div class="text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      }

      @if (error) {
        <div class="alert alert-danger" role="alert">
          {{ error }}
        </div>
      }
    </div>
    <p-toast></p-toast>
  `
})
export class BankCallbackComponent implements OnInit {
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private enableBankingService: EnableBankingService,
    private messageService: MessageService,
    private authService: AuthService
  ) {
  }

  ngOnInit(): void {
    this.handleCallback();
  }

  private handleCallback(): void {
    this.loading = true;
    const code = this.route.snapshot.queryParamMap.get('code');
    const state = this.route.snapshot.queryParamMap.get('state');

    if (!code || !state) {
      this.error = 'Invalid callback parameters';
      this.loading = false;
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      this.error = 'No authentication token found';
      this.loading = false;
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      const userId = (decodedToken as any).id;

      this.enableBankingService.authorizeUserSession(userId, code).subscribe({
        next: (response) => {
          if (response.result) {
            this.router.navigate(['/dashboard']).then(value => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Bank authorization successful',
              })
              this.enableBankingService.getSessionData(response.result.session_id).subscribe();
            });
          } else {
            this.router.navigate(['/dashboard']).then(value => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error occurred',
                detail: response?.errors?.[0] ?? 'Failed to process bank authorization',
              })
            });
            this.loading = false;
          }
        },
        error: (error) => {
          this.loading = false;
          this.router.navigate(['/dashboard']).then(value => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error occurred',
              detail: error.error?.errors?.[0]?.message ?? 'Failed to process bank authorization',
            })
          });
        }
      });
    } catch (error) {
      this.error = 'Failed to decode authentication token';
      this.loading = false;
    }
  }
}
