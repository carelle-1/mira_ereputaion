import type { Entity } from './types';

export function parseEntityData<T = Partial<Entity>>(value: unknown): T {
  if (typeof value === 'string') {
    try { return JSON.parse(value) as T; } catch { return {} as T; }
  }
  return (value ?? {}) as T;
}
