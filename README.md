# Gabriel Toolkit

Biblioteca de hooks reutilizáveis para React e Next.js, distribuída pelo [registry GitHub do shadcn](https://ui.shadcn.com/docs/registry/github). Repositório: [gab-braga/toolkit](https://github.com/gab-braga/toolkit).

## Preparar o projeto de destino

Use um projeto React 18/19 com TypeScript (Next.js App Router ou React com Vite, por exemplo), Node.js compatível com a CLI atual e npm. Configure o shadcn conforme o framework, incluindo Tailwind CSS e aliases, e inicialize na raiz:

```bash
npx shadcn@latest init
```

Se já existir `components.json`, preserve sua configuração. Os exemplos consideram `aliases.hooks` igual a `@/hooks` e `@/*` apontando para `./src/*` no `tsconfig.json` do destino (ou `./*`, se não usar `src`). A CLI instala os hooks no diretório desse alias; ajuste os imports se usar outro. Os hooks não exigem estilos Tailwind.

Todos têm `"use client"`. No Next.js App Router, use-os em componentes cliente, também com `"use client"`. Componentes de diálogo e definições de colunas devem ser criados no lado cliente.

## Hooks disponíveis

### `use-debounce`

Retorna o valor inicial imediatamente e só atualiza após um intervalo sem mudanças (300 ms por padrão). Limpa o timer na desmontagem; mantenha referências estáveis para objetos.

```bash
npx shadcn@latest add gab-braga/toolkit/use-debounce
```

### `use-async`

Retorna `run` e `loading`. `run` recebe `() => Promise<void>`, restaura o carregamento no `finally` e propaga erros ao chamador. Sua guarda depende do estado da renderização: chamadas no mesmo ciclo podem executar juntas. A referência de `run` muda entre renderizações.

```bash
npx shadcn@latest add gab-braga/toolkit/use-async
```

### `use-dialog`

Controla `open`, `state`, `openDialog`, `closeDialog` e a renderização `Dialog`. O componente recebido aceita `open`, `setOpen` e `state`; declare-o fora do consumidor. Estados como `0`, `false` e string vazia são válidos. O estado é limpo após fechar. A função `Dialog` retornada muda entre renderizações; invoque `dialog.Dialog({})` para evitar remontagens ao usá-la como um novo tipo de componente JSX. Props passadas à função podem sobrescrever as props controladas.

```bash
npx shadcn@latest add gab-braga/toolkit/use-dialog
```

### `use-reveal`

Retorna uma ref para um contêiner cujos descendentes usam `data-reveal="up|down|left|right"` e, opcionalmente, `data-reveal-delay` (0–180 ms). Em telas menores que 768 px, usa `up`. Observa os alvos presentes na montagem e fora da área inicialmente visível; respeita movimento reduzido e limpa observadores, animações e eventos ao desmontar.

```bash
npx shadcn@latest add gab-braga/toolkit/use-reveal
```

### `use-table`

Recebe `{ data, columns }` e retorna a instância TanStack `table`, resumo `pagination` e funções de consulta, filtro, ordenação e exportação. A CLI instala `@tanstack/react-table`. Mantenha `data` e `columns` estáveis. `applyFilter` trata `"all"` como remoção do filtro; `applySorting` aceita `"asc"`, `"desc"` e `"default"`.

```bash
npx shadcn@latest add gab-braga/toolkit/use-table
```

`getExportData()` retorna `{ headers, rows }` de todas as linhas filtradas e ordenadas, antes da paginação. Inclui colunas visíveis com `meta.title` e `meta.exportable !== false`; `meta.exportValue(row, value)` personaliza o valor. Não gera arquivo CSV ou Excel. `getRows()` retorna as linhas da página atual.

## Exemplos de uso

### Busca com debounce

```tsx
"use client";

import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";

export function Search() {
  const [search, setSearch] = useState("");
  const debounce = useDebounce(search, 500);
  return (
    <div>
      <input
        aria-label="Pesquisar"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <p>Busca após 500 ms: {debounce}</p>
    </div>
  );
}
```

### Operação assíncrona

```tsx
"use client";

import { useAsync } from "@/hooks/use-async";

export function Save({ saveData }: { saveData: () => Promise<void> }) {
  const { run, loading } = useAsync();
  async function save() {
    try {
      await run(saveData);
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <button disabled={loading} onClick={save}>
      Salvar
    </button>
  );
}
```

### Diálogo com estado

```tsx
"use client";

import { useDialog } from "@/hooks/use-dialog";

function MyDialog({
  open,
  setOpen,
  state,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  state: string | undefined;
}) {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label="Detalhes">
      <p>{state}</p>
      <button onClick={() => setOpen(false)}>Fechar</button>
    </div>
  );
}

export function Detalhes() {
  const dialog = useDialog<string>(MeuDialog);
  return (
    <>
      <button onClick={() => dialog.openDialog("Olá")}>Abrir</button>
      {dialog.Dialog({})}
    </>
  );
}
```

O exemplo demonstra a integração; em uma interface real, use um diálogo que implemente foco, teclado e acessibilidade, como o Dialog do shadcn.

### Animação ao rolar

```tsx
"use client";

import { useReveal } from "@/hooks/use-reveal";

export function Sections() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref}>
      <section data-reveal="left" data-reveal-delay="100">
        Conteúdo
      </section>
    </div>
  );
}
```

### Tabela e exportação

```tsx
"use client";

import { useMemo } from "react";
import { type ColumnDef, flexRender } from "@tanstack/react-table";
import { useTable } from "@/hooks/use-table";

type Pessoa = { name: string };

export function People() {
  const data = useMemo(() => [{ name: "Ana" }], []);
  const columns = useMemo<ColumnDef<Pessoa>[]>(
    () => [{ accessorKey: "name", header: "Nome", meta: { title: "Nome" } }],
    [],
  );
  const { getRows, getExportData } = useTable({ data, columns });
  return (
    <>
      <button onClick={() => console.log(getExportData())}>
        Consultar Exportação
      </button>
      <table>
        <tbody>
          {getRows().map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
```
