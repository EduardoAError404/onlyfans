#!/usr/bin/env python3
import re

# Ler o arquivo HTML
with open('src/static/index_final_corrigido.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Mapeamento de textos para chaves i18n
replacements = [
    # UI - Interface Geral
    (r'We use cookies to run this website\. See our', 'We use cookies to run this website. See our', 'ui.cookies'),
    (r'>Cookie Notice<', '>Cookie Notice<', 'ui.cookieNotice'),
    (r'>Only Necessary Cookies<', '>Only Necessary Cookies<', 'ui.onlyNecessary'),
    (r'>Accept All<', '>Accept All<', 'ui.acceptAll'),
    (r'>Help and support<', '>Help and support<', 'ui.helpSupport'),
    (r'>Dark mode<', '>Dark mode<', 'ui.darkMode'),
    (r'>Login<', '>Login<', 'ui.login'),
    (r'>Home<', '>Home<', 'ui.home'),
    
    # Profile - Perfil
    (r'>Available now<', '>Available now<', 'profile.availableNow'),
    (r'>More info<', '>More info<', 'profile.moreInfo'),
    
    # Subscription - Assinatura
    (r'>Subscription<', '>Subscription<', 'subscription.title'),
    (r'>Subscribe<', '>Subscribe<', 'subscription.subscribe'),
    (r'>per month<', '>per month<', 'subscription.perMonth'),
    (r'>Subscription bundles<', '>Subscription bundles<', 'subscription.bundles'),
    (r'>6 months<', '>6 months<', 'subscription.sixMonths'),
    (r'>12 months<', '>12 months<', 'subscription.twelveMonths'),
    (r'>\(20% OFF\)<', '>(20% OFF)<', 'subscription.discount20'),
    (r'>\(35% OFF\)<', '>(35% OFF)<', 'subscription.discount35'),
    (r'>total<', '>total<', 'subscription.total'),
    (r">Subscribe to see user's posts<", ">Subscribe to see user's posts<", 'subscription.subscribeToSee'),
    
    # Content - Conteúdo
    (r'>SUBSCRIBE<', '>SUBSCRIBE<', 'content.subscribeNow'),
    (r'>NOW<', '>NOW<', 'content.now'),
    (r'>= WIN A HUGE<', '>= WIN A HUGE<', 'content.winHuge'),
    (r'>GIFT<', '>GIFT<', 'content.gift'),
    (r'>! \(REAL!\)<', '>! (REAL!)<', 'content.real'),
]

print("🔧 Aplicando substituições...")
count = 0

for pattern, text, i18n_key in replacements:
    # Procurar padrões sem data-i18n
    matches = re.findall(pattern, html)
    if matches:
        # Adicionar data-i18n
        html = re.sub(
            f'(<[^>]+)({re.escape(text)})',
            f'\\1 data-i18n="{i18n_key}">\\2',
            html
        )
        count += len(matches)
        print(f"✅ {len(matches)}x '{text}' → data-i18n=\"{i18n_key}\"")

# Salvar arquivo modificado
with open('src/static/index_final_with_i18n.html', 'w', encoding='utf-8') as f:
    f.write(html)

print(f"\n✅ Total de {count} atributos data-i18n adicionados!")
print(f"📄 Arquivo salvo: src/static/index_final_with_i18n.html")
