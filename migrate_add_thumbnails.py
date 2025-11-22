#!/usr/bin/env python3
"""
Script de migração para adicionar campos de thumbnails e gerar thumbnails de imagens existentes
Executa automaticamente no deploy via entrypoint.sh
"""

import os
import sys
import sqlite3
from PIL import Image

# Configurações
DB_PATH = os.environ.get('DATABASE_PATH', 'src/database/app.db')
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
        print(f"⚠️  Erro ao gerar thumbnail: {e}")
        return False

def migrate_database():
    """Adiciona colunas de thumbnails se não existirem"""
    
    print("🔍 Verificando estrutura do banco de dados...")
    
    # Verificar se banco existe
    if not os.path.exists(DB_PATH):
        print(f"⚠️  Banco de dados não encontrado: {DB_PATH}")
        print("   Será criado automaticamente pelo Flask")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Verificar se tabela profile existe
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='profile'")
        if not cursor.fetchone():
            print("⚠️  Tabela 'profile' não existe ainda")
            print("   Será criada automaticamente pelo Flask")
            conn.close()
            return
        
        # Verificar se colunas já existem
        cursor.execute("PRAGMA table_info(profile)")
        columns = [row[1] for row in cursor.fetchall()]
        
        needs_migration = False
        
        # Adicionar banner_thumbnail se não existir
        if 'banner_thumbnail' not in columns:
            print("➕ Adicionando coluna 'banner_thumbnail'...")
            cursor.execute("ALTER TABLE profile ADD COLUMN banner_thumbnail VARCHAR(200)")
            needs_migration = True
        else:
            print("✅ Coluna 'banner_thumbnail' já existe")
        
        # Adicionar profile_thumbnail se não existir
        if 'profile_thumbnail' not in columns:
            print("➕ Adicionando coluna 'profile_thumbnail'...")
            cursor.execute("ALTER TABLE profile ADD COLUMN profile_thumbnail VARCHAR(200)")
            needs_migration = True
        else:
            print("✅ Coluna 'profile_thumbnail' já existe")
        
        if needs_migration:
            conn.commit()
            print("✅ Migração do banco de dados concluída!")
        else:
            print("✅ Banco de dados já está atualizado")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Erro na migração: {e}")
        raise
    finally:
        conn.close()

def generate_thumbnails_for_existing_images():
    """Gera thumbnails para todas as imagens existentes no banco"""
    
    print("\n🖼️  Verificando imagens existentes...")
    
    # Verificar se banco existe
    if not os.path.exists(DB_PATH):
        print("⚠️  Banco de dados não encontrado, pulando geração de thumbnails")
        return
    
    # Criar pasta de uploads se não existir
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Verificar se tabela existe
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='profile'")
        if not cursor.fetchone():
            print("⚠️  Tabela 'profile' não existe, pulando geração de thumbnails")
            conn.close()
            return
        
        # Buscar perfis que têm imagens mas não têm thumbnails
        cursor.execute("""
            SELECT id, username, banner_image, profile_image, banner_thumbnail, profile_thumbnail 
            FROM profile 
            WHERE (banner_image IS NOT NULL AND banner_image != '' AND banner_image != 'baneronly.png')
               OR (profile_image IS NOT NULL AND profile_image != '' AND profile_image != 'perfil.png')
        """)
        profiles = cursor.fetchall()
        
        if not profiles:
            print("✅ Nenhuma imagem para processar")
            conn.close()
            return
        
        print(f"📋 Encontrados {len(profiles)} perfis com imagens")
        
        thumbnails_generated = 0
        
        for profile_id, username, banner_image, profile_image, banner_thumbnail, profile_thumbnail in profiles:
            # Processar banner se não tiver thumbnail
            if banner_image and banner_image not in ('', 'baneronly.png') and not banner_thumbnail:
                banner_path = os.path.join(STATIC_FOLDER, banner_image)
                
                if os.path.exists(banner_path):
                    banner_name = os.path.basename(banner_image)
                    thumbnail_name = f"thumb_{banner_name.rsplit('.', 1)[0]}.jpg"
                    thumbnail_path = os.path.join(UPLOAD_FOLDER, thumbnail_name)
                    
                    if generate_thumbnail(banner_path, thumbnail_path):
                        cursor.execute(
                            "UPDATE profile SET banner_thumbnail = ? WHERE id = ?",
                            (f"uploads/{thumbnail_name}", profile_id)
                        )
                        print(f"  ✅ Banner thumbnail: {username}")
                        thumbnails_generated += 1
            
            # Processar profile image se não tiver thumbnail
            if profile_image and profile_image not in ('', 'perfil.png') and not profile_thumbnail:
                profile_path = os.path.join(STATIC_FOLDER, profile_image)
                
                if os.path.exists(profile_path):
                    profile_name = os.path.basename(profile_image)
                    thumbnail_name = f"thumb_{profile_name.rsplit('.', 1)[0]}.jpg"
                    thumbnail_path = os.path.join(UPLOAD_FOLDER, thumbnail_name)
                    
                    if generate_thumbnail(profile_path, thumbnail_path):
                        cursor.execute(
                            "UPDATE profile SET profile_thumbnail = ? WHERE id = ?",
                            (f"uploads/{thumbnail_name}", profile_id)
                        )
                        print(f"  ✅ Profile thumbnail: {username}")
                        thumbnails_generated += 1
        
        if thumbnails_generated > 0:
            conn.commit()
            print(f"\n✅ {thumbnails_generated} thumbnails gerados com sucesso!")
        else:
            print("✅ Todos os thumbnails já existem")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Erro ao gerar thumbnails: {e}")
    finally:
        conn.close()

def main():
    """Executa migração completa"""
    print("=" * 60)
    print("🚀 Iniciando migração de thumbnails...")
    print("=" * 60)
    
    try:
        # Passo 1: Migrar banco de dados
        migrate_database()
        
        # Passo 2: Gerar thumbnails para imagens existentes
        generate_thumbnails_for_existing_images()
        
        print("\n" + "=" * 60)
        print("🎉 Migração concluída com sucesso!")
        print("=" * 60)
        
    except Exception as e:
        print("\n" + "=" * 60)
        print(f"❌ Erro na migração: {e}")
        print("=" * 60)
        sys.exit(1)

if __name__ == '__main__':
    main()
