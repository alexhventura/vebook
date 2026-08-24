import React, { useSyncExternalStore } from 'react';
import { getOfficeStoreSnapshot, initOfficeStore, subscribeOfficeStore } from '../data/officeStore';

let didInit = false;

export function useOfficeStore() {
  if (!didInit) {
    didInit = true;
    void initOfficeStore();
  }
  return useSyncExternalStore(subscribeOfficeStore, getOfficeStoreSnapshot, getOfficeStoreSnapshot);
}
