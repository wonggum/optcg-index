# Sitemap Generation

## Current Structure

The sitemap has been converted from a single monolithic file to a **sitemap index** structure for better scalability and GitHub Pages reliability.

### Files

- **`sitemap.xml`** — Sitemap index (577 bytes) that points to 4 chunked sitemaps
- **`sitemap-1.xml`** — First 1,000 URLs (~200KB)
- **`sitemap-2.xml`** — Next 1,000 URLs (~200KB)
- **`sitemap-3.xml`** — Next 1,000 URLs (~200KB)
- **`sitemap-4.xml`** — Remaining 101 URLs (~21KB)

### Total Coverage

- **3,101 URLs** across all chunks
- Includes: home, cards, sets, characters, guides, terms, privacy, and the new `/pro/` page

## Why This Approach?

1. **Scalability**: The original 484KB sitemap was approaching GitHub Pages limits. Chunked sitemaps can each hold up to 50,000 URLs (we're using 1,000 per chunk for safety).
2. **Reliability**: Smaller files are less likely to timeout or fail on GitHub Pages.
3. **Standards Compliant**: Sitemap index structure is supported by all major search engines.

## How to Regenerate

When the site structure changes (new pages, cards, guides, etc.), regenerate the sitemap using Python:

```bash
cd /workspace

python3 << 'PYEOF'
import xml.etree.ElementTree as ET
from datetime import datetime

# Parse existing sitemap (if it's still an index, you'd need to parse all chunks first)
# For a fresh generation, build the URL list from your site structure

urls = []
# Add your URLs here programmatically, e.g.:
# urls.append({
#     'loc': 'https://wonggum.github.io/optcg-index/',
#     'lastmod': '2026-10-04',
#     'changefreq': 'hourly',
#     'priority': '1.0'
# })

# Chunk into groups of 1000
chunk_size = 1000
chunks = [urls[i:i+chunk_size] for i in range(0, len(urls), chunk_size)]

# Generate sitemap-N.xml files
for idx, chunk in enumerate(chunks, 1):
    urlset = ET.Element('urlset')
    urlset.set('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
    
    for url_data in chunk:
        url_elem = ET.SubElement(urlset, 'url')
        loc = ET.SubElement(url_elem, 'loc')
        loc.text = url_data['loc']
        lastmod = ET.SubElement(url_elem, 'lastmod')
        lastmod.text = url_data['lastmod']
        changefreq = ET.SubElement(url_elem, 'changefreq')
        changefreq.text = url_data['changefreq']
        priority = ET.SubElement(url_elem, 'priority')
        priority.text = url_data['priority']
    
    tree = ET.ElementTree(urlset)
    ET.indent(tree, space='', level=0)
    with open(f'sitemap-{idx}.xml', 'wb') as f:
        f.write(b'<?xml version="1.0" encoding="UTF-8"?>\n')
        tree.write(f, encoding='UTF-8', xml_declaration=False)

# Generate sitemap.xml (index)
sitemapindex = ET.Element('sitemapindex')
sitemapindex.set('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')

today = datetime.now().strftime('%Y-%m-%d')
base_url = 'https://wonggum.github.io/optcg-index/'

for idx in range(1, len(chunks) + 1):
    sitemap_elem = ET.SubElement(sitemapindex, 'sitemap')
    loc = ET.SubElement(sitemap_elem, 'loc')
    loc.text = f'{base_url}sitemap-{idx}.xml'
    lastmod = ET.SubElement(sitemap_elem, 'lastmod')
    lastmod.text = today

tree = ET.ElementTree(sitemapindex)
ET.indent(tree, space='', level=0)
with open('sitemap.xml', 'wb') as f:
    f.write(b'<?xml version="1.0" encoding="UTF-8"?>\n')
    tree.write(f, encoding='UTF-8', xml_declaration=False)
PYEOF
```

## Validation

After regeneration, validate the sitemap:

```bash
# Check sitemap index
curl -I https://wonggum.github.io/optcg-index/sitemap.xml

# Check individual chunks
curl -I https://wonggum.github.io/optcg-index/sitemap-1.xml
curl -I https://wonggum.github.io/optcg-index/sitemap-2.xml

# Validate XML structure
xmllint --noout sitemap.xml sitemap-*.xml
```

## robots.txt

The `robots.txt` file points to the sitemap index:

```
User-agent: *
Allow: /
Sitemap: https://wonggum.github.io/optcg-index/sitemap.xml
```

Search engines will automatically discover and crawl all chunked sitemaps from the index.

## Notes

- The sitemap index should remain small (< 10MB per spec, ours is < 1KB).
- Each chunk can contain up to 50,000 URLs or be up to 50MB uncompressed.
- Currently using 1,000 URLs per chunk, leaving plenty of room for growth.
- Last generated: 2026-10-04
