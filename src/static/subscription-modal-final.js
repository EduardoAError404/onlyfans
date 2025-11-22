// Modal de Assinatura - Código Exato do OnlyFans
(function() {
    'use strict';
    
    let currentPlanId = null;
    let isSignUpMode = false;
    let profileData = null;
    
    // Carregar dados do perfil (usa cache se disponível)
    async function loadProfileData() {
        // Verificar se já temos os dados em cache
        if (window.profileCache) {
            profileData = window.profileCache;
            console.log('✅ Usando dados do perfil do cache');
            return;
        }
        
        const username = window.location.pathname.split('/').filter(Boolean)[0] || 'babymatosao';
        
        try {
            const response = await fetch(`/api/profile/${username}`);
            profileData = await response.json();
            window.profileCache = profileData; // Salvar no cache
            console.log('✅ Dados do perfil carregados:', profileData);
        } catch (error) {
            console.error('❌ Erro ao carregar perfil:', error);
        }
    }
    
    // Criar HTML do modal
    function createModalHTML() {
        const modalHTML = `
<div id="ModalSubscribe___BV_modal_outer_" style="position: fixed; z-index: 10000; display: none;">
    <div id="ModalSubscribe" role="dialog" aria-describedby="ModalSubscribe___BV_modal_body_" class="modal fade show m-guest b-modal b-modal__subscribe" aria-modal="true" style="display: block; padding-left: 0px;">
        <div class="modal-dialog modal-sm modal-dialog-centered">
            <span tabindex="0"></span>
            <div id="ModalSubscribe___BV_modal_content_" tabindex="-1" class="modal-content">
                <div id="ModalSubscribe___BV_modal_body_" class="modal-body m-reset-body-paddings">
                    <div data-v-697a21f8="" class="b-scrolled-modal-content m-view-in-viewport m-native-custom-scrollbar m-invisible-scrollbar m-scrollbar-y">
                        <div data-v-697a21f8="" class="b-users__item m-modal-subscriptions">
                            <div data-v-697a21f8="" class="b-users__item__inner">
                                <div data-v-697a21f8="" class="b-users__item__cover__wrapper m-size-sm g-negative-sides-gaps">
                                    <img data-v-697a21f8="" id="modal-cover-img" src="" alt="Profile Cover" loading="lazy" class="b-users__item__cover">
                                </div>
                                <div data-v-3ea4788a="" data-v-697a21f8="" class="b-profile__user d-flex align-items-start m-inside-modelcard">
                                    <span data-v-1fc852bb="" data-v-697a21f8="" class="g-avatar m-reset-wcag-link-focus m-guest online_status_class m-w100" data-v-3ea4788a="">
                                        <div data-v-68e1ca32="" data-v-1fc852bb="" class="g-avatar__img-wrapper">
                                            <img data-v-68e1ca32="" id="modal-avatar-img" src="" alt="Profile Avatar" loading="lazy">
                                        </div>
                                    </span>
                                    <div data-v-697a21f8="" data-v-3ea4788a="" class="b-profile__user__info m-with-status">
                                        <div data-v-697a21f8="" data-v-3ea4788a="" class="b-profile__names mw-0">
                                            <div data-v-697a21f8="" data-v-3ea4788a="" class="b-username-row m-gap-lg-extra">
                                                <a data-v-697a21f8="" href="#" tabindex="" class="b-username" data-v-3ea4788a="">
                                                    <div class="g-user-name m-verified m-md-size" id="modal-display-name">
                                                        Victoria Matosa
                                                        <svg class="m-verified g-icon" data-icon-name="icon-verified" aria-hidden="true">
                                                            <use href="#icon-verified" xlink:href="#icon-verified"></use>
                                                        </svg>
                                                    </div>
                                                </a>
                                            </div>
                                            <div data-v-697a21f8="" data-v-3ea4788a="" class="b-username-row m-width-limit">
                                                <a data-v-697a21f8="" href="#" aria-current="page" class="g-user-realname__wrapper m-nowrap-text" data-v-3ea4788a="">
                                                    <div data-v-697a21f8="" class="g-user-username" id="modal-username">
                                                        @babymatosao
                                                    </div>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div data-v-697a21f8="" class="b-modal__user__desc">
                                    <div data-v-697a21f8="" class="b-modal__user__desc__title" data-i18n="modal.subscribeTitle">
                                        Subscribe and get these benefits:
                                    </div>
                                    <ul data-v-697a21f8="" class="b-modal__list">
                                        <li data-v-697a21f8="" class="b-modal__list__item">
                                            <div data-v-697a21f8="" class="b-modal__list__icon">
                                                <svg data-v-697a21f8="" data-icon-name="icon-done" aria-hidden="true" class="g-icon">
                                                    <use href="#icon-done" xlink:href="#icon-done"></use>
                                                </svg>
                                            </div>
                                            <div data-v-697a21f8="" class="b-modal__list__title" data-i18n="modal.benefit1">
                                                Full access to this user's content
                                            </div>
                                        </li>
                                        <li data-v-697a21f8="" class="b-modal__list__item">
                                            <div data-v-697a21f8="" class="b-modal__list__icon">
                                                <svg data-v-697a21f8="" data-icon-name="icon-done" aria-hidden="true" class="g-icon">
                                                    <use href="#icon-done" xlink:href="#icon-done"></use>
                                                </svg>
                                            </div>
                                            <div data-v-697a21f8="" class="b-modal__list__title" data-i18n="modal.benefit2">
                                                Direct message with this user
                                            </div>
                                        </li>
                                        <li data-v-697a21f8="" class="b-modal__list__item">
                                            <div data-v-697a21f8="" class="b-modal__list__icon">
                                                <svg data-v-697a21f8="" data-icon-name="icon-done" aria-hidden="true" class="g-icon">
                                                    <use href="#icon-done" xlink:href="#icon-done"></use>
                                                </svg>
                                            </div>
                                            <div data-v-697a21f8="" class="b-modal__list__title" data-i18n="modal.benefit3">
                                                Cancel your subscription at any time
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <form data-v-451b4fbe="" data-v-697a21f8="" novalidate="novalidate" class="b-loginreg__form m-main-form g-sides-gaps m-form-subscriptions" id="auth-form">
                            <h3 data-v-451b4fbe="" id="form-title" data-i18n="modal.loginToSubscribe">Log in to subscribe</h3>
                            
                            <!-- Campo Nome (oculto inicialmente) -->
                            <div data-v-4e723aa7="" data-v-451b4fbe="" class="g-input__wrapper input-text-field m-empty" id="name-field-wrapper" style="display: none;">
                                <div data-v-4e723aa7="" class="">
                                    <div data-v-4e723aa7="" class="v-input form-control g-input mb-0 v-input--hide-details theme--light v-text-field v-text-field--is-booted v-text-field--enclosed v-text-field--outlined v-text-field--placeholder">
                                        <div class="v-input__control">
                                            <div class="v-input__slot">
                                                <fieldset aria-hidden="true">
                                                    <legend style="width: 0px;"><span class="notranslate">&ZeroWidthSpace;</span></legend>
                                                </fieldset>
                                                <div class="v-text-field__slot">
                                                    <label for="input-name" class="v-label theme--light" style="left: 0px; right: auto; position: absolute;" data-i18n="modal.name">Name</label>
                                                    <input at-attr="input" autocomplete="name" name="name" id="input-name" type="text">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Campo Email -->
                            <div data-v-4e723aa7="" data-v-451b4fbe="" class="g-input__wrapper input-text-field m-empty" data-vv-as="Email" at-attr="login_email">
                                <div data-v-4e723aa7="" class="">
                                    <div data-v-4e723aa7="" class="v-input form-control g-input mb-0 v-input--hide-details theme--light v-text-field v-text-field--is-booted v-text-field--enclosed v-text-field--outlined v-text-field--placeholder">
                                        <div class="v-input__control">
                                            <div class="v-input__slot">
                                                <fieldset aria-hidden="true">
                                                    <legend style="width: 0px;"><span class="notranslate">&ZeroWidthSpace;</span></legend>
                                                </fieldset>
                                                <div class="v-text-field__slot">
                                                    <label for="input-email" class="v-label theme--light" style="left: 0px; right: auto; position: absolute;" data-i18n="modal.email">Email</label>
                                                    <input at-attr="input" autocomplete="on" name="email" required="required" id="input-email" type="email">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Campo Password -->
                            <div data-v-4e723aa7="" data-v-451b4fbe="" class="g-input__wrapper input-text-field m-with-field-control m-empty" data-vv-as="Password" at-attr="login_password">
                                <div data-v-4e723aa7="" class="">
                                    <div data-v-4e723aa7="" class="v-input form-control g-input mb-0 theme--light v-text-field v-text-field--is-booted v-text-field--enclosed v-text-field--outlined v-text-field--placeholder">
                                        <div class="v-input__control">
                                            <div class="v-input__slot">
                                                <fieldset aria-hidden="true">
                                                    <legend style="width: 0px;"><span class="notranslate">&ZeroWidthSpace;</span></legend>
                                                </fieldset>
                                                <div class="v-text-field__slot">
                                                    <label for="input-password" class="v-label theme--light" style="left: 0px; right: auto; position: absolute;" data-i18n="modal.password">Password</label>
                                                    <input at-attr="input" autocomplete="on" name="password" required="required" id="input-password" type="password">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <button data-v-451b4fbe="" type="submit" at-attr="submit" class="g-btn m-rounded m-block m-md mb-0" id="submit-btn" data-i18n="modal.login">
                                Log in
                            </button>
                            
                            <div data-v-451b4fbe="" class="b-loginreg__form__issues">
                                By logging in and using OnlyFans, you agree to our 
                                <a href="https://onlyfans.com/terms">Terms of Service</a> and 
                                <a href="https://onlyfans.com/privacy">Privacy Policy</a>, 
                                and confirm that you are at least 18 years old.
                            </div>
                            
                            <div data-v-451b4fbe="" class="b-loginreg__links">
                                <span data-v-451b4fbe="">
                                    <button data-v-451b4fbe="" type="button" at-attr="forgot_password" class="g-btn m-flat forgot m-reset-width m-no-uppercase m-default-font-weight" data-i18n="modal.forgotPassword">
                                        Forgot password?
                                    </button>
                                </span>
                                <span data-v-451b4fbe="">
                                    <button data-v-451b4fbe="" at-attr="sign_up" type="button" class="g-btn m-flat m-reset-width m-no-uppercase m-default-font-weight" id="toggle-mode-btn" data-i18n="modal.signUp">
                                        Sign up for OnlyFans
                                    </button>
                                </span>
                            </div>
                        </form>
                    </div>
                </div>
                <footer id="ModalSubscribe___BV_modal_footer_" class="modal-footer g-border-top">
                    <button data-v-697a21f8="" type="button" class="g-btn m-flat m-btn-gaps m-reset-width" id="close-modal-btn" data-i18n="modal.close">
                        Close
                    </button>
                </footer>
            </div>
            <span tabindex="0"></span>
        </div>
    </div>
    <div id="ModalSubscribe___BV_modal_backdrop_" class="modal-backdrop" style="display: none;"></div>
</div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Aplicar traduções i18n ao modal após inserir no DOM
        if (window.i18n && window.i18n.applyTranslations) {
            console.log('🌍 Aplicando traduções i18n ao modal...');
            window.i18n.applyTranslations();
        } else {
            console.warn('⚠️ Sistema i18n não encontrado');
        }
    }
    
    // Atualizar modal com dados do perfil
    function updateModalWithProfile() {
        if (!profileData) {
            console.log('⏳ Aguardando dados do perfil...');
            return;
        }
        
        console.log('🔄 Atualizando modal com perfil:', profileData);
        
        // Atualizar imagens
        const coverImg = document.getElementById('modal-cover-img');
        const avatarImg = document.getElementById('modal-avatar-img');
        
        if (coverImg) {
            if (profileData.cover_photo) {
                coverImg.src = profileData.cover_photo;
                console.log('✅ Cover photo atualizada:', profileData.cover_photo);
            } else {
                coverImg.src = '/static/default-cover.jpg';
                console.log('⚠️ Cover photo não encontrada, usando padrão');
            }
            coverImg.alt = profileData.display_name || profileData.username;
        }
        
        if (avatarImg) {
            if (profileData.profile_photo) {
                avatarImg.src = profileData.profile_photo;
                console.log('✅ Avatar atualizado:', profileData.profile_photo);
            } else {
                avatarImg.src = '/static/default-avatar.jpg';
                console.log('⚠️ Avatar não encontrado, usando padrão');
            }
            avatarImg.alt = profileData.display_name || profileData.username;
        }
        
        // Atualizar textos
        const displayName = document.getElementById('modal-display-name');
        const username = document.getElementById('modal-username');
        
        if (displayName) {
            displayName.innerHTML = `
                ${profileData.display_name || profileData.username}
                <svg class="m-verified g-icon" data-icon-name="icon-verified" aria-hidden="true">
                    <use href="#icon-verified" xlink:href="#icon-verified"></use>
                </svg>
            `;
        }
        
        if (username) {
            username.textContent = `@${profileData.username}`;
        }
    }
    
    // Validar email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Validar senha
    function isValidPassword(password) {
        return password.length >= 6;
    }
    
    // Validar nome
    function isValidName(name) {
        return name.trim().length >= 2;
    }
    
    // Mostrar erro no campo
    function showFieldError(inputId, message) {
        const input = document.getElementById(inputId);
        if (!input) return;
        
        const wrapper = input.closest('.g-input__wrapper');
        if (!wrapper) return;
        
        // Adicionar classe de erro
        wrapper.classList.add('m-error');
        input.style.borderColor = '#dc3545';
        
        // Criar ou atualizar mensagem de erro
        let errorMsg = wrapper.querySelector('.error-message');
        if (!errorMsg) {
            errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.style.cssText = 'color: #dc3545; font-size: 12px; margin-top: 4px; padding-left: 12px;';
            wrapper.appendChild(errorMsg);
        }
        errorMsg.textContent = message;
    }
    
    // Limpar erro do campo
    function clearFieldError(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;
        
        const wrapper = input.closest('.g-input__wrapper');
        if (!wrapper) return;
        
        wrapper.classList.remove('m-error');
        input.style.borderColor = '';
        
        const errorMsg = wrapper.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
        }
    }
    
    // Validar campo em tempo real
    function validateField(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return true;
        
        const value = input.value.trim();
        
        // Limpar erro anterior
        clearFieldError(inputId);
        
        // Validações específicas
        if (inputId === 'input-email') {
            if (value === '') {
                return true; // Não mostrar erro se estiver vazio
            }
            if (!isValidEmail(value)) {
                showFieldError(inputId, 'Please enter a valid email address');
                return false;
            }
        } else if (inputId === 'input-password') {
            if (value === '') {
                return true; // Não mostrar erro se estiver vazio
            }
            if (!isValidPassword(value)) {
                showFieldError(inputId, 'Password must be at least 6 characters');
                return false;
            }
        } else if (inputId === 'input-name') {
            if (value === '') {
                return true; // Não mostrar erro se estiver vazio
            }
            if (!isValidName(value)) {
                showFieldError(inputId, 'Name must be at least 2 characters');
                return false;
            }
        }
        
        return true;
    }
    
    // Validar todos os campos antes de enviar
    function validateAllFields() {
        const email = document.getElementById('input-email').value.trim();
        const password = document.getElementById('input-password').value.trim();
        const name = document.getElementById('input-name').value.trim();
        
        let isValid = true;
        
        // Validar email
        if (email === '') {
            showFieldError('input-email', 'Email is required');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showFieldError('input-email', 'Please enter a valid email address');
            isValid = false;
        }
        
        // Validar senha
        if (password === '') {
            showFieldError('input-password', 'Password is required');
            isValid = false;
        } else if (!isValidPassword(password)) {
            showFieldError('input-password', 'Password must be at least 6 characters');
            isValid = false;
        }
        
        // Validar nome (apenas no modo Sign Up)
        if (isSignUpMode) {
            if (name === '') {
                showFieldError('input-name', 'Name is required');
                isValid = false;
            } else if (!isValidName(name)) {
                showFieldError('input-name', 'Name must be at least 2 characters');
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    // Verificar se o formulário está válido e atualizar botão
    function updateSubmitButton() {
        const submitBtn = document.getElementById('submit-btn');
        if (!submitBtn) return;
        
        const email = document.getElementById('input-email').value.trim();
        const password = document.getElementById('input-password').value.trim();
        const name = document.getElementById('input-name').value.trim();
        
        let isFormValid = true;
        
        // Validar email
        if (email === '' || !isValidEmail(email)) {
            isFormValid = false;
        }
        
        // Validar senha
        if (password === '' || !isValidPassword(password)) {
            isFormValid = false;
        }
        
        // Validar nome (apenas no modo Sign Up)
        if (isSignUpMode) {
            if (name === '' || !isValidName(name)) {
                isFormValid = false;
            }
        }
        
        // Habilitar ou desabilitar botão
        if (isFormValid) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
        } else {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';
            submitBtn.style.cursor = 'not-allowed';
        }
    }
    
    // Adicionar comportamento de label nos inputs
    function setupInputLabels() {
        const inputs = ['input-name', 'input-email', 'input-password'];
        
        // Rastrear quais campos já foram "tocados" (blur)
        const touchedFields = {};
        
        inputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (!input) return;
            
            const wrapper = input.closest('.g-input__wrapper');
            const label = input.previousElementSibling;
            
            // Inicializar como não tocado
            touchedFields[inputId] = false;
            
            // Função para atualizar estado do label
            const updateLabel = () => {
                if (input.value.trim() !== '') {
                    if (wrapper) wrapper.classList.remove('m-empty');
                    if (label) label.style.display = 'none';
                } else {
                    if (wrapper) wrapper.classList.add('m-empty');
                    if (label) label.style.display = 'block';
                }
            };
            
            // Eventos
            input.addEventListener('input', () => {
                updateLabel();
                
                // Se o campo já foi tocado (blur aconteceu), validar em tempo real
                if (touchedFields[inputId]) {
                    if (input.value.trim() !== '') {
                        validateField(inputId);
                    } else {
                        clearFieldError(inputId);
                    }
                }
                
                // Atualizar estado do botão
                updateSubmitButton();
            });
            
            input.addEventListener('focus', () => {
                if (label && input.value.trim() === '') {
                    label.style.opacity = '0.5';
                }
            });
            
            input.addEventListener('blur', () => {
                if (label) {
                    label.style.opacity = '1';
                }
                updateLabel();
                
                // Marcar campo como tocado
                touchedFields[inputId] = true;
                
                // Validar ao sair do campo
                if (input.value.trim() !== '') {
                    validateField(inputId);
                } else {
                    // Se estiver vazio, limpar erro
                    clearFieldError(inputId);
                }
                
                // Atualizar estado do botão
                updateSubmitButton();
            });
            
            // Estado inicial
            updateLabel();
        });
        
        // Estado inicial do botão
        updateSubmitButton();
        
        console.log('✅ Comportamento de labels e validações configurado');
    }
    
    // Abrir modal
    function openModal(planId) {
        currentPlanId = planId;
        updateModalWithProfile();
        
        const outer = document.getElementById('ModalSubscribe___BV_modal_outer_');
        const backdrop = document.getElementById('ModalSubscribe___BV_modal_backdrop_');
        
        if (outer && backdrop) {
            outer.style.display = 'block';
            backdrop.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Fechar modal
    function closeModal() {
        const outer = document.getElementById('ModalSubscribe___BV_modal_outer_');
        const backdrop = document.getElementById('ModalSubscribe___BV_modal_backdrop_');
        
        if (outer && backdrop) {
            outer.style.display = 'none';
            backdrop.style.display = 'none';
            document.body.style.overflow = '';
        }
        
        // Resetar para modo login
        if (isSignUpMode) {
            toggleMode();
        }
    }
    
    // Alternar entre Login e Sign Up
    function toggleMode() {
        isSignUpMode = !isSignUpMode;
        
        const title = document.getElementById('form-title');
        const nameField = document.getElementById('name-field-wrapper');
        const submitBtn = document.getElementById('submit-btn');
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
        
        // Atualizar estado do botão ao mudar de modo
        updateSubmitButton();
    }
    
    // Processar formulário
    function handleSubmit(e) {
        e.preventDefault();
        
        // Validar todos os campos
        if (!validateAllFields()) {
            console.log('❌ Validação falhou');
            return;
        }
        
        const name = document.getElementById('input-name').value.trim();
        const email = document.getElementById('input-email').value.trim();
        const password = document.getElementById('input-password').value.trim();
        
        if (isSignUpMode) {
            // Modo Sign Up - ir para checkout
            console.log('✅ Formulário válido, redirecionando para checkout...');
            
            // Mostrar loading no botão
            const submitBtn = document.getElementById('submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<svg data-icon-name="icon-loading" aria-hidden="true" class="g-icon" style="animation: spin 1s linear infinite;"><use href="#icon-loading" xlink:href="#icon-loading"></use></svg>';
            
            // Adicionar animação de spin se não existir
            if (!document.getElementById('spin-animation')) {
                const style = document.createElement('style');
                style.id = 'spin-animation';
                style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
                document.head.appendChild(style);
            }
            
            // Redirecionar para checkout (mantém modal aberto)
            if (typeof window.subscribeToProfile === 'function') {
                window.subscribeToProfile(currentPlanId, email, name);
            } else {
                console.error('❌ Função de assinatura não encontrada');
                // Restaurar botão em caso de erro
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        } else {
            // Modo Login - apenas alternar para Sign Up
            console.log('✅ Alternando para modo Sign Up');
            toggleMode();
        }
    }
    
    // Inicializar
    async function init() {
        await loadProfileData();
        createModalHTML();
        
        // Configurar comportamento dos inputs
        setupInputLabels();
        
        // Event listeners
        document.getElementById('close-modal-btn').addEventListener('click', closeModal);
        document.getElementById('toggle-mode-btn').addEventListener('click', toggleMode);
        document.getElementById('auth-form').addEventListener('submit', handleSubmit);
        
        // Fechar ao clicar no backdrop
        document.getElementById('ModalSubscribe___BV_modal_backdrop_').addEventListener('click', closeModal);
        
        // Expor função globalmente
        window.openSubscriptionAuthModal = openModal;
        
        console.log('✅ Modal OnlyFans inicializado');
    }
    
    // Inicializar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();

