import re

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# Replace SVG in header and footer with <img src="images/coat_of_arms.jpeg">
svg_pattern = r'<svg class="coat-of-arms-svg".*?</svg>'
img_tag = '<img src="images/coat_of_arms.jpeg" alt="Coat of Arms of Tanzania" class="coat-of-arms-img">'

new_html = re.sub(svg_pattern, img_tag, html, flags=re.DOTALL)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(new_html)

print("Success: Replaced Coat of Arms SVG with images/coat_of_arms.jpeg in index.html.")

# Update style.css
with open("style.css", "r", encoding="utf-8") as f:
    css = f.read()

coat_img_css = """
/* Coat of Arms Image Styling */
.coat-of-arms-img {
  height: 52px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
}

.brand-crest {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  padding: 0;
  border: none;
}
"""

if ".coat-of-arms-img" not in css:
    css += coat_img_css
    with open("style.css", "w", encoding="utf-8") as f:
        f.write(css)
    print("Success: Appended .coat-of-arms-img styles to style.css.")
else:
    print("Styles for .coat-of-arms-img already exist.")
