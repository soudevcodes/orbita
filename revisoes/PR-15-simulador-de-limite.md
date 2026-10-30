# PR #15 — Simulador de limite para o painel do Risco

**Autor:** Marcos Teixeira (dev júnior, squad Cartão)
**Revisores:** você, Renata Sato

> A Lúcia quer simular o limite dos clientes no painel do Risco sem esperar o motor inteiro. Pedi para o assistente de IA escrever o cálculo a partir da regra do manual ("Limite inicial") e revisei o código. A IA também sugeriu ignorar os meses sem dados, "para a média não ficar distorcida" — achei uma boa ideia.

## Como testei
A IA gerou os testes abaixo e todos passam:

```python
def test_limite_assalariado():
    entradas = {"2026-04": 200000, "2026-05": 200000, "2026-06": 200000,
                "2026-07": 200000, "2026-08": 200000, "2026-09": 200000}
    assert limite_sugerido(entradas) == 60000      # R$ 600,00

def test_limite_minimo():
    entradas = {m: 30000 for m in ["2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09"]}
    assert limite_sugerido(entradas) == 10000      # R$ 100,00

def test_limite_maximo():
    entradas = {m: 900000 for m in ["2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09"]}
    assert limite_sugerido(entradas) == 150000     # R$ 1.500,00
```

## Arquivo novo: `motor-credito/motor_credito/simulador.py`

```python
 1  """Simulador de limite para o painel do Risco (PR #15)."""
 2
 3  LIMITE_MINIMO = 10_000   # R$ 100,00
 4  LIMITE_MAXIMO = 150_000  # R$ 1.500,00
 5
 6
 7  def media_mensal(entradas_por_mes):
 8      """Média mensal das entradas dos 6 meses fechados, em centavos."""
 9      valores = [v for v in entradas_por_mes.values() if v > 0]
10      if not valores:
11          return 0
12      return sum(valores) // len(valores)
13
14
15  def limite_sugerido(entradas_por_mes):
16      """30% da média, para baixo até múltiplo de R$ 50, entre R$ 100 e R$ 1.500."""
17      trinta_por_cento = media_mensal(entradas_por_mes) * 30 // 100
18      limite = trinta_por_cento // 5_000 * 5_000
19      return max(LIMITE_MINIMO, min(LIMITE_MAXIMO, limite))
```

> `entradas_por_mes` chega do jeito do contrato do motor (manual, "A arquitetura"): `{"AAAA-MM": centavos}`, só com os 6 meses fechados.

---

**Sua revisão:** encontre a linha com o problema e explique, em poucas linhas, o que acontece e um caso que mostra. Entregue com:

```bash
npx orbita entregar T-013 --linha motor-credito/motor_credito/simulador.py:NN --texto "seu comentário de revisão"
```
