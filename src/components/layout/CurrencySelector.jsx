import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Check, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { T } from '../../theme/tokens';
import { CURRENCIES } from '../../constants/presets';
import { getExchangeRate, getDailyChange, fetchExchangeRates } from '../../utils/currency';

export function CurrencySelector() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const timeoutRef = useRef(null);

  const { 
    currency: activeCurrency, 
    setCurrency, 
    exchangeRates, 
    ratesLastUpdated,
    theme 
  } = useFinanceStore();

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isDark = theme === 'dark';

  const handleMouseEnter = () => {
    if (isMobile) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const selectCurrency = (code) => {
    setCurrency(code);
    setIsOpen(false);
  };

  const handleManualRefresh = async (e) => {
    e.stopPropagation();
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const rates = await fetchExchangeRates();
      useFinanceStore.setState({
        exchangeRates: rates,
        ratesLastUpdated: new Date().toISOString()
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Compute rates relative to active currency
  const ratesList = useMemo(() => {
    const list = [];
    Object.keys(CURRENCIES).forEach(code => {
      // We want conversion From Code -> ActiveCurrency
      const rate = getExchangeRate(code, activeCurrency, exchangeRates);
      const dailyChange = getDailyChange(code, rate);
      list.push({
        code,
        flag: CURRENCIES[code].flag,
        name: CURRENCIES[code].name,
        symbol: CURRENCIES[code].symbol,
        rate: rate,
        change: dailyChange
      });
    });
    return list;
  }, [activeCurrency, exchangeRates]);

  const activeCurrencyInfo = CURRENCIES[activeCurrency] || CURRENCIES.INR;

  const dropdownVariants = {
    hidden: { opacity: 0, y: -8, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: 'easeOut' } },
    exit: { opacity: 0, y: -8, scale: 0.95, transition: { duration: 0.14, ease: 'easeIn' } }
  };

  const bottomSheetVariants = {
    hidden: { y: '100%' },
    visible: { y: 0, transition: { type: 'spring', damping: 25, stiffness: 280 } },
    exit: { y: '100%', transition: { duration: 0.2, ease: 'easeIn' } }
  };

  const formattedTime = useMemo(() => {
    if (!ratesLastUpdated) return 'Syncing...';
    try {
      const date = new Date(ratesLastUpdated);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Syncing...';
    }
  }, [ratesLastUpdated]);

  return (
    <div 
      ref={containerRef} 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      {/* Coins / Currency Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => { if (isMobile) setIsOpen(!isOpen); }}
        className="eb-theme-btn-reset"
        aria-label="Select Currency"
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          color: 'var(--text)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
          transition: 'all 0.2s ease',
          outline: 'none',
          padding: 0
        }}
      >
        <Coins size={18} />
      </motion.button>

      {/* Desktop & Tablet Dropdown */}
      {!isMobile && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="eb-profile-dropdown-glass"
              style={{
                position: 'absolute',
                top: '44px',
                right: '-80px', // slightly offset to center under trigger
                width: '380px',
                padding: '12px',
                zIndex: 1000,
                boxShadow: '0 10px 40px rgba(0,0,0,0.18)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              {/* Header inside Panel */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '4px', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: T.gold, letterSpacing: '0.05em' }}>
                  Live Currency Rates
                </span>
                <button 
                  onClick={handleManualRefresh}
                  style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <RefreshCw size={10} className={isRefreshing ? 'spinner' : ''} style={{ animation: isRefreshing ? 'spin 1.5s linear infinite' : 'none' }} />
                  <span style={{ fontSize: '0.6rem' }}>{formattedTime}</span>
                </button>
              </div>

              {/* Currency Grid */}
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '6px',
                  maxHeight: '320px',
                  overflowY: 'auto',
                  paddingRight: '2px'
                }}
                className="hide-scrollbar"
              >
                {ratesList.map(item => {
                  const isCurrent = activeCurrency === item.code;
                  const isUp = item.change >= 0;
                  return (
                    <div
                      key={item.code}
                      onClick={() => selectCurrency(item.code)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '8px 10px',
                        borderRadius: '10px',
                        background: isCurrent ? 'var(--gold-pale)' : 'rgba(255,255,255,0.02)',
                        border: isCurrent ? '1px solid var(--gold-border)' : '1px solid var(--border-light)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      className="eb-currency-rate-item"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>{item.flag}</span>
                          <span>{item.code}</span>
                        </span>
                        {isCurrent && <Check size={10} style={{ color: T.gold }} />}
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '6px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text)' }}>
                          {item.code === activeCurrency ? `1.000` : item.rate.toFixed(3)} {activeCurrencyInfo.symbol}
                        </span>
                        {item.code !== activeCurrency && (
                          <span 
                            style={{ 
                              fontSize: '0.68rem', 
                              fontWeight: 700, 
                              color: isUp ? T.sage : T.rose,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1px'
                            }}
                          >
                            {isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                            {Math.abs(item.change).toFixed(2)}%
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Mobile Bottom Sheet */}
      {isMobile && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 99999,
                  background: 'rgba(10, 10, 10, 0.4)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)'
                }}
              />

              {/* Sheet */}
              <motion.div
                variants={bottomSheetVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                style={{
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: isDark ? 'rgba(25, 23, 20, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  borderTopLeftRadius: '24px',
                  borderTopRightRadius: '24px',
                  borderTop: '1px solid var(--border-mid)',
                  boxShadow: '0 -10px 45px rgba(0, 0, 0, 0.15)',
                  padding: '24px 20px 40px',
                  zIndex: 100000,
                  maxHeight: '75vh',
                  overflowY: 'auto'
                }}
              >
                {/* Drag Handle */}
                <div style={{ width: '40px', height: '5px', background: 'var(--border-mid)', borderRadius: '10px', margin: '0 auto 20px' }} />
                
                <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 16px', textAlign: 'center' }}>
                  Select Currency
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {ratesList.map(item => {
                    const isCurrent = activeCurrency === item.code;
                    const isUp = item.change >= 0;
                    return (
                      <div
                        key={item.code}
                        onClick={() => selectCurrency(item.code)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          padding: '12px 14px',
                          borderRadius: '12px',
                          background: isCurrent ? 'var(--gold-pale)' : 'transparent',
                          border: isCurrent ? '1px solid var(--gold-border)' : '1px solid var(--border-light)',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{item.flag}</span>
                            <span>{item.code}</span>
                          </span>
                          {isCurrent && <Check size={12} style={{ color: T.gold }} />}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '8px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text)' }}>
                            {item.rate.toFixed(2)} {activeCurrencyInfo.symbol}
                          </span>
                          {item.code !== activeCurrency && (
                            <span style={{ fontSize: '0.74rem', color: isUp ? T.sage : T.rose, display: 'flex', alignItems: 'center' }}>
                              {isUp ? '+' : ''}{item.change.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
