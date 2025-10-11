// Modal de Autenticação para Assinatura
(function() {
    'use strict';
    
    let currentPlanId = null;
    let isSignUpMode = false;
    
    // Criar CSS do modal
    function injectModalStyles() {
        const style = document.createElement('style');
        style.id = 'subscription-auth-modal-styles';
        style.textContent = `
            #subscription-auth-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 10000;
                display: none;
                align-items: center;
                justify-content: center;
            }
            
            #subscription-auth-modal-overlay.active {
                display: flex;
            }
            
            .subscription-auth-modal {
                background: #fff;
                border-radius: 8px;
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
            }
            
            .subscription-auth-modal-body {
                padding: 0;
            }
            
            .subscription-auth-profile {
                padding: 24px;
                text-align: center;
                border-bottom: 1px solid #e5e5e5;
            }
            
            .subscription-auth-avatar {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                margin: 0 auto 12px;
                background-size: cover;
                background-position: center;
            }
            
            .subscription-auth-name {
                font-size: 18px;
                font-weight: 600;
                color: #000;
                margin-bottom: 4px;
            }
            
            .subscription-auth-username {
                font-size: 14px;
                color: #666;
            }
            
            .subscription-auth-benefits {
                padding: 20px 24px;
                background: #f9f9f9;
            }
            
            .subscription-auth-benefits-title {
                font-size: 14px;
                font-weight: 600;
                color: #000;
                margin-bottom: 12px;
            }
            
            .subscription-auth-benefits-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            
            .subscription-auth-benefits-item {
                display: flex;
                align-items: flex-start;
                margin-bottom: 8px;
                font-size: 14px;
                color: #333;
            }
            
            .subscription-auth-benefits-icon {
                color: #00aff0;
                margin-right: 8px;
                font-size: 18px;
            }
            
            .subscription-auth-form {
                padding: 24px;
            }
            
            .subscription-auth-form h3 {
                font-size: 20px;
                font-weight: 600;
                color: #000;
                margin: 0 0 20px 0;
            }
            
            .subscription-auth-input-wrapper {
                margin-bottom: 16px;
            }
            
            .subscription-auth-input {
                width: 100%;
                padding: 12px 16px;
                border: 1px solid #ddd;
                border-radius: 6px;
                font-size: 14px;
                transition: border-color 0.2s;
            }
            
            .subscription-auth-input:focus {
                outline: none;
                border-color: #00aff0;
            }
            
            .subscription-auth-input::placeholder {
                color: #999;
            }
            
            .subscription-auth-submit {
                width: 100%;
                padding: 14px;
                background: #00aff0;
                color: #fff;
                border: none;
                border-radius: 6px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.2s;
                margin-bottom: 16px;
            }
            
            .subscription-auth-submit:hover {
                background: #0099d9;
            }
            
            .subscription-auth-submit:disabled {
                background: #ccc;
                cursor: not-allowed;
            }
            
            .subscription-auth-terms {
                font-size: 12px;
                color: #666;
                line-height: 1.5;
                margin-bottom: 16px;
            }
            
            .subscription-auth-terms a {
                color: #00aff0;
                text-decoration: none;
            }
            
            .subscription-auth-links {
                display: flex;
                justify-content: space-between;
                padding-top: 16px;
                border-top: 1px solid #e5e5e5;
            }
            
            .subscription-auth-link {
                background: none;
                border: none;
                color: #00aff0;
                font-size: 14px;
                cursor: pointer;
                padding: 0;
            }
            
            .subscription-auth-link:hover {
                text-decoration: underline;
            }
            
            .subscription-auth-footer {
                padding: 16px 24px;
                border-top: 1px solid #e5e5e5;
                text-align: center;
            }
            
            .subscription-auth-close {
                background: none;
                border: none;
                color: #666;
                font-size: 14px;
                cursor: pointer;
                padding: 8px 16px;
            }
            
            .subscription-auth-close:hover {
                color: #000;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Criar HTML do modal
    function createModalHTML() {
        const modalHTML = `
            <div id="subscription-auth-modal-overlay">
                <div class="subscription-auth-modal">
                    <div class="subscription-auth-modal-body">
                        <div class="subscription-auth-profile">
                            <div class="subscription-auth-avatar" id="auth-modal-avatar"></div>
                            <div class="subscription-auth-name" id="auth-modal-name">Victoria Matosa</div>
                            <div class="subscription-auth-username" id="auth-modal-username">@babymatosao</div>
                        </div>
                        
                        <div class="subscription-auth-benefits">
                            <div class="subscription-auth-benefits-title">Subscribe and get these benefits:</div>
                            <ul class="subscription-auth-benefits-list">
                                <li class="subscription-auth-benefits-item">
                                    <span class="subscription-auth-benefits-icon">✓</span>
                                    <span>Full access to this user's content</span>
                                </li>
                                <li class="subscription-auth-benefits-item">
                                    <span class="subscription-auth-benefits-icon">✓</span>
                                    <span>Direct message with this user</span>
                                </li>
                                <li class="subscription-auth-benefits-item">
                                    <span class="subscription-auth-benefits-icon">✓</span>
                                    <span>Cancel your subscription at any time</span>
                                </li>
                            </ul>
                        </div>
                        
                        <form class="subscription-auth-form" id="subscription-auth-form">
                            <h3 id="auth-form-title">Log in to subscribe</h3>
                            
                            <div class="subscription-auth-input-wrapper" id="name-field-wrapper" style="display: none;">
                                <input 
                                    type="text" 
                                    class="subscription-auth-input" 
                                    id="auth-name-input" 
                                    placeholder="Name"
                                    autocomplete="name"
                                >
                            </div>
                            
                            <div class="subscription-auth-input-wrapper">
                                <input 
                                    type="email" 
                                    class="subscription-auth-input" 
                                    id="auth-email-input" 
                                    placeholder="Email"
                                    required
                                    autocomplete="email"
                                >
                            </div>
                            
                            <div class="subscription-auth-input-wrapper">
                                <input 
                                    type="password" 
                                    class="subscription-auth-input" 
                                    id="auth-password-input" 
                                    placeholder="Password"
                                    required
                                    autocomplete="current-password"
                                >
                            </div>
                            
                            <button type="submit" class="subscription-auth-submit" id="auth-submit-btn">
                                Log in
                            </button>
                            
                            <div class="subscription-auth-terms">
                                By logging in and using OnlyFans, you agree to our 
                                <a href="https://onlyfans.com/terms" target="_blank">Terms of Service</a> and 
                                <a href="https://onlyfans.com/privacy" target="_blank">Privacy Policy</a>, 
                                and confirm that you are at least 18 years old.
                            </div>
                            
                            <div class="subscription-auth-links">
                                <button type="button" class="subscription-auth-link" id="forgot-password-btn">
                                    Forgot password?
                                </button>
                                <button type="button" class="subscription-auth-link" id="toggle-mode-btn">
                                    Sign up for OnlyFans
                                </button>
                            </div>
                        </form>
                    </div>
                    
                    <div class="subscription-auth-footer">
                        <button type="button" class="subscription-auth-close" id="close-auth-modal">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    // Alternar entre modo login e signup
    function toggleMode() {
        isSignUpMode = !isSignUpMode;
        
        const title = document.getElementById('auth-form-title');
        const nameField = document.getElementById('name-field-wrapper');
        const submitBtn = document.getElementById('auth-submit-btn');
        const toggleBtn = document.getElementById('toggle-mode-btn');
        
        if (isSignUpMode) {
            title.textContent = 'Create your account';
            nameField.style.display = 'block';
            submitBtn.textContent = 'Sign Up';
            toggleBtn.textContent = 'Log in to subscribe';
        } else {
            title.textContent = 'Log in to subscribe';
            nameField.style.display = 'none';
            submitBtn.textContent = 'Log in';
            toggleBtn.textContent = 'Sign up for OnlyFans';
        }
    }
    
    // Abrir modal
    function openAuthModal(planId) {
        currentPlanId = planId;
        const overlay = document.getElementById('subscription-auth-modal-overlay');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // Fechar modal
    function closeAuthModal() {
        const overlay = document.getElementById('subscription-auth-modal-overlay');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        
        // Resetar para modo login
        if (isSignUpMode) {
            toggleMode();
        }
    }
    
    // Processar formulário
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('auth-name-input').value.trim();
        const email = document.getElementById('auth-email-input').value.trim();
        const password = document.getElementById('auth-password-input').value;
        
        if (!email || !password) {
            alert('Please fill in all required fields');
            return;
        }
        
        if (isSignUpMode && !name) {
            alert('Please enter your name');
            return;
        }
        
        if (isSignUpMode) {
            // Modo Sign Up - redirecionar para checkout
            closeAuthModal();
            
            // Chamar função de assinatura do outro script
            if (typeof window.subscribeToProfile === 'function') {
                window.subscribeToProfile(currentPlanId, email, name);
            } else {
                console.error('Função de assinatura não encontrada');
            }
        } else {
            // Modo Log In - apenas fechar e reabrir (mantém dados)
            alert('Login functionality would go here. For now, click "Sign up for OnlyFans" to proceed to checkout.');
        }
    }
    
    // Inicializar
    function init() {
        injectModalStyles();
        createModalHTML();
        
        // Event listeners
        document.getElementById('close-auth-modal').addEventListener('click', closeAuthModal);
        document.getElementById('toggle-mode-btn').addEventListener('click', toggleMode);
        document.getElementById('subscription-auth-form').addEventListener('submit', handleFormSubmit);
        
        // Fechar ao clicar fora
        document.getElementById('subscription-auth-modal-overlay').addEventListener('click', function(e) {
            if (e.target === this) {
                closeAuthModal();
            }
        });
        
        // Forgot password
        document.getElementById('forgot-password-btn').addEventListener('click', function() {
            alert('Password reset functionality would go here');
        });
        
        // Expor função globalmente
        window.openSubscriptionAuthModal = openAuthModal;
        
        console.log('✅ Modal de autenticação inicializado');
    }
    
    // Inicializar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();

