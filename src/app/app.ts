import { Component, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SimulatorService } from './simulator';
import { StorageService } from './storage';
import type {
  tTariff, tEuro, tKWhPerKwp, tRate, tEuroPerKWh, tScenarioInput, tKWh, tKwp,
} from './models';

const DEFAULT_TARIFF: tTariff = {
  retailEurPerKWh: <tEuroPerKWh>(0.38),
  feedInEurPerKWh: <tEuroPerKWh>(0.0786),
};
const DEFAULT_PV_COST_PER_KWP = <tEuroPerKWh>(1500);
const DEFAULT_BATTERY_COST_PER_KWH = <tEuroPerKWh>(700);

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    FormsModule,
    DecimalPipe,
    CurrencyPipe,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('pv-sim');

  scenarios = signal<tScenarioInput[]>([]);

  tariff = signal<tTariff>(DEFAULT_TARIFF);
  pvCostPerKwp = signal(DEFAULT_PV_COST_PER_KWP);
  batteryCostPerKWh = signal(DEFAULT_BATTERY_COST_PER_KWH);

  readonly scenario = {
    name: signal('Home+EV 7kWp + 5kWh'),
    annualLoadKWh: signal(<tKWh>(5300)),
    pvSizeKwp: signal(<tKwp>(7)),
    batteryKWh: signal(<tKWh>(5)),
    yieldKWhPerKwp: signal(<tKWhPerKwp>(1014)),
    batteryRte: signal(<tRate>(0.90)),
    selfUseDirectShare: signal(<tRate>(0.35)),
    selfConsumptionNoBattery: signal(<tRate>(0.30)),
  };

  constructor(
    public simulator: SimulatorService,
    private storage: StorageService,
  ) {
    this.scenarios.set(this.storage.load());
  }

  addScenario() {
    const s: tScenarioInput = {
      name: this.scenario.name(),
      annualLoadKWh: this.scenario.annualLoadKWh(),
      pvSizeKwp: this.scenario.pvSizeKwp(),
      batteryKWh: this.scenario.batteryKWh(),
      yieldKWhPerKwp: this.scenario.yieldKWhPerKwp(),
      batteryRte: this.scenario.batteryRte(),
      selfUseDirectShare: this.scenario.selfUseDirectShare(),
      selfConsumptionNoBattery: this.scenario.selfConsumptionNoBattery(),
    };
    const next = [...this.scenarios(), s];
    this.storage.save(next);
    this.scenarios.set(next);
  }


  removeAt(i: number) {
    const next = [...this.scenarios()].splice(i, 1);
    this.storage.save(next);
    this.scenarios.set(next);
  }

  result(s: tScenarioInput) {
    return this.simulator.calculate(s);
  }
}
