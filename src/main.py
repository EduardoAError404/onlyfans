import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
import requests
import sqlite3
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
# Suporta tanto caminho local (desenvolvimento) quanto volume compartilhado (produção)
db_path = os.getenv('DATABASE_PATH', os.path.join(os.path.dirname(__file__), 'database', 'app.db'))
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{db_path}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Log do caminho do banco de dados
print(f'📁 Banco de dados configurado em: {db_path}')

def migrate_database():
    """Migração do banco de dados usando SQL direto (antes do SQLAlchemy)"""
    import sys
    print('=' * 60, flush=True)
    print('🔧 INICIANDO MIGRAÇÃO DO BANCO DE DADOS', flush=True)
    print('=' * 60, flush=True)
    sys.stdout.flush()
    
    # Garantir que o diretório do banco de dados existe
    db_dir = os.path.dirname(db_path)
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)
        print(f'📁 Diretório do banco de dados criado: {db_dir}', flush=True)
    
    print(f'🔍 Verificando banco em: {db_path}', flush=True)
    print(f'🔍 Banco existe: {os.path.exists(db_path)}', flush=True)
    sys.stdout.flush()
    
    # Se o banco não existe, não precisa migrar
    if not os.path.exists(db_path):
        print('ℹ️ Banco de dados novo - nenhuma migração necessária', flush=True)
        sys.stdout.flush()
        return
    
    # Conectar diretamente com sqlite3 para fazer a migração
    try:
        print('🔗 Conectando ao banco de dados...', flush=True)
        sys.stdout.flush()
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Verificar se a tabela profile existe
        print('🔍 Verificando se tabela profile existe...', flush=True)
        sys.stdout.flush()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='profile'")
        table_exists = cursor.fetchone()
        print(f'🔍 Tabela profile existe: {bool(table_exists)}', flush=True)
        sys.stdout.flush()
        
        if table_exists:
            # Verificar se a coluna subscription_price existe
            print('🔍 Verificando colunas da tabela profile...', flush=True)
            sys.stdout.flush()
            cursor.execute("PRAGMA table_info(profile)")
            columns = [row[1] for row in cursor.fetchall()]
            print(f'🔍 Colunas encontradas: {columns}', flush=True)
            sys.stdout.flush()
            
            if 'subscription_price' not in columns:
                # Adicionar a coluna subscription_price
                print('🛠️ Adicionando coluna subscription_price...', flush=True)
                sys.stdout.flush()
                cursor.execute('ALTER TABLE profile ADD COLUMN subscription_price FLOAT DEFAULT 9.99')
                conn.commit()
                print('✅ Migração: Coluna subscription_price adicionada com sucesso!', flush=True)
                sys.stdout.flush()
            else:
                print('✅ Migração: Coluna subscription_price já existe', flush=True)
                sys.stdout.flush()
                
            if 'currency' not in columns:
                # Adicionar a coluna currency
                print('🛠️ Adicionando coluna currency...', flush=True)
                sys.stdout.flush()
                cursor.execute("ALTER TABLE profile ADD COLUMN currency VARCHAR(3) DEFAULT 'USD'")
                conn.commit()
                print('✅ Migração: Coluna currency adicionada com sucesso!', flush=True)
                sys.stdout.flush()
            else:
                print('✅ Migração: Coluna currency já existe', flush=True)
                sys.stdout.flush()
        else:
            print('ℹ️ Tabela profile não existe ainda - será criada pelo SQLAlchemy', flush=True)
            sys.stdout.flush()
        
        conn.close()
        print('=' * 60, flush=True)
        print('✅ MIGRAÇÃO CONCLUÍDA', flush=True)
        print('=' * 60, flush=True)
        sys.stdout.flush()
    except Exception as e:
        print(f'❌ ERRO NA MIGRAÇÃO: {str(e)}', flush=True)
        import traceback
        traceback.print_exc()
        sys.stdout.flush()

