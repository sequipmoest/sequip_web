from html.parser import HTMLParser

class TagChecker(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.errors = []
        
    def handle_starttag(self, tag, attrs):
        # Ignore self-closing tags in HTML
        if tag in ["img", "input", "br", "hr", "meta", "link", "circle", "rect", "path", "polygon", "polyline", "line"]:
            return
        self.stack.append((tag, self.getpos()))
        
    def handle_endtag(self, tag):
        if tag in ["img", "input", "br", "hr", "meta", "link", "circle", "rect", "path", "polygon", "polyline", "line"]:
            return
        if not self.stack:
            self.errors.append(f"Unexpected closing tag: </{tag}> at line {self.getpos()[0]}")
            return
        expected_tag, pos = self.stack.pop()
        if expected_tag != tag:
            self.errors.append(f"Mismatched tag: expected </{expected_tag}> (opened at line {pos[0]}), but found </{tag}> at line {self.getpos()[0]}")
            # Put back to keep stack aligned if possible
            self.stack.append((expected_tag, pos))

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

checker = TagChecker()
checker.feed(html)

print("HTML Tag Validation Report:")
if checker.errors:
    for err in checker.errors:
        print("Error:", err)
else:
    print("No mismatched tags found.")
    
if checker.stack:
    print("Unclosed tags remaining on stack:")
    for tag, pos in reversed(checker.stack):
        print(f"Tag <{tag}> opened at line {pos[0]} is never closed.")
