"use client";

import { useEffect, useState } from "react";

/**
 * Retorna o valor inicial imediatamente e adia as atualizações seguintes.
 * @param value Valor observado; objetos devem ter referências estáveis.
 * @param delay Intervalo sem mudanças, em milissegundos (padrão: 300).
 * @returns Último valor cujo intervalo de espera terminou.
 * Use em componentes cliente. Cada mudança reinicia o timer, que também é
 * cancelado na desmontagem.
 * @example
 * const [search, setSearch] = useState("");
 * const searchDebounced = useDebounce(search, 500);
 */

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
}
