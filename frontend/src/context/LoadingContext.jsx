import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const LoadingContext = createContext(null);

/**
 * Provider global de loading com:
 * - contagem de requisições ativas (evita sumir o spinner se houver chamadas em paralelo)
 * - tempo mínimo visível (minDelay) p/ evitar flicker
 * - helpers: showLoading, hideLoading, trackPromise
 */
export function LoadingProvider({ children, minDelay = 400 }) {
  const [activeCount, setActiveCount] = useState(0);
  const [visible, setVisible] = useState(false);

  const lastShownAtRef = useRef(0);
  const hideTimerRef = useRef(null);

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const showLoading = useCallback(() => {
    // incrementa o contador de operações em andamento
    setActiveCount((c) => c + 1);

    // garante visibilidade imediata
    clearHideTimer();
    if (!visible) {
      setVisible(true);
      lastShownAtRef.current = Date.now();
    }
  }, [visible]);

  const hideLoading = useCallback(() => {
    // decrementa com piso em 0 (por segurança)
    setActiveCount((c) => Math.max(0, c - 1));
  }, []);

  // Quando o contador chega a 0, aguardamos minDelay total na tela
  useEffect(() => {
    if (activeCount === 0 && visible) {
      const elapsed = Date.now() - lastShownAtRef.current;
      const remaining = Math.max(0, minDelay - elapsed);

      clearHideTimer();
      hideTimerRef.current = setTimeout(() => {
        setVisible(false);
      }, remaining);
    }
    return clearHideTimer;
  }, [activeCount, visible, minDelay]);

  // Helper: recebe uma Promise ou função async, liga/desliga o loading automaticamente
  const trackPromise = useCallback(
    async (promiseOrFn) => {
      showLoading();
      try {
        const p =
          typeof promiseOrFn === "function" ? promiseOrFn() : promiseOrFn;
        return await p;
      } finally {
        hideLoading();
      }
    },
    [showLoading, hideLoading]
  );

  const value = useMemo(
    () => ({
      isLoading: visible,
      activeCount,
      showLoading,
      hideLoading,
      trackPromise,
    }),
    [visible, activeCount, showLoading, hideLoading, trackPromise]
  );

  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  );
}

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    throw new Error("useLoading deve ser usado dentro de <LoadingProvider>.");
  }
  return ctx;
}
