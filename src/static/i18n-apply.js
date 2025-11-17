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
        
        console.log('✅ Traduções aplicadas!');
    }
    
    // Exportar função para uso global
    window.applyTranslations = applyTranslations;
    
    // Aplicar traduções quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(applyTranslations, 100); // Pequeno delay para garantir que i18n está configurado
        });
    } else {
        setTimeout(applyTranslations, 100);
    }
})();
