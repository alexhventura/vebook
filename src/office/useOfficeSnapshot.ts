import { useSyncExternalStore } from 'react';
import { getOfficeSnapshot, subscribeOfficeStore } from './repository';

export function useOfficeSnapshot() {
  return useSyncExternalStore(subscribeOfficeStore, getOfficeSnapshot, getOfficeSnapshot);
}
