from flask import Blueprint, request, jsonify, session
from src.models.profile import db, Admin
from werkzeug.security import check_password_hash

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """Rota de login para administradores"""
    data = request.get_json()
    
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'error': 'Username and password are required'}), 400
    
    username = data['username']
    password = data['password']
    
    # Buscar admin no banco de dados
    admin = Admin.query.filter_by(username=username).first()
    
    if not admin:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Verificar senha
    if not check_password_hash(admin.password, password):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Criar sessão
    session['admin_id'] = admin.id
    session['admin_username'] = admin.username
    
    return jsonify({
        'message': 'Login successful',
        'admin': admin.to_dict()
    }), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Rota de logout"""
    session.clear()
    return jsonify({'message': 'Logout successful'}), 200

@auth_bp.route('/check-auth', methods=['GET'])
def check_auth():
    """Verifica se o usuário está autenticado"""
    if 'admin_id' in session:
        admin = Admin.query.get(session['admin_id'])
        if admin:
            return jsonify({
                'authenticated': True,
                'admin': admin.to_dict()
            }), 200
    
    return jsonify({'authenticated': False}), 401

