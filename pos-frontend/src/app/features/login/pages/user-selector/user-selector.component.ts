import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AvatarCardComponent } from '../../../../shared/components/avatar-card/avatar-card.component';
import { AuthService } from '../../../../core/services/auth.service';
import { PosUser } from '../../../../core/models';

@Component({
  selector: 'app-user-selector',
  standalone: true,
  imports: [AvatarCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="user-selector">
      <div class="user-selector__logo">
        <img src="/logo.png" alt="Maxirest" class="logo-img" />
      </div>

      <h1 class="user-selector__title">¿Quién anda ahí?</h1>

      <div class="user-selector__search">
        <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          class="search-input"
          placeholder="Buscar..."
          [value]="searchTerm()"
          (input)="onSearch($event)"
        />
      </div>

      <div class="user-selector__carousel">
        @if (currentPage() > 0) {
          <button class="carousel-arrow carousel-arrow--left" (click)="prevPage()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        }

        <div class="user-selector__grid">
          @for (user of visibleUsers(); track user.id) {
            <app-avatar-card [user]="user" (selected)="onUserSelected($event)" />
          }
        </div>

        @if (currentPage() < totalPages() - 1) {
          <button class="carousel-arrow carousel-arrow--right" (click)="nextPage()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .user-selector {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      min-height: 100dvh;
      padding: 24px;
      gap: 28px;
      background: linear-gradient(135deg, #01033E 0%, #0A0E4A 50%, #01033E 100%);
    }
    .user-selector__logo {
      position: absolute;
      top: 24px;
      left: 28px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .logo-img {
      height: 32px;
      width: auto;
      object-fit: contain;
    }
    .user-selector__title {
      color: #fff;
      font-size: 32px;
      font-weight: 700;
      margin: 0;
    }
    .user-selector__search {
      position: relative;
      width: 100%;
      max-width: 320px;
    }
    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(255, 255, 255, 0.4);
    }
    .search-input {
      width: 100%;
      padding: 12px 16px 12px 42px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }
    .search-input::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }
    .search-input:focus {
      border-color: rgba(255, 255, 255, 0.3);
    }
    .user-selector__carousel {
      display: flex;
      align-items: center;
      gap: 16px;
      width: 100%;
      max-width: 800px;
      justify-content: center;
    }
    .carousel-arrow {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.06);
      color: rgba(255, 255, 255, 0.8);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background 0.15s;
    }
    .carousel-arrow:hover {
      background: rgba(255, 255, 255, 0.12);
    }
    .user-selector__grid {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }

    @media (max-width: 600px) {
      .user-selector__title { font-size: 24px; }
      .user-selector__grid { gap: 8px; }
    }
  `],
})
export class UserSelectorComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly searchTerm = signal('');
  readonly currentPage = signal(0);
  readonly pageSize = 7;

  private readonly filteredUsers = computed(() =>
    this.authService.getUsers(this.searchTerm())
  );

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredUsers().length / this.pageSize))
  );

  readonly visibleUsers = computed(() => {
    const start = this.currentPage() * this.pageSize;
    return this.filteredUsers().slice(start, start + this.pageSize);
  });

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    this.currentPage.set(0);
  }

  onUserSelected(user: PosUser): void {
    this.authService.selectUser(user.id);
    this.router.navigate(['/login/pin']);
  }

  prevPage(): void {
    this.currentPage.update(p => Math.max(0, p - 1));
  }

  nextPage(): void {
    this.currentPage.update(p => Math.min(this.totalPages() - 1, p + 1));
  }
}
