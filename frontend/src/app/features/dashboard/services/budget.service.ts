import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Budget {
  id: string;
  name: string;
  valid_from: string;
  valid_until: string;
  spending_limit: number;
  active: boolean;
  account_id: string;
  spent?: number;
}

export interface CreateBudgetRequest {
  name: string;
  valid_from: string;
  valid_until: string;
  spending_limit: number;
  account_id: string;
}

export interface UpdateBudgetRequest {
  id: string;
  name: string;
  valid_from: string;
  valid_until: string;
  spending_limit: number;
  active: boolean;
  account_id: string;
}

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private apiUrl = `${environment.apiUrl}/budgets`;

  constructor(private http: HttpClient) {}

  getBudgets(accountId: string): Observable<Budget[]> {
    return this.http.get<Budget[]>(`${this.apiUrl}/accounts/${accountId}`);
  }

  getBudget(budgetId: string): Observable<Budget> {
    return this.http.get<Budget>(`${this.apiUrl}/${budgetId}`);
  }

  createBudget(request: CreateBudgetRequest): Observable<Budget> {
    return this.http.post<Budget>(this.apiUrl, request);
  }

  updateBudget(request: UpdateBudgetRequest): Observable<Budget> {
    return this.http.put<Budget>(this.apiUrl, request);
  }

  deleteBudget(budgetId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${budgetId}`);
  }

  notifyBudgetExceeded(budget: number, actualSpent: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/notify-budget-exceeded`, { budget, actual_spent: actualSpent });
  }
} 