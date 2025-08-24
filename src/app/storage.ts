import {
  Injectable,
  signal,
} from '@angular/core';

import {
  type tScenarioInput,
} from './models';

const KEY = 'pv-scenarios-v1';
const DEFAULT_INPUT: tScenarioInput[] = [];

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  load(): tScenarioInput[] {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch { }
    return DEFAULT_INPUT;
  }

  clean() {
    localStorage.removeItem(KEY);
  }

  save(list: tScenarioInput[]) {
    localStorage.setItem(KEY, JSON.stringify(list));
  }
}
