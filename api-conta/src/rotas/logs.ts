// As últimas linhas do log da api-conta (o que a ferramenta de monitoramento mostra).
import { ok, rota } from "../http.ts";
import { ultimasLinhas } from "../log.ts";

rota("GET", "/logs", ({ query }) => ok({ linhas: ultimasLinhas(Number(query.get("ultimas") ?? 50) || 50) }));
