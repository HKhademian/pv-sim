import {
  Injectable,
  signal,
} from '@angular/core';
import {
  type tTariff,
  type tScenarioInput,
  type tScenarioResult,
  type tEuroPerKWh,
  type tKWh,
  tRate,
  tEuro,
} from './models';

const DEFAULT_TARIFF: tTariff = {
  retailEurPerKWh: <tEuroPerKWh>(0.38),
  feedInEurPerKWh: <tEuroPerKWh>(0.0786),
};
const DEFAULT_PV_COST_PER_KWP = <tEuroPerKWh>(1500);
const DEFAULT_BATTERY_COST_PER_KWH = <tEuroPerKWh>(700);


@Injectable({
  providedIn: 'root'
})
export class Simulator {
  tariff = signal<tTariff>(DEFAULT_TARIFF);
  pvCostPerKwp = signal(DEFAULT_PV_COST_PER_KWP);
  batteryCostPerKWh = signal(DEFAULT_BATTERY_COST_PER_KWH);

  calculate(input: tScenarioInput): tScenarioResult {
    const productionKWh = <tKWh>(input.pvSizeKwp * input.yieldKWhPerKwp);

    let selfConsumptionShareNoBattery: tRate = input.selfConsumptionNoBattery;
    // todo: better heuristic

    let selfConsumptionWithBattery: tRate = selfConsumptionShareNoBattery;
    if (input.batteryKWh > 0) {
      const uplift = Math.min(0.4, 0.06 * input.batteryKWh); // 6% per kWh up to +40%
      selfConsumptionWithBattery = <tRate>(Math.min(0.9, selfConsumptionShareNoBattery + uplift));
    }

    const selfUsedRawKWh = Math.min(
      input.annualLoadKWh,
      productionKWh * (input.batteryKWh > 0 ? selfConsumptionWithBattery : selfConsumptionShareNoBattery)
    );

    // round-trip efficiency only to fraction that flows through battery
    const directShare = input.batteryKWh > 0 ? input.selfUseDirectShare : 1;
    const viaBattery = selfUsedRawKWh * (1 - directShare);
    const direct = selfUsedRawKWh * directShare;
    const selfUsedEffectiveKWh = <tKWh>(direct + viaBattery * input.batteryRte);

    const exportKWh = <tKWh>(Math.max(0, productionKWh - selfUsedEffectiveKWh));
    const gridImportKWh = <tKWh>(Math.max(0, input.annualLoadKWh - selfUsedEffectiveKWh));

    const { retailEurPerKWh, feedInEurPerKWh } = this.tariff();
    const avoided = <tEuro>(selfUsedEffectiveKWh * retailEurPerKWh);
    const exportRevenue = <tEuro>(exportKWh * feedInEurPerKWh);
    const year1SavingsEur = <tEuro>(avoided + exportRevenue);

    const capexEur = <tEuro>(input.pvSizeKwp * this.pvCostPerKwp() + input.batteryKWh * this.batteryCostPerKWh());
    const simplePaybackYears = year1SavingsEur > 0 ? capexEur / year1SavingsEur : Infinity;

    return {
      productionKWh,
      selfUsedEffectiveKWh,
      exportKWh,
      gridImportKWh,
      year1SavingsEur,
      capexEur,
      simplePaybackYears,
    };
  }

}
