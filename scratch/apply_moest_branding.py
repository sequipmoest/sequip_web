import re

# Read current files
with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# 1. Prepare Coat of Arms SVG String
coat_of_arms_svg = """<svg class="coat-of-arms-svg" viewBox="0 0 120 120" width="48" height="48" fill="none">
  <!-- Shield Outline -->
  <path d="M60 10 L95 28 V68 C95 88, 60 110, 60 110 C60 110, 25 88, 25 68 V28 Z" fill="#1e293b" stroke="#f59e0b" stroke-width="3"/>
  <!-- Uhuru Torch Flame -->
  <path d="M60 18 L64 30 H56 Z" fill="#f59e0b"/>
  <path d="M60 12 C63 9, 66 12, 60 18 C54 12, 57 9, 60 12 Z" fill="#ef4444"/>
  <!-- Diagonal National Colors Band -->
  <path d="M28 32 L92 32 L92 44 L28 44 Z" fill="#10b981"/>
  <path d="M28 44 L92 44 L92 50 L28 50 Z" fill="#f59e0b"/>
  <path d="M28 50 L92 50 L92 62 L28 62 Z" fill="#0f172a"/>
  <path d="M28 62 L92 62 L92 68 L28 68 Z" fill="#f59e0b"/>
  <path d="M28 68 L92 68 L60 102 Z" fill="#0284c7"/>
  <!-- Spear & Tools Emblem Center -->
  <circle cx="60" cy="56" r="6" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5"/>
  <!-- National Motto Ribbon Base -->
  <path d="M30 88 Q60 78 90 88 L94 94 Q60 84 26 94 Z" fill="#ffffff" stroke="#0f172a" stroke-width="1"/>
  <text x="60" y="91" font-size="5.5" font-weight="900" text-anchor="middle" fill="#0f172a" font-family="Arial, sans-serif">UHURU NA UMOJA</text>
</svg>"""

# 2. Extract Executive Summary and PBC Tracker cards (currently inside aboutView)
summary_cards_pattern = r'<!-- Global Executive Project Summary \(occupies full width\) -->.*?</div>\s*</div>\s*</div>'
match = re.search(summary_cards_pattern, html, re.DOTALL)
if not match:
    print("Error: Could not extract Executive Summary and PBC tracker cards.")
    exit(1)

extracted_summary_cards = match.group(0)

# 3. Construct the new Header with National Stripes and Coat of Arms
new_header = f"""    <!-- National Colors Accent Stripe (Green, Gold, Black, Blue) -->
    <div class="national-stripe-bar">
      <div class="stripe green"></div>
      <div class="stripe gold"></div>
      <div class="stripe black"></div>
      <div class="stripe blue"></div>
    </div>
    
    <!-- Official Ministry Header -->
    <header class="app-header">
      <div class="brand">
        <div class="brand-crest">
          {coat_of_arms_svg}
        </div>
        <div class="brand-text">
          <div class="gov-sub-title">THE UNITED REPUBLIC OF TANZANIA</div>
          <div class="gov-main-title">MINISTRY OF EDUCATION, SCIENCE AND TECHNOLOGY</div>
          <h1 class="project-app-title">Secondary Education Quality Improvement Project (SEQUIP)</h1>
        </div>
      </div>
      
      <div class="header-controls">
        <div class="layout-switcher">
          <button id="btnHomeLayout" class="switch-btn active">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
            Home
          </button>
          <button id="btnMapLayout" class="switch-btn">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
            Maps
          </button>
          <button id="btnAboutLayout" class="switch-btn">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            About
          </button>
        </div>
        
        <button id="themeToggleBtn" class="theme-toggle-btn" aria-label="Toggle Light/Dark Theme">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
        </button>
      </div>
    </header>"""

