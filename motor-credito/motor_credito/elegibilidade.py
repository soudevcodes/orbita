"""Regras do Primeiro Cartão (ver docs/manual/03-produto.md, "Quem pode ter" e "Limite inicial")."""


def avaliar(cliente, hoje):
    """Decide se o cliente pode ter o Primeiro Cartão e qual o limite.

    cliente: {"nascimento": "AAAA-MM-DD", "conta_aberta_em": "AAAA-MM-DD",
              "entradas_por_mes": {"AAAA-MM": centavos, ...}}
    hoje:    "AAAA-MM-DD"
    """
    raise NotImplementedError("ainda não implementado — é o ticket T-010")
