// Cache global para dados do perfil
window.profileCache = null;

// Função para esconder o preloader
function hidePreloader() {
    console.log('🔍 hidePreloader() chamada');
    const preloader = document.getElementById('before_preloader');
    console.log('Preloader element:', preloader);
    
    if (preloader) {
        console.log('✅ Preloader encontrado, escondendo...');
        preloader.style.opacity = '0';
        preloader.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
            preloader.style.display = 'none';
            console.log('✅ Preloader display=none aplicado');
        }, 300);
    } else {
        console.warn('⚠️ Preloader não encontrado no DOM!');
    }
}

// Carregar dados do perfil da API
async function loadProfile() {
    try {
        console.log('🔄 Carregando perfil...');
        
        // 1. Obter o username da URL
        const path = window.location.pathname;
        const pathSegments = path.split('/').filter(segment => segment.length > 0);
        
        let apiUrl = '/api/profile'; // Rota padrão
        
        if (pathSegments.length > 0) {
            // Se houver segmentos, o primeiro é o username
            const username = pathSegments[0];
            apiUrl = `/api/profile/${username}`; // Rota para perfil específico
            console.log(`🔍 Carregando perfil para username: ${username} via ${apiUrl}`);
        } else {
            console.log(`🔍 Carregando perfil padrão via ${apiUrl}`);
        }
        
        const response = await fetch(apiUrl);
        const profile = await response.json();
        
        console.log('✅ Perfil carregado:', profile);
        
        // Salvar no cache global
        window.profileCache = profile;
        
        // Mapeamento de moeda para símbolo
        const currencySymbols = {
            'USD': '$',
            'BRL': 'R$',
            'EUR': '€',
            'GBP': '£',
            'JPY': '¥',
            'AUD': 'A$',
            'CAD': 'C$'
        };
        
        const currency = profile.currency || 'USD';
        const symbol = currencySymbols[currency] || '$';
        
        console.log(`💰 Moeda detectada: ${currency} - Símbolo: ${symbol}`);
        
        // Função para formatar o preço com a moeda correta
        const formatPrice = (price) => {
            const formattedNumber = price.toFixed(2).replace('.', ',');
            return `<span class="currency-symbol">${symbol}</span>${formattedNumber}`;
        };
        
        // Buscar planos de assinatura (o servidor Flask calcula os descontos)
        const plansResponse = await fetch(`/api/subscription-plans/${profile.username}`);
        const plansData = await plansResponse.json();
        
        const monthlyPlan = plansData.plans['1_month'];
        const sixMonthsPlan = plansData.plans['6_months'];
        const twelveMonthsPlan = plansData.plans['12_months'];
        
        console.log('📊 Planos carregados:', plansData);
        
        // Atualizar preço mensal
        const monthlyPriceEl = document.getElementById('monthly-price-display');
        if (monthlyPriceEl) {
            monthlyPriceEl.innerHTML = formatPrice(monthlyPlan.price);
            console.log(`✅ Preço mensal atualizado: ${monthlyPriceEl.innerHTML}`);
        }
        
        // Atualizar pacotes
        const sixMonthsPriceEl = document.getElementById('six-months-price-display');
        if (sixMonthsPriceEl) {
            sixMonthsPriceEl.innerHTML = formatPrice(sixMonthsPlan.total);
            console.log(`✅ Preço 6 meses atualizado: ${sixMonthsPriceEl.innerHTML}`);
        }
        
        const twelveMonthsPriceEl = document.getElementById('twelve-months-price-display');
        if (twelveMonthsPriceEl) {
            twelveMonthsPriceEl.innerHTML = formatPrice(twelveMonthsPlan.total);
            console.log(`✅ Preço 12 meses atualizado: ${twelveMonthsPriceEl.innerHTML}`);
        }
        
        // Atualizar nome de exibição
        document.querySelectorAll('.g-user-name').forEach(el => {
            el.innerHTML = profile.display_name + ' <svg class="m-verified g-icon" data-icon-name=icon-verified aria-hidden=true><use href=#icon-verified xlink:href=#icon-verified></use></svg>';
        });
        
        // Atualizar username
        document.querySelectorAll('.g-user-username').forEach(el => {
            el.textContent = profile.username;
        });
        
        // Atualizar biografia
        const bioElement = document.getElementById('full-bio');
        if (bioElement) {
            const pTag = bioElement.querySelector('p');
            if (pTag) {
                pTag.innerHTML = profile.bio;
            }
        }
        
        // Atualizar localização
        const locationElements = document.querySelectorAll('[data-icon-name="icon-location"]');
        locationElements.forEach(el => {
            const parentP = el.closest('p');
            if (parentP) {
                const span = parentP.querySelector('span');
                if (span) span.textContent = profile.location;
            }
        });
        
        // Atualizar link
        const linkElements = document.querySelectorAll('[data-icon-name="icon-link"]');
        linkElements.forEach(el => {
            const parentP = el.closest('p');
            if (parentP) {
                const link = parentP.querySelector('a');
                if (link) {
                    link.href = profile.link;
                    link.textContent = profile.link;
                }
            }
        });
        
        // Atualizar contadores de fotos
        const photosElements = document.querySelectorAll('[data-icon-name="icon-image"]');
        photosElements.forEach(el => {
            const parent = el.closest('button, span, div');
            if (parent) {
                const countEl = parent.querySelector('.b-profile__sections__count');
                if (countEl) {
                    const count = profile.photos_count >= 1000 ? (profile.photos_count / 1000).toFixed(1) + 'K' : profile.photos_count;
                    countEl.textContent = ' ' + count + ' ';
                }
            }
        });
        
        // Atualizar contadores de vídeos
        const videosElements = document.querySelectorAll('[data-icon-name="icon-video"]');
        videosElements.forEach(el => {
            const parent = el.closest('button, span, div');
            if (parent) {
                const countEl = parent.querySelector('.b-profile__sections__count');
                if (countEl) {
                    countEl.textContent = profile.videos_count;
                }
            }
        });
        
        // Atualizar contadores de likes
        const likesElements = document.querySelectorAll('[data-icon-name="icon-like"]');
        likesElements.forEach(el => {
            const parent = el.closest('button, span, div');
            if (parent) {
                const countEl = parent.querySelector('.b-profile__sections__count');
                if (countEl) {
                    countEl.textContent = profile.likes_count;
                }
            }
        });
        
        // Atualizar posts e media nos tabs
        const tabElements = document.querySelectorAll('.b-tabs__nav__text');
        tabElements.forEach(el => {
            const text = el.textContent.trim();
            if (text.includes('posts') || text.match(/^\d+$/)) {
                el.textContent = ' ' + profile.posts_count + ' posts ';
            } else if (text.includes('Media')) {
                el.textContent = ' ' + profile.media_count + ' Media ';
            }
        });
        
        // Atualizar contadores da parte inferior (seção de subscribe)
        const bottomPostsCount = document.getElementById('bottom-posts-count');
        if (bottomPostsCount) {
            bottomPostsCount.textContent = ' ' + profile.posts_count + ' ';
        }
        
        const bottomPhotosCount = document.getElementById('bottom-photos-count');
        if (bottomPhotosCount) {
            bottomPhotosCount.textContent = ' ' + profile.photos_count + ' ';
        }
        
        const bottomVideosCount = document.getElementById('bottom-videos-count');
        if (bottomVideosCount) {
            bottomVideosCount.textContent = ' ' + profile.videos_count + ' ';
        }
        
        // Atualizar título da página
        document.title = profile.display_name + ' OnlyFans';
        
        console.log('✅ Página atualizada com sucesso!');
        console.log(`💰 Símbolo da moeda aplicado: ${symbol}`);
        
        // Esconder preloader
        console.log('🔍 Tentando esconder preloader...');
        hidePreloader();
        console.log('✅ Preloader escondido!');
        
    } catch (error) {
        console.error('❌ Erro ao carregar perfil:', error);
        // Esconder preloader mesmo em caso de erro
        hidePreloader();
    }
}

// Carregar perfil quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadProfile);
} else {
    loadProfile();
}
