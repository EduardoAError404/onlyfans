// Script para integrar botões de assinatura com Stripe
(function() {
    'use strict';
    
    const PAYMENT_SERVER_URL = '';
    const STRIPE_KEY = 'pk_test_51RYxezDivFjPTQg4Lp0cKmlPU8BtWkzS6TV51tDfrsNSmIhJj353hK1OSumtA2ndCfl1Nt5xqNNZGgRvNLkdpLHl00qbm9wiw3';
    
    let currentProfile = null;
    let subscriptionPlans = [];
    let stripe = null;
    
    // Inicializar Stripe
    function initStripe() {
        if (typeof Stripe !== 'undefined') {
            stripe = Stripe(STRIPE_KEY);
            console.log('✅ Stripe inicializado');
        } else {
            console.error('❌ Stripe.js não carregado');
        }
    }
    
    // Obter username da URL
    function getUsername() {
        const path = window.location.pathname;
        const username = path.split('/').filter(Boolean)[0];
        return username || 'babymatosao';
    }
    
    // Carregar planos de assinatura
    async function loadPlans() {
        const username = getUsername();
        
        try {
            const response = await fetch(`${PAYMENT_SERVER_URL}/api/subscription-plans/${username}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // A API agora retorna os planos diretamente: {1_month: {...}, 6_months: {...}, 12_months: {...}}
            // Converter para array de planos
            subscriptionPlans = [
                { ...data['1_month'], id: '1_month' },
                { ...data['6_months'], id: '6_months' },
                { ...data['12_months'], id: '12_months' }
            ];
            
            console.log('✅ Planos carregados:', subscriptionPlans);
            
            return true;
            
        } catch (error) {
            console.error('❌ Erro ao carregar planos:', error);
            return false;
        }
    }
    
    // Atualizar botões com preços
    function updateButtons() {
        if (!subscriptionPlans || subscriptionPlans.length === 0) {
            console.log('⏳ Aguardando planos...');
            return;
        }
        
        console.log('🔄 Atualizando botões com planos:', subscriptionPlans);
        
        // Botão principal (1 mês)
        const mainButton = document.querySelector('.b-offer-join .g-btn');
        if (mainButton && subscriptionPlans[0]) {
            const plan = subscriptionPlans[0];
            const priceSpan = mainButton.querySelector('.b-btn-text__small');
            if (priceSpan) {
                priceSpan.innerHTML = `$${plan.price.toFixed(2)} <span class="g-btn__new-line-text">per month</span>`;
                console.log('✅ Botão 1 mês atualizado:', plan.price);
            }
            mainButton.onclick = () => openSubscribeModal('1-month');
            mainButton.style.cursor = 'pointer';
        }
        
        // Botões de bundle (6 e 12 meses)
        const bundleContainer = document.querySelector('.b-bundles-group .b-tab-container');
        const bundleButtons = bundleContainer ? bundleContainer.querySelectorAll('.b-offer-wrapper button') : [];
        
        console.log('📦 Botões de bundle encontrados:', bundleButtons.length);
        
        if (bundleButtons[0] && subscriptionPlans[1]) {
            const plan = subscriptionPlans[1]; // 6 meses
            const button = bundleButtons[0];
            
            // Atualizar texto e preço
            button.innerHTML = `
                <span class="b-btn-text">6 months <span class="b-btn-text__small">(${plan.discount}% OFF)</span></span>
                <span class="b-btn-text__small">$${plan.total.toFixed(2)} total</span>
            `;
            
            button.onclick = () => openSubscribeModal('6-months');
            button.style.cursor = 'pointer';
            console.log('✅ Botão 6 meses atualizado:', plan.total);
        }
        
        if (bundleButtons[1] && subscriptionPlans[2]) {
            const plan = subscriptionPlans[2]; // 12 meses
            const button = bundleButtons[1];
            
            // Atualizar texto e preço
            button.innerHTML = `
                <span class="b-btn-text">12 months <span class="b-btn-text__small">(${plan.discount}% OFF)</span></span>
                <span class="b-btn-text__small">$${plan.total.toFixed(2)} total</span>
            `;
            
            button.onclick = () => openSubscribeModal('12-months');
            button.style.cursor = 'pointer';
            console.log('✅ Botão 12 meses atualizado:', plan.total);
        }
        
        // Botão secundário (dentro do conteúdo bloqueado)
        const secondaryButton = document.querySelector('.b-subscribe-block .g-btn');
        if (secondaryButton) {
            secondaryButton.onclick = () => openSubscribeModal('1-month');
            secondaryButton.style.cursor = 'pointer';
            console.log('✅ Botão secundário configurado');
        }
        
        console.log('✅ Todos os botões atualizados!');
    }
    
    // Processar assinatura (chamado pelo modal de autenticação)
    async function subscribe(planId, email, name) {
        if (!stripe) {
            alert('Sistema de pagamento não inicializado. Recarregue a página.');
            return;
        }
        
        if (!email || !name) {
            alert('Email e nome são obrigatórios');
            return;
        }
        
        try {
            // Obter username da URL
            const username = getUsername();

            // Criar sessão de checkout
            const response = await fetch(`${PAYMENT_SERVER_URL}/api/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    planId: planId,
                    customerEmail: email,
                    customerName: name
                })
            });
            
            if (!response.ok) {
                throw new Error('Erro ao criar sessão de pagamento');
            }
            
            const { url } = await response.json();
            
            // Redirecionar para Stripe Checkout
            window.location.href = url;
            
        } catch (error) {
            console.error('❌ Erro ao processar assinatura:', error);
            alert('Erro ao processar assinatura. Tente novamente.');
        }
    }
    
    // Abrir modal de autenticação (chamado pelos botões)
    function openSubscribeModal(planId) {
        if (typeof window.openSubscriptionAuthModal === 'function') {
            window.openSubscriptionAuthModal(planId);
        } else {
            console.error('❌ Modal de autenticação não encontrado');
            // Fallback para o método antigo
            subscribe(planId, prompt('Email:'), prompt('Nome:'));
        }
    }
    
    // Expor função globalmente para o modal chamar
    window.subscribeToProfile = subscribe;
    
    // Verificar status de pagamento (após retorno do Stripe)
    function checkPaymentStatus() {
        const urlParams = new URLSearchParams(window.location.search);
        const payment = urlParams.get('payment');
        const sessionId = urlParams.get('session_id');
        
        if (payment === 'success' && sessionId) {
            alert('✅ Pagamento realizado com sucesso! Bem-vindo ao conteúdo exclusivo.');
            // Limpar URL
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (payment === 'cancelled') {
            // Apenas limpar URL sem mostrar alerta
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
    
    // Tentar atualizar botões com retry
    function tryUpdateButtons(attempts = 0) {
        const maxAttempts = 10;
        
        if (attempts >= maxAttempts) {
            console.log('❌ Não foi possível encontrar os botões após', maxAttempts, 'tentativas');
            return;
        }
        
        const bundleContainer = document.querySelector('.b-bundles-group .b-tab-container');
        
        if (!bundleContainer || !subscriptionPlans || subscriptionPlans.length === 0) {
            console.log(`⏳ Tentativa ${attempts + 1}/${maxAttempts} - Aguardando elementos...`);
            setTimeout(() => tryUpdateButtons(attempts + 1), 500);
            return;
        }
        
        updateButtons();
    }
    
    // Inicializar quando a página carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('📄 DOM carregado');
            initStripe();
            loadPlans().then(() => {
                setTimeout(() => tryUpdateButtons(), 500);
            });
            checkPaymentStatus();
        });
    } else {
        console.log('📄 DOM já estava carregado');
        initStripe();
        loadPlans().then(() => {
            setTimeout(() => tryUpdateButtons(), 500);
        });
        checkPaymentStatus();
    }
    
})();
