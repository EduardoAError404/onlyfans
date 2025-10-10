// Estado global
let profiles = [];
let currentProfileId = null;
let usernameCheckTimeout = null;

// Carregar perfis ao iniciar
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadProfiles();
});

// Verificar autenticação
async function checkAuth() {
    try {
        const response = await fetch('/api/check-auth');
        const data = await response.json();
        
        if (!data.authenticated) {
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        window.location.href = '/login.html';
    }
}

// Carregar lista de perfis
async function loadProfiles() {
    showLoading(true);
    
    try {
        const response = await fetch('/api/profiles');
        
        if (!response.ok) {
            throw new Error('Erro ao carregar perfis');
        }
        
        profiles = await response.json();
        renderProfiles();
    } catch (error) {
        console.error('Erro:', error);
        showAlert('Erro ao carregar perfis', 'error');
    } finally {
        showLoading(false);
    }
}

// Renderizar lista de perfis
function renderProfiles() {
    const container = document.getElementById('profiles-container');
    const emptyState = document.getElementById('empty-state');
    
    if (profiles.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    container.style.display = 'grid';
    emptyState.style.display = 'none';
    
    container.innerHTML = profiles.map(profile => `
        <div class="profile-card">
            <img src="/${profile.banner_image}" alt="Banner" class="profile-banner" 
                 onerror="this.style.background='linear-gradient(135deg, #a855f7 0%, #ec4899 100%)'">
            <div class="profile-content">
                <div class="profile-header">
                    <img src="/${profile.profile_image}" alt="Avatar" class="profile-avatar"
                         onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'60\\' height=\\'60\\'%3E%3Crect fill=\\'%23a855f7\\' width=\\'60\\' height=\\'60\\'/%3E%3C/svg%3E'">
                    <div class="profile-info">
                        <div class="profile-name">${profile.display_name}</div>
                        <div class="profile-username">@${profile.username}</div>
                    </div>
                </div>
                
                <div class="profile-stats">
                    <div class="stat">
                        <div class="stat-value">${profile.photos_count}</div>
                        <div class="stat-label">Fotos</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${profile.videos_count}</div>
                        <div class="stat-label">Vídeos</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${profile.likes_count}</div>
                        <div class="stat-label">Likes</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${profile.posts_count}</div>
                        <div class="stat-label">Posts</div>
                    </div>
                </div>
                
                <div class="profile-actions">
                    <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="viewProfile('${profile.username}')">
                        👁️ Ver
                    </button>
                    <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick="editProfile(${profile.id})">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProfile(${profile.id}, '${profile.username}')">
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Abrir modal de criar perfil
function openCreateModal() {
    currentProfileId = null;
    document.getElementById('modal-title').textContent = 'Novo Perfil';
    document.getElementById('profile-form').reset();
    document.getElementById('profile-id').value = '';
    document.getElementById('username-feedback').textContent = '';
    document.getElementById('save-btn').textContent = '💾 Criar Perfil';
    document.getElementById('profile-modal').classList.add('active');
}

// Editar perfil
async function editProfile(profileId) {
    // Redirecionar para página de edição
    window.location.href = `/edit-profile.html?id=${profileId}`;
        
        document.getElementById('profile-modal').classList.add('active');
    } catch (error) {
        console.error('Erro:', error);
        showAlert('Erro ao carregar perfil', 'error');
    } finally {
        showLoading(false);
    }
}

// Salvar perfil (criar ou atualizar)
async function saveProfile(event) {
    event.preventDefault();
    
    const profileId = document.getElementById('profile-id').value;
    const data = {
        username: document.getElementById('username').value,
        display_name: document.getElementById('display_name').value,
        bio: document.getElementById('bio').value,
        location: document.getElementById('location').value,
        link: document.getElementById('link').value,
        photos_count: parseInt(document.getElementById('photos_count').value) || 0,
        videos_count: parseInt(document.getElementById('videos_count').value) || 0,
        likes_count: document.getElementById('likes_count').value,
        posts_count: parseInt(document.getElementById('posts_count').value) || 0,
        media_count: 0
    };
    
    showLoading(true);
    
    try {
        const url = profileId ? `/api/profiles/${profileId}` : '/api/profiles';
        const method = profileId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Erro ao salvar perfil');
        }
        
        showAlert(profileId ? 'Perfil atualizado com sucesso!' : 'Perfil criado com sucesso!', 'success');
        closeModal();
        loadProfiles();
    } catch (error) {
        console.error('Erro:', error);
        showAlert(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Deletar perfil
async function deleteProfile(profileId, username) {
    if (!confirm(`Tem certeza que deseja deletar o perfil @${username}?\n\nEsta ação não pode ser desfeita.`)) {
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch(`/api/profiles/${profileId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Erro ao deletar perfil');
        }
        
        showAlert('Perfil deletado com sucesso!', 'success');
        loadProfiles();
    } catch (error) {
        console.error('Erro:', error);
        showAlert('Erro ao deletar perfil', 'error');
    } finally {
        showLoading(false);
    }
}

// Verificar disponibilidade de username
async function checkUsername(username) {
    // Limpar timeout anterior
    if (usernameCheckTimeout) {
        clearTimeout(usernameCheckTimeout);
    }
    
    const feedback = document.getElementById('username-feedback');
    
    if (!username || username.length < 3) {
        feedback.textContent = '';
        return;
    }
    
    // Aguardar 500ms antes de fazer a requisição
    usernameCheckTimeout = setTimeout(async () => {
        try {
            const profileId = document.getElementById('profile-id').value;
            const url = `/api/check-username/${username}${profileId ? `?profile_id=${profileId}` : ''}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            feedback.textContent = data.message;
            feedback.className = `username-feedback ${data.available ? 'available' : 'unavailable'}`;
        } catch (error) {
            console.error('Erro ao verificar username:', error);
        }
    }, 500);
}

// Ver perfil
function viewProfile(username) {
    window.open(`/${username}`, '_blank');
}

// Fechar modal
function closeModal() {
    document.getElementById('profile-modal').classList.remove('active');
    document.getElementById('profile-form').reset();
    currentProfileId = null;
}

// Mostrar/ocultar loading
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.add('active');
    } else {
        loading.classList.remove('active');
    }
}

// Mostrar alerta
function showAlert(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.textContent = message;
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

