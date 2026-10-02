# Gabriel Toolkit

Biblioteca de código-fonte reutilizável para React e Next.js, distribuída pelo registry do shadcn.

## Publicar

1. Crie um repositório público chamado `gabriel-toolkit` no GitHub.
2. Substitua `SEU_USUARIO` em `registry.json` pelo seu usuário do GitHub.
3. Envie o conteúdo desta pasta para a raiz do repositório: `registry.json`, `hooks/` e este README. Não coloque tudo dentro de uma subpasta.

Não é necessário publicar um pacote npm, hospedar um servidor ou gerar JSON de build para esse formato de registry GitHub.

## Validar depois de publicar

```bash
npx shadcn@latest registry validate SEU_USUARIO/gabriel-toolkit
```

## Instalar em um projeto Next.js

Na raiz do projeto que receberá o hook, inicialize o shadcn se ainda não houver `components.json`:

```bash
npx shadcn@latest init
```

Depois instale o recurso:

```bash
npx shadcn@latest add SEU_USUARIO/gabriel-toolkit/use-debounce
```

A CLI usa a configuração de aliases do projeto para instalar o hook. Ajuste o import do exemplo se seu alias de hooks for diferente de `@/hooks`.

## Exemplo de uso

```tsx
"use client";

import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";

export default function Example() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  return (
    <div>
      <input
        aria-label="Pesquisar"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <p>Valor após 500 ms sem digitar: {debouncedSearch}</p>
    </div>
  );
}
```

O valor inicial é retornado imediatamente. Cada mudança reinicia o timer. O timer é limpo na desmontagem. Para objetos, mantenha referências estáveis para evitar reiniciar o timer em cada renderização.

## Adicionar recursos

Crie o arquivo e acrescente um item ao array `items` do `registry.json`. Use `registry:hook` para hooks e `registry:ui` para componentes de UI. Declare pacotes externos em `dependencies` e outros recursos em `registryDependencies` quando necessário. O use-debounce utiliza apenas React, que já existe no projeto Next.js.

## Atualizações e verificação

O código é copiado para o projeto e pode ser editado. Atualizações no repositório não se propagam automaticamente. Revise diferenças antes de substituir uma cópia personalizada.

Neste pacote, o JSON foi analisado e os caminhos dos arquivos foram conferidos localmente. A instalação remota e a execução em React ainda precisam ser verificadas após a publicação.

Documentação: https://ui.shadcn.com/docs/registry/github
