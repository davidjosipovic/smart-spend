import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';

interface DecodedToken {
  id: string;
  sessionValidUntil: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private sessionValidUntil = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {
    this.initializeSessionValidity();
  }

  private initializeSessionValidity(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        if (decodedToken && decodedToken.sessionValidUntil) {
          this.sessionValidUntil.next(decodedToken.sessionValidUntil);
          localStorage.setItem('sessionValidUntil', decodedToken.sessionValidUntil);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }

  getSessionValidUntil(): Observable<string | null> {
    return this.sessionValidUntil.asObservable();
  }

  updateSessionValidity(validUntil: string): void {
    this.sessionValidUntil.next(validUntil);
    localStorage.setItem('sessionValidUntil', validUntil);
  }

  isSessionValid(): boolean {
    const validUntil = localStorage.getItem('sessionValidUntil');
    if (!validUntil) return false;
    
    const validUntilDate = new Date(validUntil);
    return validUntilDate > new Date();
  }

  // ... rest of your existing auth service methods ...
} 