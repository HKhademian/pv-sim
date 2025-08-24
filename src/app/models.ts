
export interface Tariff {
  retailEurPerKWh: number; // grid import price
  feedInEurPerKWh: number; // export tariff
}

export interface ScenarioInput {
  name: string;
  annualLoadKWh: number; // house total (incl EV if any)
  pvSizeKwp: number;
  batteryKWh: number;
  yieldKWhPerKwp: number; // location-specific
  batteryRte: number; // round-trip efficiency (0..1)
  selfUseDirectShare: number; // share of self-use that is direct (not via battery) when battery exists (0..1)
  selfConsumptionNoBattery: number; // baseline self-consumption share without battery (0..1)
}

export interface ScenarioResult {
  productionKWh: number;
  selfUsedEffectiveKWh: number;
  exportKWh: number;
  gridImportKWh: number;
  year1SavingsEur: number;
  capexEur: number;
  simplePaybackYears: number;
}
