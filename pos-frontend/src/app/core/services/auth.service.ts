import { Injectable, signal, computed } from '@angular/core';
import { PosUser } from '../models';
import { MOCK_USERS } from '../../features/login/data/mock-users.data';

const MAX_INTENTOS = 3;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly users = signal<PosUser[]>(MOCK_USERS);
  private readonly _currentUser = signal<PosUser | null>(null);
  private readonly _loginError = signal<string>('');

  readonly currentUser = this._currentUser.asReadonly();
  readonly loginError = this._loginError.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  getUsers(search: string = ''): PosUser[] {
    const term = search.toLowerCase().trim();
    return this.users().filter(u =>
      u.activo && !u.bloqueado && u.nombre.toLowerCase().includes(term)
    );
  }

  getUserById(id: string): PosUser | undefined {
    return this.users().find(u => u.id === id);
  }

  selectUser(userId: string): void {
    const user = this.getUserById(userId);
    if (user) {
      this._currentUser.set(user);
      this._loginError.set('');
    }
  }

  validatePin(pin: string): boolean {
    const user = this._currentUser();
    if (!user) return false;

    if (user.pin === pin) {
      this.users.update(users =>
        users.map(u => u.id === user.id ? { ...u, intentosFallidos: 0 } : u)
      );
      this._loginError.set('');
      return true;
    }

    const intentos = user.intentosFallidos + 1;
    const bloqueado = intentos >= MAX_INTENTOS;

    this.users.update(users =>
      users.map(u => u.id === user.id
        ? { ...u, intentosFallidos: intentos, bloqueado }
        : u
      )
    );

    this._currentUser.update(u => u ? { ...u, intentosFallidos: intentos, bloqueado } : null);

    if (bloqueado) {
      this._loginError.set('Usuario bloqueado por demasiados intentos fallidos');
    } else {
      this._loginError.set(`PIN incorrecto. ${MAX_INTENTOS - intentos} intento(s) restante(s)`);
    }

    return false;
  }

  clearSelection(): void {
    this._currentUser.set(null);
    this._loginError.set('');
  }

  logout(): void {
    this._currentUser.set(null);
    this._loginError.set('');
  }
}
