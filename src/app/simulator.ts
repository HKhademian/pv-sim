import { Injectable } from '@angular/core';
import {
  tTariff, tScenarioInput, tScenarioResult, tEuroPerKWh, tKWh, tRate, tEuro, tEuroPerKwp,
} from './models';

@Injectable({
  providedIn: 'root'
})
export class SimulatorService {

  calculate(
    input: tScenarioInput,
    tariff: tTariff,
    pvCostPerKwp: tEuroPerKwp,
    batteryCostPerKWh: tEuroPerKWh,
  ): tScenarioResult {
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

    const { retailEurPerKWh, feedInEurPerKWh } = tariff;
    const avoided = <tEuro>(selfUsedEffectiveKWh * retailEurPerKWh);
    const exportRevenue = <tEuro>(exportKWh * feedInEurPerKWh);
    const year1SavingsEur = <tEuro>(avoided + exportRevenue);

    const capexEur = <tEuro>(input.pvSizeKwp * pvCostPerKwp + input.batteryKWh * batteryCostPerKWh);
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
