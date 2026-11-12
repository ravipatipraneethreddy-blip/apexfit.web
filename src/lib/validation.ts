import { createHash, randomUUID } from 'node:crypto';
export function numeric(value: unknown, label: string, min: number, max: number, integer = false): number {
  if ((typeof value !== 'string' && typeof value !== 'number') || String(value).trim() === '') throw new Error(`${label} is required`);
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max || (integer && !Number.isInteger(n))) throw new Error(`${label} must be ${integer ? 'a whole number ' : ''}between ${min} and ${max}`);
  return n;
}
export function textValue(value: unknown, label: string, max = 120): string {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) throw new Error(`${label} is required (maximum ${max} characters)`);
  return value.trim();
}
export function choice(value: unknown, options: string[], label: string) {
  if (typeof value !== 'string' || !options.includes(value)) throw new Error(`Invalid ${label.toLowerCase()}`);
  return value;
}
export function assertOwner(fd: FormData, userId: string) {
  const owner = fd.get('ownerId');
  if (owner && owner !== userId) throw new Error('Account changed. Sign in to the original account to sync this entry.');
}
export function recordId(fd: FormData, userId: string) {
  const key = fd.get('clientId');
  if (!key) return randomUUID();
  const id = textValue(key, 'Entry ID', 100);
  return createHash('sha256').update(`${userId}:${id}`).digest('hex');
}
export function logDate(value: unknown, allowFuture = false): Date {
  const d = value ? new Date(String(value)) : new Date();
  if (!Number.isFinite(d.getTime()) || d.getUTCFullYear() < 2000 || d.getTime() > Date.now() + (allowFuture ? 366 * 86400000 : 5 * 60000)) throw new Error('Invalid entry date');
  return d;
}
export function csvCell(value: string) {
  const safe = /^[\s]*[=+\-@\t\r]/.test(value) ? "'" + value : value;
  return '"' + safe.replace(/"/g, '""') + '"';
}
