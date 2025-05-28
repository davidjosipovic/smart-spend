import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-register',
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
          <h2 class="mt-6 text-xl text-gray-600">Create your account</h2>
        </div>
        
        <p-card styleClass="shadow-none">
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div class="space-y-4">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
                <input id="name" type="text" pInputText formControlName="name" 
                       class="w-full mt-1" placeholder="Enter your full name">
                <small class="text-red-500" *ngIf="registerForm.get('name')?.touched && registerForm.get('name')?.errors?.['required']">
                  Name is required
                </small>
                <small class="text-red-500" *ngIf="registerForm.get('name')?.touched && registerForm.get('name')?.errors?.['minlength']">
                  Name must be at least 2 characters
                </small>
              </div>

              <div>
                <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
                <input id="username" type="text" pInputText formControlName="username" 
                       class="w-full mt-1" placeholder="Choose a username">
                <small class="text-red-500" *ngIf="registerForm.get('username')?.touched && registerForm.get('username')?.errors?.['required']">
                  Username is required
                </small>
              </div>

              <div>
                <label for="emailAddress" class="block text-sm font-medium text-gray-700">Email</label>
                <input id="emailAddress" type="email" pInputText formControlName="emailAddress" 
                       class="w-full mt-1" placeholder="Enter your email">
                <small class="text-red-500" *ngIf="registerForm.get('emailAddress')?.touched && registerForm.get('emailAddress')?.errors?.['required']">
                  Email is required
                </small>
                <small class="text-red-500" *ngIf="registerForm.get('emailAddress')?.touched && registerForm.get('emailAddress')?.errors?.['email']">
                  Please enter a valid email
                </small>
              </div>
              
              <div>
                <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                <p-password id="password" formControlName="password" 
                           [toggleMask]="true" [feedback]="true"
                           styleClass="w-full" placeholder="Create a password">
                </p-password>
                <small class="text-red-500" *ngIf="registerForm.get('password')?.touched && registerForm.get('password')?.errors?.['required']">
                  Password is required
                </small>
                <small class="text-red-500" *ngIf="registerForm.get('password')?.touched && registerForm.get('password')?.errors?.['minlength']">
                  Password must be at least 6 characters
                </small>
              </div>

              <div>
                <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label>
                <p-password id="confirmPassword" formControlName="confirmPassword" 
                           [toggleMask]="true" [feedback]="false"
                           styleClass="w-full" placeholder="Confirm your password">
                </p-password>
                <small class="text-red-500" *ngIf="registerForm.get('confirmPassword')?.touched && registerForm.get('confirmPassword')?.errors?.['required']">
                  Please confirm your password
                </small>
                <small class="text-red-500" *ngIf="registerForm.get('confirmPassword')?.touched && registerForm.get('confirmPassword')?.errors?.['passwordMismatch']">
                  Passwords do not match
                </small>
              </div>
            </div>

            <div>
              <p-button type="submit" label="Create Account" styleClass="w-full" [loading]="isLoading"></p-button>
            </div>
          </form>
        </p-card>

        <div class="text-center">
          <p class="text-sm text-gray-600">
            Already have an account?
            <a routerLink="/auth/login" class="font-medium text-primary hover:text-primary-dark">
              Sign in
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
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required]],
      emailAddress: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
    }
    
    return null;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const { confirmPassword, ...registerData } = this.registerForm.value;
      
      this.authService.register(registerData).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Registration Failed',
            detail: error.error?.message || 'An error occurred during registration. Please try again.'
          });
        }
      });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        control?.markAsTouched();
      });
    }
  }
} 