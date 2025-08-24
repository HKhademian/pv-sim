declare const _PER_: unique symbol;

/** currency, price / revenue / cost */
export type tEuro = number & { readonly '': unique symbol; };
/** energy , kilowatt-hour */
export type tKWh = number & { readonly '': unique symbol; };
/** power , kilowatt-peak */
export type tKwp = number & { readonly '': unique symbol; };

export type tRate = number & { readonly '': unique symbol; };

/** price per energy */
export type tEuroPerKWh = tEuro & { readonly [_PER_]: tKWh; };

/** price per power */
export type tEuroPerKwp = tEuro & { readonly [_PER_]: tKwp; };

/** conversion rate */
export type tKWhPerKwp = tKWh & { readonly [_PER_]: tKwp; };


export interface tTariff {
  retailEurPerKWh: tEuroPerKWh; // grid import price
  feedInEurPerKWh: tEuroPerKWh; // export tariff
}

export interface tScenarioInput {
  name: string;
  annualLoadKWh: tKWh; // house total (incl EV if any)
  pvSizeKwp: tKwp;
  batteryKWh: tKWh;
  yieldKWhPerKwp: tKWhPerKwp; // location-specific
  batteryRte: tRate; // round-trip efficiency (0..1)
  selfUseDirectShare: tRate; // share of self-use that is direct (not via battery) when battery exists (0..1)
  selfConsumptionNoBattery: tRate; // baseline self-consumption share without battery (0..1)
}

export interface tScenarioResult {
  productionKWh: tKWh;
  selfUsedEffectiveKWh: tKWh;
  exportKWh: tKWh;
  gridImportKWh: tKWh;
  year1SavingsEur: tEuro;
  capexEur: tEuro;
  simplePaybackYears: number;
}
