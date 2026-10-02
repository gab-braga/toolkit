"use client";

import { useCallback, useEffect, useState, type JSX } from "react";

type DialogProps<T> = {
  open: boolean;
  setOpen: (open: boolean) => void;
  state: T | undefined;
};

/**
 * Controla a abertura e o estado de um componente de diálogo cliente.
 * @param Dialog Componente que recebe open, setOpen e state. Declare-o fora do
 * componente consumidor para manter sua referência estável.
 * @returns Estado, ações de abertura/fechamento e função de renderização Dialog.
 * O estado é limpo após fechar. A função retornada muda a cada renderização;
 * invoque-a como função para evitar remontar o diálogo como um novo componente.
 * @example
 * const dialog = useDialog<string>(MeuDialog);
 * // Em um componente cliente:
 * return <><button onClick={() => dialog.openDialog("Editar")}>Abrir</button>{dialog.Dialog({})}</>;
 */

export function useDialog<T = unknown>(
  Dialog: (props: DialogProps<T>) => JSX.Element | null,
) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<T>();

  const openDialog = useCallback((state?: T) => {
    if (state !== undefined) setState(state);
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) setState(undefined);
  }, [open]);

  return {
    open,
    state,
    openDialog,
    closeDialog,
    Dialog: (props: Partial<DialogProps<T>> & Record<string, unknown>) => (
      <Dialog {...{ open, setOpen, state, ...props }} />
    ),
  };
}
