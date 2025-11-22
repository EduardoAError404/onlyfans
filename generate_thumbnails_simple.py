#!/usr/bin/env python3
"""
Script simplificado para gerar thumbnails das imagens existentes
"""

import os
import sqlite3
from PIL import Image

STATIC_FOLDER = 'src/static'
UPLOAD_FOLDER = os.path.join(STATIC_FOLDER, 'uploads')
DB_PATH = 'database.db'

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
    
    # Conectar ao banco de dados
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Buscar todos os perfis
    cursor.execute("SELECT id, username, banner_image, profile_image FROM profile")
    profiles = cursor.fetchall()
    
    print(f"🔍 Encontrados {len(profiles)} perfis")
    print("=" * 60)
    
    for profile_id, username, banner_image, profile_image in profiles:
        print(f"\n📋 Processando perfil: {username}")
        
        banner_thumbnail = None
        profile_thumbnail = None
        
        # Processar banner
        if banner_image and banner_image != 'baneronly.png':
            banner_path = os.path.join(STATIC_FOLDER, banner_image)
            
            if os.path.exists(banner_path):
                # Gerar nome do thumbnail
                banner_name = os.path.basename(banner_image)
                thumbnail_name = f"thumb_{banner_name.rsplit('.', 1)[0]}.jpg"
                thumbnail_path = os.path.join(UPLOAD_FOLDER, thumbnail_name)
                
                print(f"  🖼️  Banner: {banner_image}")
                
                if generate_thumbnail(banner_path, thumbnail_path):
                    banner_thumbnail = f"uploads/{thumbnail_name}"
                    print(f"  ✅ Thumbnail gerado: {thumbnail_name}")
                else:
                    print(f"  ❌ Falha ao gerar thumbnail")
            else:
                print(f"  ⚠️  Banner não encontrado: {banner_path}")
        
        # Processar profile image
        if profile_image and profile_image != 'perfil.png':
            profile_path = os.path.join(STATIC_FOLDER, profile_image)
            
            if os.path.exists(profile_path):
                # Gerar nome do thumbnail
                profile_name = os.path.basename(profile_image)
                thumbnail_name = f"thumb_{profile_name.rsplit('.', 1)[0]}.jpg"
                thumbnail_path = os.path.join(UPLOAD_FOLDER, thumbnail_name)
                
                print(f"  👤 Profile: {profile_image}")
                
                if generate_thumbnail(profile_path, thumbnail_path):
                    profile_thumbnail = f"uploads/{thumbnail_name}"
                    print(f"  ✅ Thumbnail gerado: {thumbnail_name}")
                else:
                    print(f"  ❌ Falha ao gerar thumbnail")
            else:
                print(f"  ⚠️  Profile image não encontrada: {profile_path}")
        
        # Atualizar banco de dados
        if banner_thumbnail or profile_thumbnail:
            update_parts = []
            params = []
            
            if banner_thumbnail:
                update_parts.append("banner_thumbnail = ?")
                params.append(banner_thumbnail)
            
            if profile_thumbnail:
                update_parts.append("profile_thumbnail = ?")
                params.append(profile_thumbnail)
            
            params.append(profile_id)
            
            query = f"UPDATE profile SET {', '.join(update_parts)} WHERE id = ?"
            cursor.execute(query, params)
    
    # Salvar alterações
    try:
        conn.commit()
        print("\n" + "=" * 60)
        print("✅ Thumbnails gerados e banco de dados atualizado!")
    except Exception as e:
        conn.rollback()
        print(f"\n❌ Erro ao salvar no banco: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    print("🚀 Iniciando geração de thumbnails...")
    print("=" * 60)
    
    # Criar pasta de uploads se não existir
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    
    # Verificar se banco existe
    if not os.path.exists(DB_PATH):
        print(f"❌ Banco de dados não encontrado: {DB_PATH}")
        exit(1)
    
    generate_thumbnails_for_existing_images()
    
    print("\n🎉 Processo concluído!")
