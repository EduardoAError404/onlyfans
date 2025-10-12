import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
import requests
from src.models.profile import db, Profile, Admin
from src.routes.profile import profile_bp
from src.routes.auth import auth_bp
from werkzeug.security import generate_password_hash
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'f8a3c9e7d2b1a4f6e9c8d7b3a2f1e4d9c8b7a6f5e4d3c2b1a9f8e7d6c5b4a3f2'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload
CORS(app, supports_credentials=True)

# Criar pasta de uploads se não existir
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'static', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.register_blueprint(profile_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api')

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

def init_database():
    with app.app_context():
        db.create_all()
        
        # Criar perfil padrão se não existir
        if not Profile.query.first():
            default_profile = Profile(
                username='babymatosao',
                display_name='Victoria Matosa',
                bio='''SUBSCRIBE <strong>NOW</strong> = WIN A HUGE <strong>GIFT</strong>! (REAL!) <br> &amp; INSTANT ACCESS TO OVER +1.5K MEDIA! 🔞 <br> <br> ➤ TIP MENU / SERVICIOS / SERVIÇOS: <br> <br> • Phone Calls <br> • Dick Rate | Avaliação <br> • Sexting | Sexo Virtual <br> • Chat / Talk to Me! <br> • Virtual Girlfriend Experience <br> • Videos/Pics Custom 🔞 <br> • Hot Anal Content <br> • Rebill/Resub EXCLUSIVE Gift <br> + And More! Join Now! <br> <br> <span class="m-editor-fc__blue-1"><strong>P.S</strong></span><span class="m-editor-fc__default"><strong>:</strong></span> I do not accept "Tip" as a payment method for Media. You've been warned.<br> <span class="m-editor-fc__blue-1"><strong>P.P.S.</strong></span><strong>:</strong> Services on "Tip Menu" will only be done if I agree. If that's the case, I will reply directly to you saying, expressly, that I am going to do it. Paying ahead of time without my express confirmation on text, using proper words, is entirely your responsibility.''',
                location='Brasil',
                link='https://linktr.ee/babymatosa',
                photos_count=1700,
                videos_count=488,
                likes_count='2.16M',
                posts_count=2015,
                media_count=2225,
                banner_image='baneronly.png',
                profile_image='perfil.png'
            )
            db.session.add(default_profile)
            db.session.commit()
            print("✓ Perfil padrão criado")
        
        # Criar admin padrão se não existir
        if not Admin.query.first():
            default_admin = Admin(
                username='admin',
                password=generate_password_hash('admin123')
            )
            db.session.add(default_admin)
            db.session.commit()
            print("✓ Admin padrão criado (username: admin, password: admin123)")

init_database()

# Proxy para o payment server
PAYMENT_SERVER_URL = os.getenv('PAYMENT_SERVER_URL', 'http://localhost:3000')

@app.route('/api/subscription-plans/<username>')
def proxy_subscription_plans(username):
    """Proxy para buscar planos de assinatura do payment server"""
    try:
        response = requests.get(f'{PAYMENT_SERVER_URL}/api/subscription-plans/{username}', timeout=5)
        return jsonify(response.json()), response.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/create-checkout-session', methods=['POST'])
def proxy_create_checkout():
    """Proxy para criar sessão de checkout no Stripe"""
    try:
        response = requests.post(
            f'{PAYMENT_SERVER_URL}/api/create-checkout-session',
            json=request.get_json(),
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        return jsonify(response.json()), response.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/session/<session_id>')
def proxy_session(session_id):
    """Proxy para buscar dados da sessão do Stripe"""
    try:
        response = requests.get(f'{PAYMENT_SERVER_URL}/api/session/{session_id}', timeout=5)
        return jsonify(response.json()), response.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/success')
def payment_success():
    """Página de sucesso do pagamento - protegida"""
    session_id = request.args.get('session_id')
    
    # Se não tiver session_id, retornar 404
    if not session_id:
        static_folder_path = app.static_folder
        if static_folder_path and os.path.exists(os.path.join(static_folder_path, 'profile-not-found.html')):
            return send_from_directory(static_folder_path, 'profile-not-found.html'), 404
        return "Page not found", 404
    
    # Buscar dados da sessão do Stripe via servidor de pagamentos
    try:
        payment_server_url = os.getenv('PAYMENT_SERVER_URL', 'http://localhost:3000')
        response = requests.get(f'{payment_server_url}/api/session/{session_id}', timeout=5)
        
        if response.status_code == 200:
            session_data = response.json()
        else:
            session_data = None
    except:
        session_data = None
    
    # Servir página de sucesso
    static_folder_path = app.static_folder
    if static_folder_path and os.path.exists(os.path.join(static_folder_path, 'payment-success.html')):
        return send_from_directory(static_folder_path, 'payment-success.html')
    
    return "Payment successful", 200

@app.route('/')
def index():
    """Página inicial - redireciona para o primeiro perfil ou mostra lista"""
    first_profile = Profile.query.first()
    if first_profile:
        return serve_profile(first_profile.username)
    return "Nenhum perfil encontrado. <a href='/admin.html'>Ir para Admin</a>", 404

@app.route('/<username>')
def serve_profile(username):
    """Servir perfil por username"""
    # Verificar se é um arquivo estático
    static_folder_path = app.static_folder
    if static_folder_path and os.path.exists(os.path.join(static_folder_path, username)):
        return send_from_directory(static_folder_path, username)
    
    # Verificar se o perfil existe
    profile = Profile.query.filter_by(username=username).first()
    if profile:
        # Servir index.html que carregará os dados via API
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
    
    # Perfil não encontrado - retornar página personalizada
    if static_folder_path and os.path.exists(os.path.join(static_folder_path, 'profile-not-found.html')):
        return send_from_directory(static_folder_path, 'profile-not-found.html'), 404
    
    return f"Perfil @{username} não encontrado", 404

@app.route('/<path:path>')
def serve_static(path):
    """Servir arquivos estáticos"""
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404
    
    if os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    
    # Retornar página 404 sem alterar URL
    return send_from_directory(static_folder_path, '404.html'), 404

@app.errorhandler(404)
def page_not_found(e):
    """Handler global para erros 404"""
    static_folder_path = app.static_folder
    if static_folder_path and os.path.exists(os.path.join(static_folder_path, '404.html')):
        return send_from_directory(static_folder_path, '404.html'), 404
    return "Page not found", 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)

