// Sistema de Internacionalização (i18n) para OnlyFans Clone
// Traduções para Português, Inglês e Espanhol

const translations = {
    pt: {
        // Navegação e Menu
        nav: {
            posts: 'Posts',
            media: 'Mídia',
            photos: 'Fotos',
            videos: 'Vídeos',
            likes: 'Curtidas'
        },
        
        // Botões de Assinatura
        subscription: {
            subscribe: 'Assinar',
            perMonth: 'por mês',
            total: 'total',
            months: 'meses',
            month: 'mês',
            discount: 'OFF'
        },
        
        // Informações do Perfil
        profile: {
            location: 'Localização',
            website: 'Website',
            joined: 'Entrou em'
        },
        
        // Checkout
        checkout: {
            title: 'Finalizar Assinatura',
            selectPlan: 'Selecione um Plano',
            monthly: 'Mensal',
            bundleSave: 'Economize',
            paymentMethod: 'Método de Pagamento',
            cardNumber: 'Número do Cartão',
            expiryDate: 'Data de Validade',
            cvc: 'CVC',
            completePayment: 'Completar Pagamento',
            processing: 'Processando...',
            securePayment: 'Pagamento Seguro',
            cancel: 'Cancelar'
        },
        
        // Mensagens
        messages: {
            loading: 'Carregando...',
            error: 'Erro ao carregar',
            success: 'Sucesso!',
            subscribed: 'Assinatura realizada com sucesso!'
        }
    },
    
    en: {
        // Navigation and Menu
        nav: {
            posts: 'Posts',
            media: 'Media',
            photos: 'Photos',
            videos: 'Videos',
            likes: 'Likes'
        },
        
        // Subscription Buttons
        subscription: {
            subscribe: 'Subscribe',
            perMonth: 'per month',
            total: 'total',
            months: 'months',
            month: 'month',
            discount: 'OFF'
        },
        
        // Profile Information
        profile: {
            location: 'Location',
            website: 'Website',
            joined: 'Joined'
        },
        
        // Checkout
        checkout: {
            title: 'Complete Subscription',
            selectPlan: 'Select a Plan',
            monthly: 'Monthly',
            bundleSave: 'Save',
            paymentMethod: 'Payment Method',
            cardNumber: 'Card Number',
            expiryDate: 'Expiry Date',
            cvc: 'CVC',
            completePayment: 'Complete Payment',
            processing: 'Processing...',
            securePayment: 'Secure Payment',
            cancel: 'Cancel'
        },
        
        // Messages
        messages: {
            loading: 'Loading...',
            error: 'Error loading',
            success: 'Success!',
            subscribed: 'Successfully subscribed!'
        }
    },
    
    es: {
        // Navegación y Menú
        nav: {
            posts: 'Publicaciones',
            media: 'Medios',
            photos: 'Fotos',
            videos: 'Videos',
            likes: 'Me gusta'
        },
        
        // Botones de Suscripción
        subscription: {
            subscribe: 'Suscribirse',
            perMonth: 'por mes',
            total: 'total',
            months: 'meses',
            month: 'mes',
            discount: 'DESC'
        },
        
        // Información del Perfil
        profile: {
            location: 'Ubicación',
            website: 'Sitio web',
            joined: 'Se unió'
        },
        
        // Checkout
        checkout: {
            title: 'Completar Suscripción',
            selectPlan: 'Seleccione un Plan',
            monthly: 'Mensual',
            bundleSave: 'Ahorre',
            paymentMethod: 'Método de Pago',
            cardNumber: 'Número de Tarjeta',
            expiryDate: 'Fecha de Vencimiento',
            cvc: 'CVC',
            completePayment: 'Completar Pago',
            processing: 'Procesando...',
            securePayment: 'Pago Seguro',
            cancel: 'Cancelar'
        },
        
        // Mensajes
        messages: {
            loading: 'Cargando...',
            error: 'Error al cargar',
            success: '¡Éxito!',
            subscribed: '¡Suscripción exitosa!'
        }
    }
};

// Classe para gerenciar traduções
class I18n {
    constructor() {
        this.currentLanguage = 'en'; // Idioma padrão
        this.translations = translations;
    }
    
    // Define o idioma atual
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            console.log(`🌍 Idioma alterado para: ${lang}`);
            return true;
        }
        console.warn(`⚠️ Idioma '${lang}' não encontrado. Usando '${this.currentLanguage}'.`);
        return false;
    }
    
    // Obtém uma tradução por chave (ex: 'nav.posts')
    t(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                console.warn(`⚠️ Chave de tradução não encontrada: ${key}`);
                return key; // Retorna a chave se não encontrar
            }
        }
        
        return value || key;
    }
    
    // Obtém o idioma atual
    getLanguage() {
        return this.currentLanguage;
    }
    
    // Verifica se um idioma está disponível
    hasLanguage(lang) {
        return !!this.translations[lang];
    }
    
    // Lista todos os idiomas disponíveis
    getAvailableLanguages() {
        return Object.keys(this.translations);
    }
}

// Instância global do i18n
const i18n = new I18n();

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.i18n = i18n;
}
