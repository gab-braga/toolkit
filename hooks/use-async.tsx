"use client";

import { useState } from "react";

/**
 * Executa uma operação assíncrona e expõe seu estado de carregamento.
 * Não recebe parâmetros; use em componentes cliente.
 * @returns loading e run, que recebe uma função () => Promise<void>, propaga
 * erros e restaura loading ao terminar. Capture os erros no chamador.
 * A guarda usa o estado da renderização atual: chamadas no mesmo ciclo podem
 * executar juntas. run não mantém uma referência estável entre renderizações.
 * @example
 * const { run, loading } = useAsync();
 * async function save() {
 *   try { await run(async () => { await saveData(); }); }
 *   catch (error) { console.error(error); }
 * }
 * // <button disabled={loading} onClick={save}>Salvar</button>
 */

export function useAsync() {
  const [loading, setLoading] = useState(false);

  async function run(asyncFunction: () => Promise<void>) {
    if (loading) return;
    setLoading(true);
    try {
      await asyncFunction();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }

  return { run, loading };
}
