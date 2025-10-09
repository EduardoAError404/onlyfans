from flask import Blueprint, request, jsonify, session
from src.models.profile import db, Profile, Admin
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps

profile_bp = Blueprint('profile', __name__)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_id' not in session:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated_function

# Rota para obter dados do perfil
@profile_bp.route('/profile', methods=['GET'])
def get_profile():
    profile = Profile.query.first()
    if profile:
        return jsonify(profile.to_dict()), 200
    return jsonify({'error': 'Profile not found'}), 404

# Rota para atualizar dados do perfil (requer autenticação)
@profile_bp.route('/profile', methods=['PUT'])
@login_required
def update_profile():
    data = request.get_json()
    profile = Profile.query.first()
    
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    
    # Atualizar campos
    if 'username' in data:
        profile.username = data['username']
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
    
    db.session.commit()
    return jsonify(profile.to_dict()), 200

# Rota de login
@profile_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    admin = Admin.query.filter_by(username=username).first()
    
    if admin and check_password_hash(admin.password, password):
        session['admin_id'] = admin.id
        return jsonify({'message': 'Login successful', 'admin': admin.to_dict()}), 200
    
    return jsonify({'error': 'Invalid credentials'}), 401

# Rota de logout
@profile_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('admin_id', None)
    return jsonify({'message': 'Logout successful'}), 200

# Rota para verificar se está logado
@profile_bp.route('/check-auth', methods=['GET'])
def check_auth():
    if 'admin_id' in session:
        admin = Admin.query.get(session['admin_id'])
        if admin:
            return jsonify({'authenticated': True, 'admin': admin.to_dict()}), 200
    return jsonify({'authenticated': False}), 200

# Rota para criar admin inicial (apenas para setup)
@profile_bp.route('/setup-admin', methods=['POST'])
def setup_admin():
    # Verificar se já existe um admin
    if Admin.query.first():
        return jsonify({'error': 'Admin already exists'}), 400
    
    data = request.get_json()
    username = data.get('username', 'admin')
    password = data.get('password', 'admin123')
    
    hashed_password = generate_password_hash(password)
    admin = Admin(username=username, password=hashed_password)
    
    db.session.add(admin)
    db.session.commit()
    
    return jsonify({'message': 'Admin created successfully', 'admin': admin.to_dict()}), 201

