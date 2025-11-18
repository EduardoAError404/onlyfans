# Análise da Causa Raiz - Traduções Não Aplicadas

## Problema
Textos dinâmicos (SUBSCRIBE, per month, 6 MONTHS, 12 MONTHS, total, etc) não estão sendo traduzidos na página do perfil.

## Causa Raiz Identificada
O arquivo `subscription-buttons.js` está **sobrescrevendo** o conteúdo HTML dos botões com texto **hardcoded em inglês** DEPOIS que o `i18n-apply.js` já aplicou as traduções.

### Ordem de Execução
1. ✅ `dynamic-loader.js` carrega dados do perfil e define idioma via `window.i18n.setLanguage()`
2. ✅ `i18n-apply.js` aplica traduções em elementos com `data-i18n`
3. ❌ `subscription-buttons.js` **sobrescreve** o HTML dos botões com texto em inglês (linhas 97, 116-117, 131-132)

### Código Problemático

**Linha 97** (botão principal):
```javascript
priceSpan.innerHTML = `<span class="currency-symbol">${currencySymbol}</span>${plan.price.toFixed(2)} <span class="g-btn__new-line-text">per month</span>`;
```

**Linhas 115-118** (botão 6 meses):
```javascript
button.innerHTML = `
    <span class="b-btn-text">6 months <span class="b-btn-text__small">(${plan.discount}% OFF)</span></span>
    <span class="b-btn-text__small"><span class="currency-symbol">${currencySymbol}</span>${plan.total.toFixed(2)} total</span>
`;
```

**Linhas 130-133** (botão 12 meses):
```javascript
button.innerHTML = `
    <span class="b-btn-text">12 months <span class="b-btn-text__small">(${plan.discount}% OFF)</span></span>
    <span class="b-btn-text__small"><span class="currency-symbol">${currencySymbol}</span>${plan.total.toFixed(2)} total</span>
`;
```

## Solução
Modificar `subscription-buttons.js` para usar `window.i18n.t()` ao invés de texto hardcoded:

```javascript
// Antes:
priceSpan.innerHTML = `... per month`;

// Depois:
priceSpan.innerHTML = `... ${window.i18n.t('subscription.per_month')}`;
```

### Chaves de Tradução Necessárias
- `subscription.per_month` → "per month" / "por mês" / "por mes"
- `subscription.months` → "months" / "meses" / "meses"
- `subscription.off` → "off" / "desconto" / "descuento"
- `subscription.total` → "total" / "total" / "total"
