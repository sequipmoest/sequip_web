from html.parser import HTMLParser

class ErrorOnlyTagChecker(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.errors = []
        
    def handle_starttag(self, tag, attrs):
        if tag in ["img", "input", "br", "hr", "meta", "link", "circle", "rect", "path", "polygon", "polyline", "line"]:
            return
        attrs_dict = dict(attrs)
        tag_id = attrs_dict.get("id", "")
        tag_class = attrs_dict.get("class", "")
        desc = tag
        if tag_id:
            desc += f"#{tag_id}"
        if tag_class:
            desc += f".{tag_class.replace(' ', '.')}"
        self.stack.append((desc, self.getpos()))
        
    def handle_endtag(self, tag):
        if tag in ["img", "input", "br", "hr", "meta", "link", "circle", "rect", "path", "polygon", "polyline", "line"]:
            return
        if not self.stack:
            self.errors.append(f"Unexpected closing tag </{tag}> at line {self.getpos()[0]}")
            return
        expected_desc, pos = self.stack.pop()
        expected_tag = expected_desc.split("#")[0].split(".")[0]
        if expected_tag != tag:
            self.errors.append(f"Mismatched tag: expected </{expected_tag}> (from <{expected_desc}> opened at line {pos[0]}), but found </{tag}> at line {self.getpos()[0]}")
            self.stack.append((expected_desc, pos))

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

checker = ErrorOnlyTagChecker()
checker.feed(html)

print("HTML validation errors found:")
for err in checker.errors:
    print(err)

if checker.stack:
    print("\nUnclosed tags remaining on stack:")
    for desc, pos in reversed(checker.stack):
        print(f"<{desc}> opened at line {pos[0]} is never closed.")
