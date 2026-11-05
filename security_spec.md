# Security & Financial Specification: Mercado Angola (Vendas, Afiliação e Monetização)

## 1. Regras Financeiras e Invariantes da Plataforma

1. **Taxa da Plataforma (5%):**
   - É calculada exclusivamente sobre o valor dos produtos de cada venda confirmada (`0.05 * valor_produtos`).
   - Todos os cálculos são executados no backend/serviço transacional, nunca confiando em valores submetidos pelo cliente.

2. **Comissão do Afiliado:**
   - Definida voluntariamente pela empresa vendedora por produto (`affiliateCommissionRate`, ex: 15% ou 20%).
   - Deduzida do valor que a empresa recebe, assegurando que a soma das taxas e comissões nunca exceda o acordado nem produza saldos negativos.

3. **Taxa de Serviço Opcional sobre o Afiliado (0% inicial):**
   - Se configurada pelo administrador (ex: 10% sobre a comissão do afiliado), deduz da comissão bruta do afiliado e reverte a favor da plataforma como receita adicional de serviço.
   - Apresentada de forma transparente e aceite antes da candidatura.

4. **Ciclo de Vida das Comissões:**
   - Estados: `pending` (aguarda pagamento) -> `validation_period` (período de garantia e devoluções, ex: 7 dias) -> `approved` -> `available_for_withdrawal` -> `processing_payout` -> `paid` (ou `reversed` em caso de cancelamento/reembolso).
   - O afiliado só pode solicitar levantamento quando o saldo estiver `available_for_withdrawal`.

5. **Proteção Antifraude e Atribuição:**
   - Proibição estrita de auto-referência (`buyerId !== affiliateId`).
   - Links de afiliação e códigos (`?ref=AFF_...`) são registados com timestamp e origem.
   - Nenhuma comissão é atribuída por cliques simples ou encomendas não confirmadas.
   - Idempotência no processamento de pagamentos para evitar duplicações.

6. **Privilégios de Administrador:**
   - Verificados no Firestore com restrição ao email `dembedomingos236@gmail.com` ou verificação direta na coleção `/admins/{adminId}`.
