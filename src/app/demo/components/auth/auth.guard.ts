import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const isAuthenticated = !!localStorage.getItem('token'); // Verifica autenticação
    if (!isAuthenticated) {
      this.router.navigate(['/auth/login']); // Redireciona para login
      return false;
    }
    return true;
  }
}
