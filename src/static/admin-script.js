// Variáveis globais
let profileData = {};
let currentImageType = 'profile'; // 'profile' ou 'banner'

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadTheme();
});

// Verificar autenticação
async function checkAuth() {
    try {
        const response = await fetch('/api/check-auth', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (!data.authenticated) {
            window.location.href = '/admin.html';
        } else {
            loadProfile();
        }
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        showAlert('Erro ao verificar autenticação', 'error');
    }
}

// Carregar dados do perfil
async function loadProfile() {
    showLoading(true);
    try {
        const response = await fetch('/api/profile', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (response.ok) {
            profileData = data;
            populateForm(data);
            showLoading(false);
            document.getElementById('main-content').style.display = 'block';
        } else {
            showAlert('Erro ao carregar perfil', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showAlert('Erro ao carregar perfil', 'error');
    }
}

// Preencher formulário com dados
function populateForm(data) {
    document.getElementById('display_name').value = data.display_name || '';
    document.getElementById('username').value = data.username || '';
    document.getElementById('bio').value = data.bio || '';
    document.getElementById('location').value = data.location || '';
    document.getElementById('link').value = data.link || '';
    document.getElementById('photos_count').value = data.photos_count || 0;
    document.getElementById('videos_count').value = data.videos_count || 0;
    document.getElementById('likes_count').value = data.likes_count || '0';
    document.getElementById('posts_count').value = data.posts_count || 0;
    document.getElementById('media_count').value = data.media_count || 0;
    
    // Atualizar previews de imagens
    const profileImg = document.getElementById('profile-preview');
    const bannerImg = document.getElementById('banner-preview');
    
    profileImg.src = data.profile_image.startsWith('http') ? 
        data.profile_image : `/${data.profile_image}`;
    bannerImg.src = data.banner_image.startsWith('http') ? 
        data.banner_image : `/${data.banner_image}`;
}

// Salvar perfil
async function saveProfile() {
    const data = {
        display_name: document.getElementById('display_name').value,
        username: document.getElementById('username').value,
        bio: document.getElementById('bio').value,
        location: document.getElementById('location').value,
        link: document.getElementById('link').value,
        photos_count: parseInt(document.getElementById('photos_count').value) || 0,
        videos_count: parseInt(document.getElementById('videos_count').value) || 0,
        likes_count: document.getElementById('likes_count').value,
        posts_count: parseInt(document.getElementById('posts_count').value) || 0,
        media_count: parseInt(document.getElementById('media_count').value) || 0
    };

    try {
        const response = await fetch('/api/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showAlert('✅ Perfil atualizado com sucesso!', 'success');
        } else {
            showAlert('❌ Erro ao atualizar perfil', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showAlert('❌ Erro ao atualizar perfil', 'error');
    }
}

// Logout
async function logout() {
    try {
        await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
        });
        window.location.href = '/admin.html';
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
    }
}

// Modal de imagem
function openImageModal(type) {
    currentImageType = type;
    const modal = document.getElementById('image-modal');
    const title = document.getElementById('modal-title');
    
    title.textContent = type === 'profile' ? 'Alterar Foto de Perfil' : 'Alterar Banner';
    modal.classList.add('active');
}

function closeImageModal() {
    const modal = document.getElementById('image-modal');
    modal.classList.remove('active');
    document.getElementById('file-input').value = '';
    document.getElementById('image-url').value = '';
}

// Alternar entre tabs
function switchTab(tab) {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));
    
    if (tab === 'upload') {
        tabs[0].classList.add('active');
        document.getElementById('upload-tab').classList.add('active');
    } else {
        tabs[1].classList.add('active');
        document.getElementById('url-tab').classList.add('active');
    }
}

// Upload de imagem
async function uploadImage() {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    
    if (!file) {
        showAlert('❌ Selecione uma imagem', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', currentImageType);
    
    try {
        const response = await fetch('/api/upload-image', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert('✅ Imagem enviada com sucesso!', 'success');
            closeImageModal();
            loadProfile(); // Recarregar para mostrar nova imagem
        } else {
            showAlert(`❌ ${data.error}`, 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showAlert('❌ Erro ao enviar imagem', 'error');
    }
}

// Atualizar imagem por URL
async function updateImageUrl() {
    const url = document.getElementById('image-url').value;
    
    if (!url) {
        showAlert('❌ Digite uma URL', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/update-image-url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                url: url,
                type: currentImageType
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert('✅ Imagem atualizada com sucesso!', 'success');
            closeImageModal();
            loadProfile(); // Recarregar para mostrar nova imagem
        } else {
            showAlert(`❌ ${data.error}`, 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showAlert('❌ Erro ao atualizar imagem', 'error');
    }
}

// Tema dark/light
function toggleTheme() {
    const root = document.documentElement;
    const currentTheme = root.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    root.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const icon = document.getElementById('theme-icon');
    icon.textContent = newTheme === 'light' ? '🌙' : '☀️';
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const root = document.documentElement;
    root.setAttribute('data-theme', savedTheme);
    
    const icon = document.getElementById('theme-icon');
    icon.textContent = savedTheme === 'light' ? '🌙' : '☀️';
}

// Utilitários
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.add('active');
    } else {
        loading.classList.remove('active');
    }
}

function showAlert(message, type) {
    const alert = document.getElementById('alert');
    alert.textContent = message;
    alert.className = `alert alert-${type} active`;
    
    setTimeout(() => {
        alert.classList.remove('active');
    }, 5000);
}

