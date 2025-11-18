#!/usr/bin/env python3
"""
Script de migração para adicionar a coluna 'language' na tabela profile
"""
import sqlite3
import os

def migrate_database():
    # Caminho do banco de dados
    db_path = os.path.join(os.path.dirname(__file__), 'src', 'database', 'app.db')
    
    # Verificar se o banco existe
    if not os.path.exists(db_path):
        print(f"⚠️ Banco de dados não encontrado em: {db_path}")
        print("O banco será criado automaticamente quando a aplicação iniciar.")
        return
    
    print(f"📁 Conectando ao banco de dados: {db_path}")
    
    try:
        # Conectar ao banco
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Verificar se a coluna já existe
        cursor.execute("PRAGMA table_info(profile)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'language' in columns:
            print("✅ Coluna 'language' já existe na tabela profile")
            conn.close()
            return
        
        print("🔄 Adicionando coluna 'language' na tabela profile...")
        
        # Adicionar a coluna language com valor padrão 'en'
        cursor.execute("""
            ALTER TABLE profile 
            ADD COLUMN language VARCHAR(2) NOT NULL DEFAULT 'en'
        """)
        
        conn.commit()
        print("✅ Migração concluída com sucesso!")
        print("🌍 Coluna 'language' adicionada com valor padrão 'en'")
        
        # Verificar a migração
        cursor.execute("PRAGMA table_info(profile)")
        columns = cursor.fetchall()
        print("\n📋 Estrutura atual da tabela profile:")
        for col in columns:
            print(f"  - {col[1]} ({col[2]})")
        
        conn.close()
        
    except sqlite3.Error as e:
        print(f"❌ Erro ao migrar banco de dados: {e}")
        raise

if __name__ == '__main__':
    migrate_database()
