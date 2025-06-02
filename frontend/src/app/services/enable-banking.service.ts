import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnableBankingService {
  private apiUrl = `${environment.apiUrl}/enable-banking`;

  constructor(private http: HttpClient) { }

  getAspspsList(country: string = 'hr'): Observable<any> {
    return this.http.get(`${this.apiUrl}/aspsps?country=${country}`);
  }

  startUserAuthorization(aspsp: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/user-authorization`, aspsp);
  }

  authorizeUserSession(userId: string, authorizationCode: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/authorize-session`, {
      user_id: userId,
      authorization_code: authorizationCode
    });
  }

  getSessionData(sessionId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/session/${sessionId}`);
  }
} 