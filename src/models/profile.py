from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Profile(db.Model):
    """Modelo de perfil do criador de conteúdo"""
    __tablename__ = 'profile'
    
    # Identificação
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False, index=True)
    display_name = db.Column(db.String(100), nullable=False)
    
    # Informações do perfil
    bio = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(100), nullable=False)
    link = db.Column(db.String(200), nullable=False)
    
    # Estatísticas
    photos_count = db.Column(db.Integer, default=0)
    videos_count = db.Column(db.Integer, default=0)
    likes_count = db.Column(db.String(20), default="0")
    posts_count = db.Column(db.Integer, default=0)
    media_count = db.Column(db.Integer, default=0)
    
    # Imagens
    banner_image = db.Column(db.String(200), default="baneronly.png")
    profile_image = db.Column(db.String(200), default="perfil.png")
    
    # PRECIFICAÇÃO - Campo único e definitivo para o preço mensal
    subscription_price = db.Column(db.Float, nullable=False, default=9.99)
    currency = db.Column(db.String(3), nullable=False, default='USD')
    
    # INTERNACIONALIZAÇÃO - Idioma do perfil
    language = db.Column(db.String(2), nullable=False, default='en')  # 'en', 'pt', 'es'
    
    def to_dict(self):
        """Converte o perfil para dicionário incluindo o preço"""
        return {
            'id': self.id,
            'username': self.username,
            'display_name': self.display_name,
            'bio': self.bio,
            'location': self.location,
            'link': self.link,
            'photos_count': self.photos_count,
            'videos_count': self.videos_count,
            'likes_count': self.likes_count,
            'posts_count': self.posts_count,
            'media_count': self.media_count,
            'banner_image': self.banner_image,
            'profile_image': self.profile_image,
            'subscription_price': float(self.subscription_price),  # Garantir que é float
            'currency': self.currency,
            'language': self.language,
            'profile_photo': f'/static/{self.profile_image}' if self.profile_image else None,
            'cover_photo': f'/static/{self.banner_image}' if self.banner_image else None
        }

class Admin(db.Model):
    """Modelo de administrador do sistema"""
    __tablename__ = 'admin'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username
        }

