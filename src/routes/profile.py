from flask import Blueprint, request, jsonify, current_app
from src.models.profile import db, Profile
from functools import wraps
from flask import session
from sqlalchemy import text
import os
from werkzeug.utils import secure_filename

profile_bp = Blueprint('profile', __name__)

# Decorator para rotas que requerem autenticação
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_id' not in session:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated_function

# ==========================================
# ROTAS DE LEITURA (GET)
# ==========================================

@profile_bp.route('/profiles', methods=['GET'])
def list_profiles():
    """Lista todos os perfis"""
    profiles = Profile.query.all()
    return jsonify([p.to_dict() for p in profiles]), 200

@profile_bp.route('/profiles/<int:profile_id>', methods=['GET'])
@login_required
def get_profile_by_id(profile_id):
    """Obtém perfil por ID (requer autenticação)"""
    profile = Profile.query.get(profile_id)
    if profile:
        return jsonify(profile.to_dict()), 200
    return jsonify({'error': 'Profile not found'}), 404

@profile_bp.route('/profile', methods=['GET'])
def get_default_profile():
    """Obtém perfil padrão (babymatosao) - USADO PELO DYNAMIC LOADER"""
    profile = Profile.query.filter_by(username='babymatosao').first()
    if profile:
        data = profile.to_dict()
        # Garantir que subscription_price está presente e é float
        data['subscription_price'] = float(profile.subscription_price)
        return jsonify(data), 200
    return jsonify({'error': 'Profile not found'}), 404

@profile_bp.route('/profile/<username>', methods=['GET'])
def get_profile_by_username(username):
    """Obtém perfil por username (público) - USADO PELO PAYMENT SERVER"""
    profile = Profile.query.filter_by(username=username).first()
    if profile:
        data = profile.to_dict()
        # Garantir que subscription_price está presente e é float
        data['subscription_price'] = float(profile.subscription_price)
        return jsonify(data), 200
    return jsonify({'error': 'Profile not found'}), 404

# ==========================================
# ROTAS DE CRIAÇÃO (POST)
# ==========================================

@profile_bp.route('/profiles', methods=['POST'])
@login_required
def create_profile():
    """Cria um novo perfil"""
    data = request.get_json()
    
    # Validar campos obrigatórios
    required_fields = ['username', 'display_name', 'bio', 'location', 'link']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Verificar se username já existe
    if Profile.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    # Criar novo perfil
    profile = Profile(
        username=data['username'],
        display_name=data['display_name'],
        bio=data['bio'],
        location=data['location'],
        link=data['link'],
        photos_count=data.get('photos_count', 0),
        videos_count=data.get('videos_count', 0),
        likes_count=data.get('likes_count', '0'),
        posts_count=data.get('posts_count', 0),
        media_count=data.get('media_count', 0),
        banner_image=data.get('banner_image', 'baneronly.png'),
        profile_image=data.get('profile_image', 'perfil.png'),
        subscription_price=float(data.get('subscription_price', 9.99))  # PREÇO PADRÃO
    )
    
    db.session.add(profile)
    db.session.commit()
    
    return jsonify(profile.to_dict()), 201

# ==========================================
# ROTAS DE ATUALIZAÇÃO (PUT) - PRECIFICAÇÃO
# ==========================================

@profile_bp.route('/profiles/<int:profile_id>', methods=['PUT'])
@login_required
def update_profile(profile_id):
    """
    Atualiza um perfil existente
    ESTA É A ROTA PRINCIPAL PARA ATUALIZAR O PREÇO
    """
    profile = Profile.query.get(profile_id)
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    
    data = request.get_json()
    
    # Atualizar campos básicos
    if 'display_name' in data:
        profile.display_name = data['display_name']
    if 'bio' in data:
        profile.bio = data['bio']
    if 'location' in data:
        profile.location = data['location']
    if 'link' in data:
        profile.link = data['link']
    
    # Atualizar estatísticas
    if 'photos_count' in data:
        profile.photos_count = int(data['photos_count'])
    if 'videos_count' in data:
        profile.videos_count = int(data['videos_count'])
    if 'likes_count' in data:
        profile.likes_count = str(data['likes_count'])
    if 'posts_count' in data:
        profile.posts_count = int(data['posts_count'])
    if 'media_count' in data:
        profile.media_count = int(data['media_count'])
    
    # Atualizar imagens
    if 'banner_image' in data:
        profile.banner_image = data['banner_image']
    if 'profile_image' in data:
        profile.profile_image = data['profile_image']
    
    # ==========================================
    # ATUALIZAR PREÇO - PARTE CRÍTICA
    # ==========================================
    if 'subscription_price' in data:
        try:
            new_price = float(data['subscription_price'])
            if new_price < 0:
                return jsonify({'error': 'Price cannot be negative'}), 400
            profile.subscription_price = new_price
            print(f"💰 Atualizando preço para: ${new_price}")
        except (ValueError, TypeError):
	            return jsonify({'error': 'Invalid price format'}), 400
	    
	    # ATUALIZAR MOEDA - PARTE CRÍTICA
	    if 'currency' in data:
	        new_currency = data['currency'].upper()
	        allowed_currencies = ['BRL', 'USD', 'EUR']
	        if new_currency not in allowed_currencies:
	            return jsonify({'error': f'Invalid currency: {new_currency}. Allowed: {", ".join(allowed_currencies)}'}), 400
	        profile.currency = new_currency
	        print(f"💵 Atualizando moeda para: {new_currency}")
	        
	    # Salvar no banco de dados com flush + commit + checkpoint
    try:
        db.session.flush()
        db.session.commit()
        db.session.execute(text('PRAGMA wal_checkpoint(TRUNCATE)'))
        db.session.commit()
        print(f"✅ Perfil {profile_id} atualizado com sucesso!")
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Erro ao salvar: {str(e)}")
        return jsonify({'error': str(e)}), 500
    
    return jsonify(profile.to_dict()), 200

# ==========================================
# ROTAS DE EXCLUSÃO (DELETE)
# ==========================================

@profile_bp.route('/profiles/<int:profile_id>', methods=['DELETE'])
@login_required
def delete_profile(profile_id):
    """Deleta um perfil"""
    profile = Profile.query.get(profile_id)
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    
    db.session.delete(profile)
    db.session.commit()
    
    return jsonify({'message': 'Profile deleted successfully'}), 200

# ==========================================
# UPLOAD DE IMAGENS
# ==========================================

UPLOAD_FOLDER = 'src/static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@profile_bp.route('/upload', methods=['POST'])
@profile_bp.route('/upload-image', methods=['POST'])  # Alias para compatibilidade
@login_required
def upload_file():
    """Upload de imagem de perfil ou banner"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        # Gerar nome único para o arquivo
        import uuid
        ext = file.filename.rsplit('.', 1)[1].lower()
        filename = f"{request.form.get('type', 'image')}_{uuid.uuid4().hex}.{ext}"
        filename = secure_filename(filename)
        
        # Criar diretório se não existir
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        
        # Salvar arquivo
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # Retornar caminho relativo
        return jsonify({
            'filename': f'uploads/{filename}',
            'url': f'/static/uploads/{filename}'
        }), 200
    
    return jsonify({'error': 'Invalid file type'}), 400

