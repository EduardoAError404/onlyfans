// Sistema de Modal de Assinatura com Stripe
// Configuração
const PAYMENT_SERVER_URL = 'https://3000-i2ejz6b6w70y9z0vkkk48-edd9f582.manusvm.computer';
// NOTA: Substitua pela sua chave publicável de TESTE do Stripe
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51234567890abcdefghijklmnopqrstuvwxyz';

// Variáveis globais
let currentProfile = null;
let subscriptionPlans = null;
let stripe = null;

// Inicializar Stripe
function initializeStripe() {
    if (typeof Stripe === 'undefined') {
        console.error('Stripe.js não carregado');
        return false;
    }
    
    try {
        stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
        console.log('✅ Stripe inicializado');
        return true;
    } catch (error) {
        console.error('❌ Erro ao inicializar Stripe:', error);
        return false;
    }
}

// Criar e injetar CSS do modal
function injectSubscriptionStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .subscription-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            align-items: center;
            justify-content: center;
            padding: 20px;
            overflow-y: auto;
        }
        
        .subscription-modal.active {
            display: flex;
        }
        
        .subscription-modal-content {
            background: #1a1a1a;
            border-radius: 16px;
            max-width: 900px;
            width: 100%;
            padding: 40px;
            position: relative;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            animation: slideUp 0.3s ease-out;
        }
        
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .subscription-modal-close {
            position: absolute;
            top: 20px;
            right: 20px;
            background: none;
            border: none;
            color: #fff;
            font-size: 32px;
            cursor: pointer;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background 0.2s;
        }
        
        .subscription-modal-close:hover {
            background: rgba(255, 255, 255, 0.1);
        }
        
        .subscription-modal-header {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .subscription-modal-title {
            font-size: 32px;
            font-weight: bold;
            color: #fff;
            margin-bottom: 10px;
        }
        
        .subscription-modal-subtitle {
            font-size: 16px;
            color: #999;
        }
        
        .subscription-plans {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .subscription-plan {
            background: #2a2a2a;
            border: 2px solid #3a3a3a;
            border-radius: 12px;
            padding: 30px 20px;
            cursor: pointer;
            transition: all 0.3s;
            position: relative;
            text-align: center;
        }
        
        .subscription-plan:hover {
            border-color: #00aff0;
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 175, 240, 0.2);
        }
        
        .subscription-plan.selected {
            border-color: #00aff0;
            background: rgba(0, 175, 240, 0.1);
        }
        
        .subscription-plan.popular {
            border-color: #00aff0;
        }
        
        .subscription-plan.popular::before {
            content: "MAIS POPULAR";
            position: absolute;
            top: -12px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #00aff0, #0088cc);
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
            letter-spacing: 0.5px;
        }
        
        .plan-name {
            font-size: 20px;
            font-weight: bold;
            color: #fff;
            margin-bottom: 15px;
        }
        
        .plan-price {
            font-size: 36px;
            font-weight: bold;
            color: #00aff0;
            margin-bottom: 10px;
        }
        
        .plan-price-currency {
            font-size: 20px;
            vertical-align: super;
        }
        
        .plan-discount {
            display: inline-block;
            background: #00aff0;
            color: white;
            padding: 4px 10px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 15px;
        }
        
        .plan-details {
            color: #999;
            font-size: 14px;
            margin-top: 10px;
        }
        
        .plan-original-price {
            text-decoration: line-through;
            color: #666;
            font-size: 14px;
            margin-top: 5px;
        }
        
        .subscription-form {
            background: #2a2a2a;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 20px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-label {
            display: block;
            color: #fff;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .form-input {
            width: 100%;
            padding: 12px 16px;
            background: #1a1a1a;
            border: 2px solid #3a3a3a;
            border-radius: 8px;
            color: #fff;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        
        .form-input:focus {
            outline: none;
            border-color: #00aff0;
        }
        
        .form-input::placeholder {
            color: #666;
        }
        
        .subscription-button {
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, #00aff0, #0088cc);
            border: none;
            border-radius: 8px;
            color: white;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .subscription-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0, 175, 240, 0.3);
        }
        
        .subscription-button:disabled {
            background: #3a3a3a;
            cursor: not-allowed;
            transform: none;
        }
        
        .subscription-button.loading {
            position: relative;
            color: transparent;
        }
        
        .subscription-button.loading::after {
            content: "";
            position: absolute;
            width: 20px;
            height: 20px;
            top: 50%;
            left: 50%;
            margin-left: -10px;
            margin-top: -10px;
            border: 3px solid #fff;
            border-radius: 50%;
            border-top-color: transparent;
            animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .subscription-footer {
            text-align: center;
            color: #999;
            font-size: 12px;
            margin-top: 20px;
        }
        
        .subscription-footer a {
            color: #00aff0;
            text-decoration: none;
        }
        
        .subscription-footer a:hover {
            text-decoration: underline;
        }
        
        .error-message {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid #ef4444;
            color: #ef4444;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
        }
        
        .success-message {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid #10b981;
            color: #10b981;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
        }
        
        @media (max-width: 768px) {
            .subscription-modal-content {
                padding: 30px 20px;
            }
            
            .subscription-plans {
                grid-template-columns: 1fr;
            }
            
            .subscription-modal-title {
                font-size: 24px;
            }
        }
    `;
    document.head.appendChild(style);
}

// Criar HTML do modal
function createSubscriptionModal() {
    const modal = document.createElement('div');
    modal.id = 'subscription-modal';
    modal.className = 'subscription-modal';
    modal.innerHTML = `
        <div class="subscription-modal-content">
            <button class="subscription-modal-close" onclick="closeSubscriptionModal()">×</button>
            
            <div class="subscription-modal-header">
                <h2 class="subscription-modal-title">Escolha seu Plano</h2>
                <p class="subscription-modal-subtitle">Acesso exclusivo ao conteúdo premium</p>
            </div>
            
            <div id="subscription-error" style="display: none;" class="error-message"></div>
            
            <div id="subscription-plans" class="subscription-plans">
                <!-- Planos serão inseridos aqui -->
            </div>
            
            <div class="subscription-form">
                <div class="form-group">
                    <label class="form-label">Nome Completo</label>
                    <input type="text" id="customer-name" class="form-input" placeholder="Seu nome completo" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">E-mail</label>
                    <input type="email" id="customer-email" class="form-input" placeholder="seu@email.com" required>
                </div>
                
                <button id="subscribe-button" class="subscription-button" onclick="processSubscription()">
                    Continuar para Pagamento
                </button>
            </div>
            
            <div class="subscription-footer">
                🔒 Pagamento seguro processado por <a href="https://stripe.com" target="_blank">Stripe</a>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Fechar modal ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeSubscriptionModal();
        }
    });
}

