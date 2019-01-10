import { InjectionToken } from '@angular/core';

export const SESSION_STORAGE_TOKEN = new InjectionToken<Storage>('session-storage');

export function sessionStorageFactory(): Storage {
  return sessionStorage;
}
