#!/usr/bin/env python3
"""
Script para gerar thumbnails das imagens existentes no banco de dados
"""

import os
import sys
from PIL import Image

# Adicionar diretório src ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from main import app
from models.profile import db, Profile

STATIC_FOLDER = 'src/static'
UPLOAD_FOLDER = os.path.join(STATIC_FOLDER, 'uploads')

def generate_thumbnail(image_path, thumbnail_path, size=(50, 50), quality=60):
    """
    Gera thumbnail otimizado de uma imagem
    
    Args:
        image_path: Caminho da imagem original
        thumbnail_path: Caminho onde salvar o thumbnail
        size: Tamanho máximo do thumbnail (largura, altura)
        quality: Qualidade da compressão (1-100)
    """
    try:
        with Image.open(image_path) as img:
            # Converter para RGB se necessário (para salvar como JPEG)
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            
            # Redimensionar mantendo proporção
            img.thumbnail(size, Image.Resampling.LANCZOS)
            
            # Salvar com compressão otimizada
            img.save(thumbnail_path, 'JPEG', quality=quality, optimize=True)
            return True
    except Exception as e:
        print(f"❌ Erro ao gerar thumbnail: {e}")
        return False

def generate_thumbnails_for_existing_images():
    """Gera thumbnails para todas as imagens existentes no banco"""
    
    with app.app_context():
        profiles = Profile.query.all()
        
        print(f"🔍 Encontrados {len(profiles)} perfis")
        print("=" * 60)
        
        for profile in profiles:
            print(f"\n📋 Processando perfil: {profile.username}")
            
            # Processar banner
            if profile.banner_image and profile.banner_image != 'baneronly.png':
                banner_path = os.path.join(STATIC_FOLDER, profile.banner_image)
                
                if os.path.exists(banner_path):
                    # Gerar nome do thumbnail
                    banner_name = os.path.basename(profile.banner_image)
                    thumbnail_name = f"thumb_{banner_name.rsplit('.', 1)[0]}.jpg"
                    thumbnail_path = os.path.join(UPLOAD_FOLDER, thumbnail_name)
                    
                    print(f"  🖼️  Banner: {profile.banner_image}")
                    
                    if generate_thumbnail(banner_path, thumbnail_path):
                        profile.banner_thumbnail = f"uploads/{thumbnail_name}"
                        print(f"  ✅ Thumbnail gerado: {thumbnail_name}")
                    else:
                        print(f"  ❌ Falha ao gerar thumbnail")
                else:
                    print(f"  ⚠️  Banner não encontrado: {banner_path}")
            
            # Processar profile image
            if profile.profile_image and profile.profile_image != 'perfil.png':
                profile_path = os.path.join(STATIC_FOLDER, profile.profile_image)
                
                if os.path.exists(profile_path):
                    # Gerar nome do thumbnail
                    profile_name = os.path.basename(profile.profile_image)
                    thumbnail_name = f"thumb_{profile_name.rsplit('.', 1)[0]}.jpg"
                    thumbnail_path = os.path.join(UPLOAD_FOLDER, thumbnail_name)
                    
                    print(f"  👤 Profile: {profile.profile_image}")
                    
                    if generate_thumbnail(profile_path, thumbnail_path):
                        profile.profile_thumbnail = f"uploads/{thumbnail_name}"
                        print(f"  ✅ Thumbnail gerado: {thumbnail_name}")
                    else:
                        print(f"  ❌ Falha ao gerar thumbnail")
                else:
                    print(f"  ⚠️  Profile image não encontrada: {profile_path}")
        
        # Salvar alterações no banco
        try:
            db.session.commit()
            print("\n" + "=" * 60)
            print("✅ Thumbnails gerados e banco de dados atualizado!")
        except Exception as e:
            db.session.rollback()
            print(f"\n❌ Erro ao salvar no banco: {e}")

if __name__ == '__main__':
    print("🚀 Iniciando geração de thumbnails...")
    print("=" * 60)
    
    # Criar pasta de uploads se não existir
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    
    generate_thumbnails_for_existing_images()
    
    print("\n🎉 Processo concluído!")
