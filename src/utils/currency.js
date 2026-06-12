import { useFinanceStore } from '../store/useFinanceStore';
import { db } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';

export const STATIC_FALLBACK_RATES = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.78,
  CHF: 0.89,
  JPY: 157.0,
  CAD: 1.37,
  AUD: 1.51,
  INR: 83.5,
  SGD: 1.35,
  AED: 3.67
};

/**
 * Fetch latest exchange rates with failover.
 * Base currency is USD.
 */
export async function fetchExchangeRates() {
  try {
    console.log("Fetching live exchange rates from Frankfurter API...");
    const res = await fetch('https://api.frankfurter.app/latest?base=USD');
    if (!res.ok) throw new Error("Frankfurter response not OK");
    const data = await res.json();
    if (data && data.rates) {
      const rates = { USD: 1.0, ...data.rates };
      saveRatesToCache(rates);
      return rates;
    }
  } catch (err) {
    console.warn("Frankfurter API failed. Attempting failover to Open ER API...", err);
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!res.ok) throw new Error("ER API response not OK");
      const data = await res.json();
      if (data && data.rates) {
        saveRatesToCache(data.rates);
        return data.rates;
      }
    } catch (failoverErr) {
      console.error("All exchange rate APIs failed. Loading cached/fallback rates.", failoverErr);
    }
  }
  return loadRatesFromCache();
}

function saveRatesToCache(rates) {
  try {
    const cacheObj = {
      rates,
      timestamp: Date.now()
    };
    localStorage.setItem('eb_exchange_cache', JSON.stringify(cacheObj));
  } catch (e) {
    console.warn("Could not cache rates in localStorage:", e);
  }
}

function loadRatesFromCache() {
  try {
    const cacheRaw = localStorage.getItem('eb_exchange_cache');
    if (cacheRaw) {
      const cache = JSON.parse(cacheRaw);
      // If cache is valid (even if old, since we are offline), use it
      if (cache && cache.rates) {
        console.log("Loaded exchange rates from local cache.");
        return cache.rates;
      }
    }
  } catch (e) {
    console.warn("Could not read rates from cache:", e);
  }
  console.log("Using static fallback exchange rates.");
  return STATIC_FALLBACK_RATES;
}

/**
 * Get exchange rate fromCurrency -> toCurrency
 */
export function getExchangeRate(from, to, rates) {
  const activeRates = rates || STATIC_FALLBACK_RATES;
  const rateFrom = activeRates[from] || STATIC_FALLBACK_RATES[from] || 1.0;
  const rateTo = activeRates[to] || STATIC_FALLBACK_RATES[to] || 1.0;
  return rateTo / rateFrom;
}

/**
 * Convert amount fromCurrency -> toCurrency
 */
export function convertCurrency(amount, from, to, rates) {
  if (from === to) return amount;
  return amount * getExchangeRate(from, to, rates);
}

/**
 * Enterprise-grade global user currency preference change.
 * Updates all salaries, goals, and milestones in the store and Firestore.
 */
export async function changeUserCurrency(newCurrencyCode) {
  const store = useFinanceStore.getState();
  const oldCurrency = store.currency || 'INR';
  const newCurrency = newCurrencyCode;
  
  if (oldCurrency === newCurrency) return;
  
  let rates = store.exchangeRates;
  if (!rates) {
    rates = await fetchExchangeRates();
  }
  
  const multiplier = getExchangeRate(oldCurrency, newCurrency, rates);
  console.log(`Converting user wealth data: ${oldCurrency} -> ${newCurrency} (Multiplier: ${multiplier})`);
  
  const convertedP1 = Math.round(store.p1Salary * multiplier);
  const convertedP2 = Math.round(store.p2Salary * multiplier);
  
  const convertedGoals = {};
  if (store.goalTargets) {
    Object.keys(store.goalTargets).forEach(key => {
      convertedGoals[key] = Math.round(store.goalTargets[key] * multiplier);
    });
  }
  
  const convertedMilestones = (store.milestones || []).map(m => ({
    ...m,
    targetCost: Math.round(m.targetCost * multiplier),
    monthlySaved: Math.round(m.monthlySaved * multiplier)
  }));
  
  // Update store state
  useFinanceStore.setState({
    currency: newCurrency,
    p1Salary: convertedP1,
    p2Salary: convertedP2,
    goalTargets: convertedGoals,
    milestones: convertedMilestones
  });
  
  // Recalculate allocations and insights
  useFinanceStore.getState().syncInsightsData();
  
  // Update Firestore user document
  const currentUser = store.user;
  if (currentUser?.uid && db) {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const settingsMap = {
        language: store.language || 'English',
        currency: newCurrency,
        timezone: store.timezone || 'GMT+5:30'
      };
      await updateDoc(userRef, {
        currency: newCurrency,
        settings: settingsMap
      });
      console.log("Firestore currency preference and settings map updated.");
    } catch (err) {
      console.warn("Could not save currency update to Firestore:", err);
    }
  }
}

/**
 * Background Scheduler to update rates every 30 minutes
 */
let schedulerInterval = null;
export function startExchangeRateScheduler() {
  if (schedulerInterval) return;
  
  const runUpdate = async () => {
    const rates = await fetchExchangeRates();
    useFinanceStore.setState({
      exchangeRates: rates,
      ratesLastUpdated: new Date().toISOString()
    });
  };
  
  // Run immediately on startup
  runUpdate();
  
  // Schedule every 30 minutes (30 * 60 * 1000)
  schedulerInterval = setInterval(runUpdate, 30 * 60 * 1000);
}