// Carregar planos de assinatura
async function loadSubscriptionPlans(username) {
    try {
        const response = await fetch(`${PAYMENT_SERVER_URL}/api/subscription-plans/${username}`);
        
        if (!response.ok) {
            throw new Error('Erro ao carregar planos');
        }
        
        const data = await response.json();
        currentProfile = data.profile;
        subscriptionPlans = data.plans;
        
        renderPlans();
        
    } catch (error) {
        console.error('Erro ao carregar planos:', error);
        showError('Erro ao carregar planos de assinatura. Verifique se o servidor de pagamentos está rodando.');
    }
}

// Renderizar planos
function renderPlans() {
    const container = document.getElementById('subscription-plans');
    
    if (!subscriptionPlans || subscriptionPlans.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center;">Nenhum plano disponível</p>';
        return;
    }
    
    container.innerHTML = subscriptionPlans.map(plan => `
        <div class="subscription-plan ${plan.popular ? 'popular' : ''}" 
             data-plan-id="${plan.id}" 
             onclick="selectPlan('${plan.id}')">
            <div class="plan-name">${plan.name}</div>
            <div class="plan-price">
                <span class="plan-price-currency">$</span>${plan.finalPrice.toFixed(2)}
            </div>
            ${plan.discount > 0 ? `
                <div class="plan-discount">Economize ${plan.discount}%</div>
                <div class="plan-original-price">De $${plan.basePrice.toFixed(2)}</div>
            ` : ''}
            <div class="plan-details">
                ${plan.months === 1 ? 'Renovação mensal' : `${plan.months} meses de acesso`}
            </div>
        </div>
    `).join('');
    
    // Selecionar plano popular por padrão
    const popularPlan = subscriptionPlans.find(p => p.popular);
    if (popularPlan) {
        selectPlan(popularPlan.id);
    }
}