# 4. Construct the Official MoEST About Page View
official_about_html = """    <!-- View 3: Project Overview & About (Official MoEST Structure) -->
    <div id="aboutView" class="about-view-container" style="display: none;">
      
      <!-- Hero About Banner -->
      <div class="card about-hero-banner">
        <div class="about-banner-badge">Official Government Project Factsheet</div>
        <h2 class="about-hero-title">Secondary Education Quality Improvement Project (SEQUIP)</h2>
        <p class="about-hero-lead">
          SEQUIP is a US$ 535 Million landmark investment implemented by the <strong>Ministry of Education, Science and Technology (MoEST)</strong> in partnership with the <strong>President's Office – Regional Administration and Local Government (PO-RALG)</strong>, funded by the World Bank. The project aims to increase access to secondary education, create safe learning environments for girls, and improve completion rates of quality secondary education across mainland Tanzania.
        </p>
      </div>

      <!-- Project Development Objective & Key Pillars -->
      <div class="card about-section-card">
        <div class="card-header-bar">
          <h2 class="card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8M8 12h8"></path></svg>
            Project Development Objective (PDO)
          </h2>
        </div>
        <div class="pdo-content-grid">
          <div class="pdo-box">
            <div class="pdo-icon">🎯</div>
            <h3>Expand Access</h3>
            <p>Constructing over 800 new secondary schools to reduce travel distance for rural students in underserved communities.</p>
          </div>
          <div class="pdo-box">
            <div class="pdo-icon">👩‍🎓</div>
            <h3>Empower Girls</h3>
            <p>Creating safe, gender-sensitive school environments and Alternative Education Pathways (AEP) for young mothers.</p>
          </div>
          <div class="pdo-box">
            <div class="pdo-icon">💻</div>
            <h3>Quality & ICT</h3>
            <p>Equipping schools with modern ICT labs, smartboards, science facilities, and training 41,000+ STEM teachers.</p>
          </div>
        </div>
      </div>

      <!-- Core Project Components (4 Pillars Grid) -->
      <div class="card about-section-card">
        <div class="card-header-bar">
          <h2 class="card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            Core Project Components
          </h2>
        </div>
        
        <div class="components-grid">
          <!-- Component 1 -->
          <div class="component-card">
            <div class="comp-badge badge-green">Component 1</div>
            <h3>Empowering Girls Through Secondary Education</h3>
            <p>Focuses on creating safe learning environments for girls in secondary schools, providing school-based guidance and counseling, life skills training, and establishing <strong>Alternative Education Pathways (AEP)</strong> allowing out-of-school girls and young mothers to complete secondary education and sit for national exams.</p>
          </div>

          <!-- Component 2 -->
          <div class="component-card">
            <div class="comp-badge badge-blue">Component 2</div>
            <h3>Digitally Enabled Secondary Education & STEM Pedagogy</h3>
            <p>Enhances learning outcomes through digital technology integration and teacher professional development. Includes installing 1,800+ computers, smartboards, projectors, fully equipped science laboratories, and training over 41,000 teachers in modern digital pedagogy and core STEM subjects.</p>
          </div>

          <!-- Component 3 -->
          <div class="component-card">
            <div class="comp-badge badge-gold">Component 3</div>
            <h3>Reducing Barriers to Secondary Education (Infrastructure)</h3>
            <p>Finances physical infrastructure expansion to address overcrowding and long distances to school. Key targets include building 798+ New Ward Secondary Schools, 26 Specialized Regional Girls' Science Boarding Schools, dormitories, administration blocks, and over 3,100 pit latrines.</p>
          </div>

          <!-- Component 4 -->
          <div class="component-card">
            <div class="comp-badge badge-purple">Component 4</div>
            <h3>Project Management, Monitoring & Evaluation</h3>
            <p>Supports project management, technical assistance, institutional capacity strengthening for MoEST and PO-RALG, and rigorous M&E tracking. Operates under an Investment Project Financing (IPF) model with 12 Performance-Based Conditions (PBCs) linked to disbursement.</p>
          </div>
        </div>
      </div>

      <!-- Institutional Governance & Lead Agencies -->
      <div class="card about-section-card">
        <div class="card-header-bar">
          <h2 class="card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Institutional Implementation Architecture
          </h2>
        </div>
        <div class="governance-grid">
          <div class="agency-box">
            <div class="agency-header">
              <span class="agency-tag">Lead Policy & Quality Agency</span>
              <h4>Ministry of Education, Science and Technology (MoEST)</h4>
            </div>
            <p>Responsible for overall project coordination, curriculum development, teacher training standards, quality assurance, and national examinations oversight.</p>
          </div>
          <div class="agency-box">
            <div class="agency-header">
              <span class="agency-tag">Local Execution Agency</span>
              <h4>President's Office – Regional Administration & Local Government (PO-RALG)</h4>
            </div>
            <p>Responsible for ground-level school construction, regional infrastructure supervision, council management, and school-level operational maintenance across 26 regions.</p>
          </div>
        </div>
      </div>

    </div>"""

