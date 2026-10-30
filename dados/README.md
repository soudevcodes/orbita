# dados

Consultas SQL que o Risco (Lúcia) e a PM (Bianca) usam para decidir. Elas leem direto do seu `orbita.db`.

Para rodar uma consulta:

```bash
npx orbita sql dados/exemplos/entradas-por-mes.sql
```

As tabelas estão descritas em `ferramentas/banco.mjs` (`ESQUEMA`). Lembre: valores em **centavos** e datas em **UTC** (ADR-001 e ADR-003).
