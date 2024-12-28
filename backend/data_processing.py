import pandas as pd

# Yazar ID'si atamak için global sayaç
author_id_counter = 1

def read_excel_and_parse(file_path):
    # Excel dosyasını oku
    data = pd.read_excel(file_path)
    
    # Yazar ID'si eşlemesi için bir sözlük
    author_id_map = {}
    
    # Yazarlar ve makaleler listesini oluştur
    authors = []
    articles = []
    
    for _, row in data.iterrows():
        title = row['Makale Adı']
        doi = row['DOI']
        co_authors = row['Yazarlar'].split(",")  # Yazarları virgülle ayır
        
        article_authors = []
        for author in co_authors:
            author = author.strip()  # Gereksiz boşlukları kaldır
            
            # Eğer yazar ID'si henüz atanmamışsa yeni bir ID ata
            if author not in author_id_map:
                global author_id_counter
                author_id_map[author] = author_id_counter
                author_id_counter += 1
            
            article_authors.append(author_id_map[author])
        
        # Makale bilgilerini ekle
        articles.append({
            'title': title,
            'doi': doi,
            'authors': article_authors
        })
    
    return author_id_map, articles

# Test için
file_path = '..\dataset.xlsx'  # Excel dosyanızın yolu
author_id_map, articles = read_excel_and_parse(file_path)

# Sonuçları kontrol et
print("Yazar ID Eşlemesi:", author_id_map)
print("Makaleler:", articles)
