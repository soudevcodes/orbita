"""Regras do Primeiro Cartão (ver docs/manual/03-produto.md, "Quem pode ter" e "Limite inicial")."""


def avaliar(cliente, hoje):
    """Decide se o cliente pode ter o Primeiro Cartão e qual o limite.

    cliente: {"nascimento": "AAAA-MM-DD", "conta_aberta_em": "AAAA-MM-DD",
              "entradas_por_mes": {"AAAA-MM": centavos, ...}}
              (mês que não aparece = mês sem entrada; meses fora da janela são ignorados)
    hoje:    "AAAA-MM-DD"

    Devolve (contrato completo em docs/manual/04-arquitetura.md):
        {"elegivel": True,  "motivos": [],          "limite_centavos": 45000}
        {"elegivel": False, "motivos": ["idade"],   "limite_centavos": None}
    motivos possíveis: "idade", "conta_recente", "entradas" — todos os que falharem.
    """
    raise NotImplementedError("ainda não implementado — é o ticket T-010")
