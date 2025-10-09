from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Profile(db.Model):
    __tablename__ = 'profile'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    display_name = db.Column(db.String(100), nullable=False)
    bio = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(100), nullable=False)
    link = db.Column(db.String(200), nullable=False)
    photos_count = db.Column(db.Integer, default=0)
    videos_count = db.Column(db.Integer, default=0)
    likes_count = db.Column(db.String(20), default="0")
    posts_count = db.Column(db.Integer, default=0)
    media_count = db.Column(db.Integer, default=0)
    banner_image = db.Column(db.String(200), default="baneronly.png")
    profile_image = db.Column(db.String(200), default="perfil.png")
    
    def to_dict(self):
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
            'profile_image': self.profile_image
        }

class Admin(db.Model):
    __tablename__ = 'admin'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username
        }

