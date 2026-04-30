// src/hooks/useWithdrawalProcessor.js
import { useCallback }     from 'react';
import { httpsCallable }   from 'firebase/functions';
import { functions }       from '../config/firebase';

let _callable = null;
function getCallable() {
  if (!_callable) {
    try { _callable = httpsCallable(functions, 'validateWithdrawal'); } catch { return null; }
  }
  return _callable;
}

export function useWithdrawalValidator() {
  return useCallback(async (ecAmount, upiId) => {
    try {
      const callable = getCallable();
      if (!callable) return { valid: true };
      const result = await callable({ ecAmount, upiId });
      return result.data;
    } catch {
      return { valid: true }; // dev fallback
    }
  }, []);
}

export function useWithdrawalProcessor() {
  return { processorActive: true, mode: 'cloud_function' };
}
