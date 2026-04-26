import { Component, input, signal, computed, output, ChangeDetectionStrategy } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

type TipoCobro = 'total' | 'parcial';
type Division = '1/2' | '1/3' | '1/4';
type MetodoPago =
  | 'efectivo' | 'mp' | 'transferencia'
  | 'visa-debito' | 'visa-credito' | 'naranja'
  | 'mc' | 'maestro' | 'amex';

export interface CobrarResult {
  tipo: TipoCobro;
  monto: number;
  metodoPago: MetodoPago;
}

interface MetodoPagoOption {
  id: MetodoPago;
  label: string;
  sub?: string;
}

@Component({
  selector: 'app-cobrar-dialog',
  standalone: true,
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="backdrop" (click)="cancelar.emit()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <!-- Head -->
        <div class="dialog__head">
          <div class="dialog__head-left">
            <div>
              <h3 class="dialog__title">Cobrar</h3>
              <p class="dialog__sub">{{ pedidoLabel() }}</p>
            </div>
          </div>
          <button class="dialog__close" (click)="cancelar.emit()" aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="dialog__body">
          <!-- Tipo de cobro -->
          <div class="section-label">Tipo de cobro</div>
          <div class="cobro-grid">
            <div class="cobro-card" [class.cobro-card--active]="tipo() === 'total'" (click)="setTipo('total')">
              <div class="cobro-icon"><span>🧾</span></div>
              <div>
                <div class="cobro-label">Total</div>
                <div class="cobro-value">{{ formatMoney(total()) }}</div>
              </div>
            </div>
            <div class="cobro-card" [class.cobro-card--active]="tipo() === 'parcial'" (click)="setTipo('parcial')">
              <div class="cobro-icon"><span>📄</span></div>
              <div>
                <div class="cobro-label cobro-label--strong">Parcial</div>
                <div class="cobro-value-sub">Monto personalizado</div>
              </div>
            </div>
          </div>

          @if (tipo() === 'parcial') {
            <div class="two-col">
              <div>
                <div class="section-label">División rápida</div>
                <div class="division-row">
                  @for (d of divisiones; track d) {
                    <button class="div-chip" [class.div-chip--active]="division() === d" (click)="setDivision(d)" type="button">{{ d }}</button>
                  }
                </div>
              </div>
              <div>
                <div class="section-label">Monto a cobrar</div>
                <input class="amount-input" [value]="amountDisplay()" (input)="onMontoInput($event)" />
              </div>
            </div>
          }
        </div>

        <div class="divider"></div>

        <!-- Métodos de pago -->
        <div class="dialog__pay-section">
          <div class="section-label">Método de pago</div>
          <div class="pay-grid">
            @for (m of metodos; track m.id) {
              <div class="pay-card" [class.pay-card--active]="metodoPago() === m.id" (click)="metodoPago.set(m.id)">
                <div class="pay-card__logo">
                  @switch (m.id) {
                    @case ('efectivo')      { <ng-container *ngTemplateOutlet="payCash; context: {active: metodoPago() === m.id}"/> }
                    @case ('mp')            { <ng-container *ngTemplateOutlet="payMp;   context: {active: metodoPago() === m.id}"/> }
                    @case ('transferencia') { <ng-container *ngTemplateOutlet="payTransfer; context: {active: metodoPago() === m.id}"/> }
                    @case ('visa-debito')   { <ng-container *ngTemplateOutlet="payVisa; context: {active: metodoPago() === m.id}"/> }
                    @case ('visa-credito')  { <ng-container *ngTemplateOutlet="payVisa; context: {active: metodoPago() === m.id}"/> }
                    @case ('naranja')       { <ng-container *ngTemplateOutlet="payNaranja; context: {active: metodoPago() === m.id}"/> }
                    @case ('mc')            { <ng-container *ngTemplateOutlet="payMc; context: {active: metodoPago() === m.id}"/> }
                    @case ('maestro')       { <ng-container *ngTemplateOutlet="payMaestro; context: {active: metodoPago() === m.id}"/> }
                    @case ('amex')          { <ng-container *ngTemplateOutlet="payAmex; context: {active: metodoPago() === m.id}"/> }
                  }
                </div>
                <div class="pay-card__label" [class.pay-card__label--active]="metodoPago() === m.id">{{ m.label }}</div>
              </div>
            }
          </div>
        </div>

        <!-- Total a cobrar -->
        <div class="total-row">
          <div class="total-row__label">Total a cobrar</div>
          <div class="total-row__value">{{ formatMoney(montoFinal()) }}</div>
        </div>

        <div class="dialog__footer">
          <button class="btn btn--cancel" (click)="cancelar.emit()" type="button">Cancelar</button>
          <button class="btn btn--confirm" (click)="onConfirmar()" type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
            Confirmar
          </button>
        </div>
      </div>
    </div>

    <!-- Logos como templates -->
    <ng-template #payCash let-active="active">
      <svg width="42" height="22" viewBox="0 0 60 30" fill="none">
        <rect x="1" y="3" width="58" height="24" rx="3" [attr.fill]="active ? 'rgba(255,255,255,0.06)' : '#E8FAF4'" [attr.stroke]="active ? '#FFFFFF' : '#1ABC9C'" stroke-width="2"/>
        <ellipse cx="30" cy="15" rx="6" ry="6" [attr.stroke]="active ? '#FFFFFF' : '#1ABC9C'" stroke-width="2"/>
        <path d="M30 11v8M28 13h3a1.5 1.5 0 010 3h-2a1.5 1.5 0 000 3h3" [attr.stroke]="active ? '#FFFFFF' : '#1ABC9C'" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </ng-template>
    <ng-template #payMp let-active="active">
      <svg width="42" height="22" viewBox="0 0 60 30" fill="none">
        <ellipse cx="30" cy="15" rx="22" ry="10" [attr.fill]="active ? '#FFFFFF' : '#00BCEB'" opacity="0.18"/>
        <path d="M10 17c5-5 12-7 20-7s15 2 20 7" [attr.stroke]="active ? '#FFFFFF' : '#00BCEB'" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <circle cx="30" cy="15" r="3" [attr.fill]="active ? '#FFFFFF' : '#00BCEB'"/>
      </svg>
    </ng-template>
    <ng-template #payTransfer let-active="active">
      <svg width="32" height="22" viewBox="0 0 30 24" fill="none">
        <path d="M22 2l6 6m0 0l-6 6m6-6H8" [attr.stroke]="active ? '#FFFFFF' : '#F27920'" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8 22l-6-6m0 0l6-6m-6 6h20" [attr.stroke]="active ? '#FFFFFF' : '#F27920'" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </ng-template>
    <ng-template #payVisa let-active="active">
      <span class="logo-visa" [class.logo-visa--active]="active">VISA</span>
    </ng-template>
    <ng-template #payNaranja let-active="active">
      <svg width="28" height="24" viewBox="0 0 32 26" fill="none">
        <path d="M4 22V4l16 16V4" [attr.stroke]="active ? '#FFFFFF' : '#FF6F00'" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </ng-template>
    <ng-template #payMc let-active="active">
      <svg width="36" height="22" viewBox="0 0 40 24" fill="none">
        <circle cx="15" cy="12" r="10" [attr.fill]="active ? '#FFFFFF' : '#EB001B'"/>
        <circle cx="25" cy="12" r="10" [attr.fill]="active ? 'rgba(255,255,255,0.55)' : '#F79E1B'" fill-opacity="0.85"/>
      </svg>
    </ng-template>
    <ng-template #payMaestro let-active="active">
      <svg width="36" height="22" viewBox="0 0 40 24" fill="none">
        <circle cx="15" cy="12" r="10" [attr.fill]="active ? 'rgba(255,255,255,0.55)' : '#EB001B'"/>
        <circle cx="25" cy="12" r="10" [attr.fill]="active ? '#FFFFFF' : '#0099DF'" fill-opacity="0.85"/>
      </svg>
    </ng-template>
    <ng-template #payAmex let-active="active">
      <span class="logo-amex" [class.logo-amex--active]="active">AMEX</span>
    </ng-template>
  `,
  styles: [`
    .backdrop {
      position: fixed; inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex; align-items: center; justify-content: center;
      z-index: 200; animation: fadeIn 0.15s ease-out; padding: 16px;
    }
    .dialog {
      background: #fff;
      border-radius: 16px;
      width: 600px; max-width: 100%;
      max-height: 90vh; overflow-y: auto;
      animation: slideUp 0.2s ease-out;
      font-family: inherit;
      color: #1a1a1a;
    }

    /* Head */
    .dialog__head {
      display: flex; align-items: flex-start; justify-content: space-between;
      gap: 16px; padding: 22px 24px 18px;
      border-bottom: 1px solid #F3F4F6;
    }
    .dialog__head-left { display: flex; align-items: center; gap: 12px; }
    .dialog__head-icon { font-size: 26px; line-height: 1; }
    .dialog__title {
      font-size: 18px; font-weight: 700; color: #1a1a1a;
      margin: 0;
    }
    .dialog__sub {
      margin: 2px 0 0;
      font-size: 13px; color: #6B7280; font-weight: 500;
    }
    .dialog__close {
      width: 32px; height: 32px; border-radius: 8px;
      border: none; background: #F3F4F6; color: #6B7280;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: background 0.12s;
    }
    .dialog__close:hover { background: #E5E7EB; color: #1a1a1a; }

    /* Body */
    .dialog__body { padding: 20px 24px 8px; }
    .section-label {
      font-size: 11px; color: #6B7280; font-weight: 700;
      margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;
    }

    .cobro-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
      margin-bottom: 18px;
    }
    .cobro-card {
      border: 1.5px solid #E5E7EB;
      border-radius: 12px;
      padding: 14px 16px;
      background: #fff;
      cursor: pointer;
      display: flex; align-items: center; gap: 12px;
      transition: all .15s ease;
    }
    .cobro-card:hover { border-color: #F27920; }
    .cobro-card--active {
      border-color: #F27920;
      background: #FFF7ED;
    }
    .cobro-icon {
      width: 40px; height: 40px; border-radius: 10px;
      background: #FFF7ED;
      display: grid; place-items: center;
      flex-shrink: 0;
      font-size: 20px; line-height: 1;
    }
    .cobro-card--active .cobro-icon { background: #fff; }
    .cobro-label {
      font-size: 12px; color: #6B7280; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.4px;
    }
    .cobro-label--strong { color: #F27920; font-size: 15px; text-transform: none; letter-spacing: 0; }
    .cobro-value {
      font-size: 18px; color: #1a1a1a; font-weight: 800;
      margin-top: 2px;
    }
    .cobro-value-sub {
      font-size: 12px; color: #6B7280;
      margin-top: 2px; font-weight: 500;
    }

    .two-col {
      display: grid; grid-template-columns: 1fr 1fr; gap: 18px;
      margin-bottom: 18px;
    }
    .division-row { display: flex; gap: 8px; }
    .div-chip {
      flex: 1; padding: 10px 0;
      border: 1.5px solid #E5E7EB; border-radius: 10px;
      background: #fff; cursor: pointer;
      font-size: 13px; font-weight: 600; color: #6B7280;
      text-align: center; font-family: inherit;
      transition: all .15s;
    }
    .div-chip:hover { border-color: #F27920; color: #F27920; }
    .div-chip--active {
      border-color: #F27920;
      color: #F27920;
      background: #FFF7ED;
    }
    .amount-input {
      width: 100%;
      padding: 10px 14px;
      border: 1.5px solid #E5E7EB;
      border-radius: 10px;
      font-size: 14px; font-weight: 600; color: #1a1a1a;
      font-family: inherit;
      outline: none;
      background: #fff;
      box-sizing: border-box;
      transition: border-color 0.15s;
    }
    .amount-input:focus { border-color: #F27920; }

    .divider { height: 1px; background: #F3F4F6; margin: 0 24px; }

    /* Métodos de pago */
    .dialog__pay-section { padding: 18px 24px 4px; }
    .pay-grid {
      display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px;
    }
    .pay-card {
      aspect-ratio: 1.05 / 1;
      border: 1.5px solid #E5E7EB;
      border-radius: 12px;
      background: #fff;
      cursor: pointer;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 6px;
      transition: all .15s;
      padding: 8px;
    }
    .pay-card:hover { border-color: #F27920; }
    .pay-card--active {
      background: #F27920;
      border-color: #F27920;
    }
    .pay-card__logo { height: 22px; display: grid; place-items: center; }
    .pay-card__label {
      font-size: 11px; font-weight: 600; color: #1a1a1a;
      text-align: center;
    }
    .pay-card__label--active { color: #fff; }

    .logo-visa {
      font-size: 15px; font-weight: 900; color: #1A1F71;
      letter-spacing: -.01em; font-style: italic; font-family: system-ui;
    }
    .logo-visa--active { color: #fff; }
    .logo-amex {
      background: #2E77BC; color: #fff;
      padding: 2px 7px; border-radius: 4px;
      font-weight: 900; font-size: 10px; letter-spacing: .04em;
      font-family: system-ui;
    }
    .logo-amex--active { background: #fff; color: #2E77BC; }

    /* Total */
    .total-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px 24px 6px;
    }
    .total-row__label {
      font-size: 12px; color: #6B7280; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.5px;
    }
    .total-row__value {
      font-size: 26px; font-weight: 800; color: #1a1a1a;
    }

    /* Footer */
    .dialog__footer {
      padding: 14px 24px 22px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    .btn {
      padding: 10px 24px; border-radius: 10px;
      font-size: 13px; font-weight: 600;
      cursor: pointer; font-family: inherit;
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      transition: background 0.15s, color 0.15s;
    }
    .btn--cancel {
      border: 1.5px solid #E5E7EB; background: #fff; color: #6B7280;
    }
    .btn--cancel:hover { background: #F9FAFB; }
    .btn--confirm {
      border: none; background: #F27920; color: #fff;
    }
    .btn--confirm:hover { background: #E06D15; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `],
})
export class CobrarDialogComponent {
  total = input.required<number>();
  pedidoLabel = input<string>('Mesa · Pedido');

  confirmar = output<CobrarResult>();
  cancelar = output<void>();

  readonly tipo = signal<TipoCobro>('total');
  readonly division = signal<Division>('1/2');
  readonly metodoPago = signal<MetodoPago>('efectivo');
  readonly customAmount = signal<number>(0);

  readonly divisiones: Division[] = ['1/2', '1/3', '1/4'];

  readonly metodos: MetodoPagoOption[] = [
    { id: 'efectivo',      label: 'Efectivo' },
    { id: 'mp',            label: 'Mercado Pago' },
    { id: 'transferencia', label: 'Transferencia' },
    { id: 'visa-debito',   label: 'Débito' },
    { id: 'visa-credito',  label: 'Crédito' },
    { id: 'naranja',       label: 'Crédito', sub: 'Naranja' },
    { id: 'mc',            label: 'Crédito', sub: 'Mastercard' },
    { id: 'maestro',       label: 'Maestro' },
    { id: 'amex',          label: 'Crédito', sub: 'Amex' },
  ];

  readonly montoFinal = computed(() => {
    if (this.tipo() === 'total') return this.total();
    return this.customAmount() || this.total();
  });

  readonly amountDisplay = computed(() =>
    '$ ' + (this.customAmount() || 0).toLocaleString('es-AR'),
  );

  setTipo(t: TipoCobro): void {
    this.tipo.set(t);
    if (t === 'parcial') {
      const fraction = this.fractionFor(this.division());
      this.customAmount.set(Math.round(this.total() / fraction));
    }
  }

  setDivision(d: Division): void {
    this.division.set(d);
    this.customAmount.set(Math.round(this.total() / this.fractionFor(d)));
  }

  onMontoInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value.replace(/\D/g, '');
    const num = parseInt(raw, 10);
    if (!isNaN(num)) this.customAmount.set(num);
  }

  formatMoney(n: number): string {
    return '$' + n.toLocaleString('es-AR');
  }

  private fractionFor(d: Division): number {
    return d === '1/2' ? 2 : d === '1/3' ? 3 : 4;
  }

  onConfirmar(): void {
    this.confirmar.emit({
      tipo: this.tipo(),
      monto: this.montoFinal(),
      metodoPago: this.metodoPago(),
    });
  }
}