// Selecionar plano
let selectedPlanId = null;

function selectPlan(planId) {
    selectedPlanId = planId;
    
    // Atualizar UI
    document.querySelectorAll('.subscription-plan').forEach(el => {
        el.classList.remove('selected');
    });
    
    const selectedElement = document.querySelector(`[data-plan-id="${planId}"]`);
    if (selectedElement) {
        selectedElement.classList.add('selected');
    }
    
    console.log('Plano selecionado:', planId);
}

// Processar assinatura
async function processSubscription() {
    if (!selectedPlanId) {
        showError('Por favor, selecione um plano');
        return;
    }
    
    const customerName = document.getElementById('customer-name').value.trim();
    const customerEmail = document.getElementById('customer-email').value.trim();
    
    if (!customerName || !customerEmail) {
        showError('Por favor, preencha todos os campos');
        return;
    }
    
    if (!validateEmail(customerEmail)) {
        showError('Por favor, insira um e-mail válido');
        return;
    }
    
    const button = document.getElementById('subscribe-button');
    button.disabled = true;
    button.classList.add('loading');
    hideError();
    
    try {
        const response = await fetch(`${PAYMENT_SERVER_URL}/api/create-checkout-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: currentProfile.username,
                planId: selectedPlanId,
                customerEmail,
                customerName
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao criar sessão de pagamento');
        }
        
        const { url } = await response.json();
        
        // Redirecionar para checkout do Stripe
        window.location.href = url;
        
    } catch (error) {
        console.error('Erro ao processar assinatura:', error);
        showError(error.message || 'Erro ao processar assinatura. Verifique se o servidor de pagamentos está rodando.');
        button.disabled = false;
        button.classList.remove('loading');
    }
}

// Abrir modal de assinatura
function openSubscriptionModal(username) {
    if (!stripe) {
        if (!initializeStripe()) {
            alert('Erro ao inicializar sistema de pagamento. Recarregue a página.');
            return;
        }
    }
    
    const modal = document.getElementById('subscription-modal');
    if (!modal) {
        createSubscriptionModal();
    }
    
    loadSubscriptionPlans(username);
    
    document.getElementById('subscription-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Fechar modal
function closeSubscriptionModal() {
    document.getElementById('subscription-modal').classList.remove('active');
    document.body.style.overflow = '';
    hideError();
}

// Mostrar erro
function showError(message) {
    const errorDiv = document.getElementById('subscription-error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

// Esconder erro
function hideError() {
    const errorDiv = document.getElementById('subscription-error');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

// Validar e-mail
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Verificar status de pagamento (após retorno do Stripe)
function checkPaymentStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const sessionId = urlParams.get('session_id');
    
    if (paymentStatus === 'success' && sessionId) {
        // Mostrar mensagem de sucesso
        alert('✅ Pagamento realizado com sucesso! Bem-vindo ao conteúdo exclusivo.');
        
        // Limpar parâmetros da URL
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'cancelled') {
        alert('❌ Pagamento cancelado. Tente novamente quando estiver pronto.');
        
        // Limpar parâmetros da URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    injectSubscriptionStyles();
    createSubscriptionModal();
    checkPaymentStatus();
});

