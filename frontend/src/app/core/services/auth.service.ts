import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  emailAddressOrUsername: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterRequest {
  name: string;
  username: string;
  emailAddress: string;
  password: string;
}

export interface AuthResponse {
  result: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/login`, request).pipe(
      tap((response: AuthResponse) => {
        // Store the result in localStorage if rememberMe is true, otherwise in sessionStorage
        const storage = request.rememberMe ? localStorage : sessionStorage;
        storage.setItem('jwt', response.result);
      })
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/register`, request).pipe(
      tap((response: AuthResponse) => {
        // Store the result in localStorage for new registrations
        localStorage.setItem('jwt', response.result);
      })
    );
  }

  logout(): void {
    // Clear both storages to ensure complete logout
    localStorage.removeItem('jwt');
    sessionStorage.removeItem('jwt');
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt') || sessionStorage.getItem('jwt');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}