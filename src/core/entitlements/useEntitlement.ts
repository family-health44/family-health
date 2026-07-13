// src/core/entitlements/useEntitlement.ts
// Entitlement gate for Family Plus.
//
// BETA: everyone is Plus. No paywall, no purchase, no RevenueCat.
// LAUNCH: replace the body of usePlus() with a RevenueCat entitlement check.
// Every Plus-gated call site reads through this hook — do not scatter
// entitlement logic anywhere else.

export function usePlus(): boolean {
  return true;
}
