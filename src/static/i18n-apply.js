// Aplicar traduções nos elementos da página
// Este script deve ser carregado DEPOIS do i18n-translations.js e DEPOIS do dynamic-loader.js

(function() {
    'use strict';
    
    console.log('🌍 i18n-apply.js carregado');
    
    // Função para aplicar traduções nos elementos
    function applyTranslations() {
        if (!window.i18n) {
            console.warn('⚠️ i18n não está disponível ainda');
            return;
        }
        
        const lang = window.i18n.getLanguage();
        console.log(`🌍 Aplicando traduções para idioma: ${lang}`);
        
        // Aplicar traduções com data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = window.i18n.t(key);
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });
        
        // Aplicar traduções com data-i18n-html attribute (permite HTML)
        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            const translation = window.i18n.t(key);
            element.innerHTML = translation;
        });
        
        // Traduzir textos hardcoded específicos (sem data-i18n)
        // "per month" nos botões de assinatura
        document.querySelectorAll('.g-btn__new-line-text').forEach(element => {
            if (element.textContent.trim() === 'per month') {
                element.textContent = window.i18n.t('subscription.perMonth');
            }
        });
        
        // "total" nos botões de bundle
        document.querySelectorAll('.b-btn-text__small').forEach(element => {
            const text = element.textContent.trim();
            if (text.includes('total')) {
                // Manter o preço, trocar apenas "total"
                element.innerHTML = element.innerHTML.replace(/total/g, window.i18n.t('subscription.total'));
            }
            if (text.includes('OFF')) {
                // Traduzir desconto: "(20% OFF)" -> "(20% de desconto)"
                const match = text.match(/(\d+%)/);  
                if (match) {
                    const percentage = match[1];
                    element.textContent = `(${percentage} ${window.i18n.t('subscription.discount')})`;
                }
            }
        });
        
        // "SUBSCRIBE" no botão principal
        document.querySelectorAll('.b-btn-text__center').forEach(element => {
            if (element.textContent.trim() === 'SUBSCRIBE') {
                element.textContent = window.i18n.t('subscription.subscribe').toUpperCase();
            }
        });
        
        console.log('✅ Traduções aplicadas!');
    }
    
    // Exportar função para uso global
    window.applyTranslations = applyTranslations;
    
    // NÃO aplicar traduções automaticamente aqui!
    // As traduções serão aplicadas pelo dynamic-loader.js
    // DEPOIS de configurar o idioma correto do perfil
})();
