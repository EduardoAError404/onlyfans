/**
 * Sistema de Lazy Loading Progressivo com Thumbnails
 * 
 * Carrega thumbnail blur primeiro, depois lazy load da imagem real
 */

class ProgressiveImage {
    constructor(wrapper) {
        this.wrapper = wrapper;
        this.thumbnail = wrapper.querySelector('.img-thumbnail');
        this.fullImage = wrapper.querySelector('.img-full');
        
        if (!this.fullImage) return;
        
        this.init();
    }
    
    init() {
        // Usar Intersection Observer para lazy loading
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadFullImage();
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px' // Começar a carregar 50px antes de aparecer na tela
        });
        
        observer.observe(this.wrapper);
    }
    
    loadFullImage() {
        const fullSrc = this.fullImage.dataset.src;
        
        if (!fullSrc) return;
        
        // Adicionar classe loading
        this.wrapper.classList.add('loading');
        
        // Criar nova imagem para pré-carregar
        const img = new Image();
        
        img.onload = () => {
            // Quando carregar, atualizar src da imagem real
            this.fullImage.src = fullSrc;
            this.fullImage.classList.add('loaded');
            
            // Esconder thumbnail após transição
            setTimeout(() => {
                if (this.thumbnail) {
                    this.thumbnail.classList.add('hidden');
                }
                this.wrapper.classList.remove('loading');
            }, 500);
        };
        
        img.onerror = () => {
            // Em caso de erro, remover loading
            this.wrapper.classList.remove('loading');
            console.error('Erro ao carregar imagem:', fullSrc);
        };
        
        // Iniciar carregamento
        img.src = fullSrc;
    }
}

// Inicializar todas as imagens progressivas quando DOM carregar
function initProgressiveImages() {
    const wrappers = document.querySelectorAll('.progressive-image-wrapper');
    wrappers.forEach(wrapper => {
        new ProgressiveImage(wrapper);
    });
}

// Auto-inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProgressiveImages);
} else {
    initProgressiveImages();
}

// Exportar para uso manual se necessário
window.ProgressiveImage = ProgressiveImage;
window.initProgressiveImages = initProgressiveImages;
