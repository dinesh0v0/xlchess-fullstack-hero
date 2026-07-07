import re
import sys

def replace_colors(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Brand Colors
    content = content.replace('#050B1D', '#0a0a0a')
    content = content.replace('#030915', '#0a0a0a')
    content = content.replace('#080e20', '#141414')
    content = content.replace('#0B1628', '#141414')
    content = content.replace('#090F1D', '#0f0f0f')
    content = content.replace('#090F1E', '#0f0f0f')
    content = content.replace('#0F1C33', '#1f1f1f')
    
    content = content.replace('#1A2744', '#2e2e2e')
    
    content = content.replace('#6e63f6', '#d4af37')
    content = content.replace('#5B6EF5', '#d4af37')
    content = content.replace('#8B7FFD', '#fcd34d')
    content = content.replace('#a58fff', '#fde68a')
    content = content.replace('#7b6dff', '#fde68a')
    
    # Board Colors
    content = content.replace('#E8EDC8', '#e0e0e0')
    content = content.replace('#779556', '#4a4a4a')
    content = content.replace('#F5F682', '#fcd34d')
    content = content.replace('#CDD16E', '#d4af37')
    content = content.replace('#F5E882', '#fcd34d')
    
    # Text colors
    content = content.replace('#8899B4', '#a3a3a3')
    
    # Glow/Shadow Colors
    content = content.replace('rgba(110,99,246,0.1)', 'rgba(212,175,55,0.1)')
    content = content.replace('rgba(245,246,130,0.85)', 'rgba(252,211,77,0.85)')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
if __name__ == "__main__":
    replace_colors(sys.argv[1])
