/**
 * useMatchingEngine.js — React hook wrapping the smart decision engine.
 *
 * Now uses `runSmartMatching` which runs 6 specialized analyzers.
 * Simulates a short "thinking" period to give AI-like UX.
 * Returns: { bestMatch, rankedList, matchReason, hasResults, filterStats, isProcessing, report }
 */

import { useState, useEffect, useRef } from 'react';
import { runSmartMatching } from '../logic/smartDecisionEngine';

const useMatchingEngine = ({ userLocation, insurance, budget, priority, hospitals, doctors, user }) => {
  const [result, setResult] = useState({
    bestMatch: null,
    rankedList: [],
    matchReason: '',
    hasResults: false,
    filterStats: { total: 0, filtered: 0 },
    report: null,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!hospitals?.length) {
      setResult({
        bestMatch: null,
        rankedList: [],
        matchReason: 'Loading hospital data...',
        hasResults: false,
        filterStats: { total: 0, filtered: 0 },
        report: null,
      });
      return;
    }

    setIsProcessing(true);

    // Slight delay to simulate "thinking" — gives AI-feel UX
    debounceRef.current = setTimeout(() => {
      try {
        const output = runSmartMatching({ userLocation, insurance, budget, priority, hospitals, doctors, user });
        setResult(output);
      } catch (err) {
        console.error('[SmartDecisionEngine] Error:', err);
        setResult({
          bestMatch: null,
          rankedList: [],
          matchReason: 'Could not compute matches. Please try again.',
          hasResults: false,
          filterStats: { total: 0, filtered: 0 },
          report: null,
        });
      } finally {
        setIsProcessing(false);
      }
    }, 350); // 350ms feels deliberate without being slow

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [userLocation, insurance, budget, priority, hospitals, doctors, user]);

  return { ...result, isProcessing };
};

export default useMatchingEngine;