def init_database():
    with app.app_context():
        db.create_all()
        
        # Criar perfil padrão se não existir
        if not Profile.query.first():
            default_profile = Profile(
                username='babymatosao',
                display_name='Victoria Matosa',
                bio='''SUBSCRIBE <strong>NOW</strong> = WIN A HUGE <strong>GIFT</strong>! (REAL!) <br> &amp; INSTANT ACCESS TO OVER +1.5K MEDIA! 🔞 <br> <br> ➤ TIP MENU / SERVICIOS / SERVIÇOS: <br> <br> • Phone Calls <br> • Dick Rate | Avaliação <br> • Sexting | Sexo Virtual <br> • Chat / Talk to Me! <br> • Virtual Girlfriend Experience <br> • Videos/Pics Custom 🔞 <br> • Hot Anal Content <br> • Rebill/Resub EXCLUSIVE Gift <br> + And More! Join Now! <br> <br> <span class="m-editor-fc__blue-1"><strong>P.S</strong></span><span class="m-editor-fc__default"><strong>:</strong></span> I do not accept "Tip" as a payment method for Media. You've been warned.<br> <span class="m-editor-fc__blue-1"><strong>P.P.S.</strong></span><strong>:</strong></span><strong>:</strong> Services on "Tip Menu" will only be done if I agree. If that's the case, I will reply directly to you saying, expressly, that I am going to do it. Paying ahead of time without my express confirmation on text, using proper words, is entirely your responsibility.''',
                location='Brasil',
                link='https://linktr.ee/babymatosa',
                photos_count=1700,
                videos_count=488,
                likes_count='2.16M',
                posts_count=2015,
                media_count=2225,
                banner_image='baneronly.png',
                profile_image='perfil.png',
                subscription_price=9.99,
                currency='USD'
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

# IMPORTANTE: Migrar ANTES de inicializar o SQLAlchemy
migrate_database()
init_database()

# Proxy para o payment server
PAYMENT_SERVER_URL = os.getenv('PAYMENT_SERVER_URL', 'http://localhost:3000')

@app.route('/api/subscription-plans/<username>')
def get_subscription_plans(username):
    """
    Retorna planos de assinatura calculados a partir do preço base do perfil
    Não depende do payment server - calcula localmente
    """
    try:
        # Buscar perfil do banco de dados
        profile = Profile.query.filter_by(username=username).first()
        
        if not profile:
            return jsonify({'error': 'Profile not found'}), 404
        
        # Obter preço base (mensal)
        base_price = float(profile.subscription_price)
        
        # Calcular preços dos planos com descontos
        plans = {
            '1_month': {
                'name': '1 mês',
                'duration': 1,
                'price': round(base_price, 2),
                'discount': 0,
                'total': round(base_price, 2),
                'savings': 0
            },
            '6_months': {
                'name': '6 meses',
                'duration': 6,
                'price': round(base_price * 6 * 0.80, 2),  # 20% OFF
                'discount': 20,
                'total': round(base_price * 6 * 0.80, 2),
                'savings': round(base_price * 6 * 0.20, 2)
            },
            '12_months': {
                'name': '12 meses',
                'duration': 12,
                'price': round(base_price * 12 * 0.65, 2),  # 35% OFF
                'discount': 35,
                'total': round(base_price * 12 * 0.65, 2),
                'savings': round(base_price * 12 * 0.35, 2)
            }
        }
        
        return jsonify(plans), 200
        
    except Exception as e:
        print(f"❌ Erro ao calcular planos: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/create-checkout-session', methods=['POST'])
def proxy_create_checkout():
    """Proxy para criar sessão de checkout no payment server"""
    try:
        response = requests.post(
            f'{PAYMENT_SERVER_URL}/api/create-checkout-session',
            json=request.get_json(),
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        return jsonify(response.json()), response.status_code
    except Exception as e:
        print(f'❌ Erro ao conectar com payment server: {str(e)}')
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
    """Página de sucesso após pagamento"""
    return send_from_directory(app.static_folder, 'payment-success.html')

@app.route('/cancel')
def payment_cancel():
    """Página de cancelamento de pagamento"""
    return send_from_directory(app.static_folder, 'index.html')

# Servir arquivos estáticos
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    # Se o arquivo existe, servir o arquivo
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    
    # Se começa com 'api/', retornar 404 JSON
    if path.startswith('api/'):
        return jsonify({'error': 'Not found'}), 404
    
    # Para qualquer outra rota (username), servir index.html
    # O JavaScript vai detectar o username e buscar o perfil correto
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