# 5. Construct Official Ministry Footer
official_footer_html = f"""    <!-- Official Ministry Footer -->
    <footer class="app-footer">
      <div class="footer-stripe">
        <div class="stripe green"></div>
        <div class="stripe gold"></div>
        <div class="stripe black"></div>
        <div class="stripe blue"></div>
      </div>
      <div class="footer-content">
        <div class="footer-col brand-col">
          <div class="footer-brand-header">
            {coat_of_arms_svg}
            <div>
              <div class="footer-gov-sub">THE UNITED REPUBLIC OF TANZANIA</div>
              <div class="footer-gov-title">MINISTRY OF EDUCATION, SCIENCE AND TECHNOLOGY</div>
            </div>
          </div>
          <p class="footer-desc">
            Secondary Education Quality Improvement Project (SEQUIP) Monitoring & Evaluation GIS Dashboard. Empowering secondary education transformation across Tanzania mainland.
          </p>
        </div>

        <div class="footer-col contact-col">
          <h4>Wasiliana Nasi (Contact Us)</h4>
          <ul class="contact-list">
            <li>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>Katibu Mkuu, Mji wa Serikali Mtumba - Mtaa wa Afya, S.L.P 1040, 40479 Dodoma, Tanzania</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              <span>+255 26 2963533 / +255 26 2963534</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <span>info@moe.go.tz / sequip@moe.go.tz</span>
            </li>
          </ul>
        </div>

        <div class="footer-col links-col">
          <h4>Viunganishi Maarufu (Popular Links)</h4>
          <ul class="footer-links">
            <li><a href="https://www.ikulu.go.tz" target="_blank" rel="noopener">Ikulu Tanzania (State House)</a></li>
            <li><a href="https://www.tanzania.go.tz" target="_blank" rel="noopener">Tovuti Kuu ya Serikali (Government Portal)</a></li>
            <li><a href="https://www.moe.go.tz" target="_blank" rel="noopener">Wizara ya Elimu (MoEST Portal)</a></li>
            <li><a href="https://www.tamisemi.go.tz" target="_blank" rel="noopener">PO-RALG (TAMISEMI)</a></li>
            <li><a href="https://www.necta.go.tz" target="_blank" rel="noopener">Baraza la Mitihani (NECTA)</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <div>&copy; 2026 Ministry of Education, Science and Technology (MoEST) &mdash; United Republic of Tanzania. All Rights Reserved.</div>
      </div>
    </footer>"""

# Now assemble full index.html
# Replace header block
header_pattern = r'<!-- Header -->.*?<header class="app-header">.*?</header>'
html = re.sub(header_pattern, new_header, html, flags=re.DOTALL)

# Replace aboutView block with the new official About View
about_view_pattern = r'<div id="aboutView" class="about-view-container".*?</div>\s*</div>\s*</div>'
html = re.sub(about_view_pattern, official_about_html, html, flags=re.DOTALL)

# Place the extracted Executive Summary and PBC tracker cards at the top of heroView (Home page)
hero_view_pattern = r'<div id="heroView" class="hero-view-container">'
replacement_hero = f'<div id="heroView" class="hero-view-container">\n      {extracted_summary_cards}\n'
html = re.sub(hero_view_pattern, replacement_hero, html, flags=re.DOTALL, count=1)

# Append footer before </div></div> <!-- app-container --> or </body>
if "</footer" not in html:
    html = html.replace("</div>\n\n  <!-- Chart.js", f"{official_footer_html}\n\n  </div>\n\n  <!-- Chart.js", 1)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)

print("Success: Updated index.html with Coat of Arms, restored Home cards, official About page, and Ministry Footer.")
