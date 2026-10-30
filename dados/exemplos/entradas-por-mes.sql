-- Total de entradas por cliente e por mês (mês em UTC — cuidado, ver ADR-003).
SELECT c.id,
       COALESCE(c.apelido, c.nome)   AS cliente,
       substr(t.criada_em, 1, 7)     AS mes,
       SUM(t.valor_centavos) / 100.0 AS entradas_reais
FROM clientes c
JOIN transacoes t ON t.cliente_id = c.id AND t.tipo = 'pix_entrada'
WHERE c.personagem = 1
GROUP BY c.id, mes
ORDER BY c.id, mes;
