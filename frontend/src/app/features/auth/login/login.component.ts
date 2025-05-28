import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, LoginRequest } from '../../../core/services/auth.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CardModule,
    ReactiveFormsModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-primary">SmartSpend</h1>
          <h2 class="mt-6 text-xl text-gray-600">Sign in to your account</h2>
        </div>
        
        <p-card styleClass="shadow-none">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div class="space-y-4">
              <div>
                <label for="emailAddressOrUsername" class="block text-sm font-medium text-gray-700">Email or Username</label>
                <input id="emailAddressOrUsername" type="text" pInputText formControlName="emailAddressOrUsername" 
                       class="w-full mt-1" placeholder="Enter your email or username">
                <small class="text-red-500" *ngIf="loginForm.get('emailAddressOrUsername')?.touched && loginForm.get('emailAddressOrUsername')?.errors?.['required']">
                  Email or username is required
                </small>
              </div>
              
              <div>
                <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                <p-password id="password" formControlName="password" 
                           [toggleMask]="true" [feedback]="false"
                           styleClass="w-full" placeholder="Enter your password">
                </p-password>
                <small class="text-red-500" *ngIf="loginForm.get('password')?.touched && loginForm.get('password')?.errors?.['required']">
                  Password is required
                </small>
                <small class="text-red-500" *ngIf="loginForm.get('password')?.touched && loginForm.get('password')?.errors?.['minlength']">
                  Password must be at least 6 characters
                </small>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <input id="rememberMe" type="checkbox" formControlName="rememberMe" class="h-4 w-4 text-primary">
                <label for="rememberMe" class="ml-2 block text-sm text-gray-700">Remember me</label>
              </div>
              <a href="#" class="text-sm text-primary hover:text-primary-dark">Forgot password?</a>
            </div>

            <div>
              <p-button type="submit" label="Sign in" styleClass="w-full" [loading]="isLoading"></p-button>
            </div>
          </form>
        </p-card>

        <div class="text-center">
          <p class="text-sm text-gray-600">
            Don't have an account?
            <a routerLink="/auth/register" class="font-medium text-primary hover:text-primary-dark">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
    <p-toast></p-toast>
  `,
  styles: [`
    :host ::ng-deep {
      .p-password {
        width: 100%;
      }
      .p-password-input {
        width: 100%;
      }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.loginForm = this.fb.group({
      emailAddressOrUsername: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const loginRequest: LoginRequest = this.loginForm.value;
      
      this.authService.login(loginRequest).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Login Failed',
            detail: error.error?.message || 'An error occurred during login. Please try again.'
          });
        }
      });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
      });
    }
  }
} 