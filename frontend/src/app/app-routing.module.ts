import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BankConnectionComponent } from './components/bank-connection/bank-connection.component';
import { BankCallbackComponent } from './components/bank-callback/bank-callback.component';

const routes: Routes = [
  { path: 'connect-bank', component: BankConnectionComponent },
  { path: 'callback', component: BankCallbackComponent },
  { path: '', redirectTo: '/connect-bank', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 