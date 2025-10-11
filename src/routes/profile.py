from flask import Blueprint, request, jsonify, session
from src.models.profile import db, Profile, Admin
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from functools import wraps
import os
import uuid

profile_bp = Blueprint('profile', __name__)

# Configuração de uploads
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static', 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_id' not in session:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated_function

# ==================== ROTAS DE PERFIS ====================

# Listar todos os perfis
@profile_bp.route('/profiles', methods=['GET'])
@login_required
def list_profiles():
    profiles = Profile.query.all()
    return jsonify([p.to_dict() for p in profiles]), 200

# Obter perfil por ID
@profile_bp.route('/profiles/<int:profile_id>', methods=['GET'])
@login_required
def get_profile_by_id(profile_id):
    profile = Profile.query.get(profile_id)
    if profile:
        return jsonify(profile.to_dict()), 200
    return jsonify({'error': 'Profile not found'}), 404

# Obter perfil por username (público)
@profile_bp.route('/profile/<username>', methods=['GET'])
def get_profile_by_username(username):
    profile = Profile.query.filter_by(username=username).first()
    if profile:
        return jsonify(profile.to_dict()), 200
    return jsonify({'error': 'Profile not found'}), 404

# Criar novo perfil
@profile_bp.route('/profiles', methods=['POST'])
@login_required
def create_profile():
    data = request.get_json()
    
    # Validar campos obrigatórios
    required_fields = ['username', 'display_name']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'error': f'Field {field} is required'}), 400
    
    # Verificar se username já existe
    existing = Profile.query.filter_by(username=data['username']).first()
    if existing:
        return jsonify({'error': 'Username already exists'}), 400
    
    # Criar novo perfil
    profile = Profile(
        username=data['username'],
        display_name=data.get('display_name', ''),
        bio=data.get('bio', ''),
        location=data.get('location', ''),
        link=data.get('link', ''),
        photos_count=data.get('photos_count', 0),
        videos_count=data.get('videos_count', 0),
        likes_count=data.get('likes_count', '0'),
        posts_count=data.get('posts_count', 0),
        media_count=data.get('media_count', 0),
        banner_image=data.get('banner_image', 'baneronly.png'),
        profile_image=data.get('profile_image', 'perfil.png'),
        subscription_price=data.get('subscription_price', 9.99)
    )
    
    db.session.add(profile)
    db.session.commit()
    
    return jsonify(profile.to_dict()), 201

# Atualizar perfil
@profile_bp.route('/profiles/<int:profile_id>', methods=['PUT'])
@login_required
def update_profile(profile_id):
    data = request.get_json()
    profile = Profile.query.get(profile_id)
    
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    
    # Se está mudando o username, verificar se o novo está disponível
    if 'username' in data and data['username'] != profile.username:
        existing = Profile.query.filter_by(username=data['username']).first()
        if existing:
            return jsonify({'error': 'Username already exists'}), 400
        profile.username = data['username']
    
    # Atualizar outros campos
    if 'display_name' in data:
        profile.display_name = data['display_name']
    if 'bio' in data:
        profile.bio = data['bio']
    if 'location' in data:
        profile.location = data['location']
    if 'link' in data:
        profile.link = data['link']
    if 'photos_count' in data:
        profile.photos_count = data['photos_count']
    if 'videos_count' in data:
        profile.videos_count = data['videos_count']
    if 'likes_count' in data:
        profile.likes_count = data['likes_count']
    if 'posts_count' in data:
        profile.posts_count = data['posts_count']
    if 'media_count' in data:
        profile.media_count = data['media_count']
    if 'subscription_price' in data:
        profile.subscription_price = data['subscription_price']
    
    db.session.commit()
    return jsonify(profile.to_dict()), 200

# Deletar perfil
@profile_bp.route('/profiles/<int:profile_id>', methods=['DELETE'])
@login_required
def delete_profile(profile_id):
    profile = Profile.query.get(profile_id)
    
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    
    db.session.delete(profile)
    db.session.commit()
    
    return jsonify({'message': 'Profile deleted successfully'}), 200

# Verificar disponibilidade de username
@profile_bp.route('/check-username/<username>', methods=['GET'])
@login_required
def check_username(username):
    # Verificar se está editando um perfil existente
    profile_id = request.args.get('profile_id', type=int)
    
    existing = Profile.query.filter_by(username=username).first()
    
    # Se existe e não é o perfil atual sendo editado
    if existing and (not profile_id or existing.id != profile_id):
        return jsonify({'available': False, 'message': '❌ Username já está em uso'}), 200
    
    return jsonify({'available': True, 'message': '✅ Username disponível'}), 200

# ==================== ROTAS DE UPLOAD ====================

# Upload de imagem
@profile_bp.route('/upload-image', methods=['POST'])
@login_required
def upload_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    image_type = request.form.get('type', 'profile')
    profile_id = request.form.get('profile_id', type=int)
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file and allowed_file(file.filename):
        # Gerar nome único para o arquivo
        ext = file.filename.rsplit('.', 1)[1].lower()
        filename = f"{image_type}_{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        # Salvar arquivo
        file.save(filepath)
        
        # Retornar caminho relativo
        relative_path = f"uploads/{filename}"
        
        # Atualizar no banco de dados se profile_id foi fornecido
        if profile_id:
            profile = Profile.query.get(profile_id)
            if profile:
                if image_type == 'profile':
                    profile.profile_image = relative_path
                elif image_type == 'banner':
                    profile.banner_image = relative_path
                db.session.commit()
        
        return jsonify({
            'message': 'Image uploaded successfully',
            'filename': relative_path,
            'type': image_type
        }), 200
    
    return jsonify({'error': 'Invalid file type'}), 400

# Atualizar imagem por URL
@profile_bp.route('/update-image-url', methods=['POST'])
@login_required
def update_image_url():
    data = request.get_json()
    image_url = data.get('url')
    image_type = data.get('type', 'profile')
    profile_id = data.get('profile_id', type=int)
    
    if not image_url:
        return jsonify({'error': 'No URL provided'}), 400
    
    if not profile_id:
        return jsonify({'error': 'No profile_id provided'}), 400
    
    profile = Profile.query.get(profile_id)
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    
    if image_type == 'profile':
        profile.profile_image = image_url
    elif image_type == 'banner':
        profile.banner_image = image_url
    
    db.session.commit()
    
    return jsonify({
        'message': 'Image URL updated successfully',
        'url': image_url,
        'type': image_type
    }), 200

# ==================== ROTAS DE AUTENTICAÇÃO ====================

# Login
@profile_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    admin = Admin.query.filter_by(username=username).first()
    
    if admin and check_password_hash(admin.password, password):
        session['admin_id'] = admin.id
        session.permanent = True
        session.modified = True
        return jsonify({'message': 'Login successful', 'admin': admin.to_dict()}), 200
    
    return jsonify({'error': 'Invalid credentials'}), 401

# Logout
@profile_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('admin_id', None)
    return jsonify({'message': 'Logged out'}), 200

# Verificar autenticação
@profile_bp.route('/check-auth', methods=['GET'])
def check_auth():
    if 'admin_id' in session:
        admin = Admin.query.get(session['admin_id'])
        if admin:
            return jsonify({'authenticated': True, 'admin': admin.to_dict()}), 200
    return jsonify({'authenticated': False}), 200

