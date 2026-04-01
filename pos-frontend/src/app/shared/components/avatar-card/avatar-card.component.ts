import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { PosUser } from '../../../core/models';

@Component({
  selector: 'app-avatar-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button class="avatar-card" (click)="selected.emit(user())">
      <div class="avatar-card__img">
        <span class="avatar-card__emoji">{{ user().avatar }}</span>
      </div>
      <span class="avatar-card__name">{{ user().nombre }}</span>
    </button>
  `,
  styles: [`
    .avatar-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 16px;
      transition: transform 0.15s, background 0.15s;
      -webkit-tap-highlight-color: transparent;
    }
    .avatar-card:hover {
      transform: scale(1.05);
      background: rgba(255, 255, 255, 0.06);
    }
    .avatar-card:active {
      transform: scale(0.97);
    }
    .avatar-card__img {
      width: 80px;
      height: 80px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid rgba(255, 255, 255, 0.15);
    }
    .avatar-card__emoji {
      font-size: 38px;
      line-height: 1;
    }
    .avatar-card__name {
      color: rgba(255, 255, 255, 0.9);
      font-size: 13px;
      font-weight: 500;
    }
  `],
})
export class AvatarCardComponent {
  user = input.required<PosUser>();
  selected = output<PosUser>();
}
