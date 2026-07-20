# SEQUIP — Secondary Education Quality Improvement Project Dashboard (Tanzania)

![SEQUIP](images/coat_of_arms.jpeg)

## Overview

The **Secondary Education Quality Improvement Project (SEQUIP)** is a flagship Government of Tanzania initiative designed to expand access to secondary education, improve learning outcomes, and create safe, inclusive, and responsive learning environments for girls and boys across the country.

This repository hosts the interactive, responsive **SEQUIP Quality & Performance Tracking Dashboard**, built for the Ministry of Education, Science and Technology (MoEST) and the President’s Office – Regional Administration and Local Government (PO-RALG) with financial support from the World Bank.

---

## Site Map / Application Architecture

The dashboard is structured as a single-page application (SPA) with three main interactive layout tabs:

```text
SEQUIP Interactive Dashboard
│
├── 📁 Home Tab (National Performance Dashboard)
│   ├── 📊 National KPI Summary Cards
│   │   ├── Total Investment (TZS Billions) 💰
│   │   ├── Physical Assets / Infrastructure Built 🏠
│   │   ├── New Schools Established 🏫
│   │   └── STEM Teachers Trained 🎓
│   ├── 📈 National Cumulative Performance Charts
│   │   ├── Infrastructure Cumulative Targets vs. Achievements (Bar Chart)
│   │   ├── Alternative Education Pathways (AEP) Girls Enrolment Trends (Line Chart)
│   │   ├── Teacher Training & Resource Distribution (Radar Chart)
│   │   └── Safe School Program Milestones (Progress Cards)
│   └── 🏆 Regional NECTA Performance Leaderboard
│       └── Interactive Table with search, sorting, and pagination
│
├── 📁 Maps Tab (Geographical Project Footprint)
│   ├── 🗺️ Interactive GIS Choropleth Map (Leaflet.js)
│   │   ├── Density Map & Choropleth toggle overlay
│   │   ├── Girls' Science & Boarding Schools Centroid Pulse Markers
│   │   └── Dynamic Tooltips on region hover
│   ├── ⚙️ Custom Metrics Selector Button
│   │   └── Glassmorphic Popover Checklist (categorized into 6 areas, managing 26 indicators)
│   ├── 📑 Regional Stats Card Grid (Sidebar)
│   │   ├── Dynamic Rendering: Cards appear/disappear based on checked metrics
│   │   ├── Preservation: Selected cards are preserved when switching regions
│   │   └── Zoom-In Interaction: Click cards to expand, showing micro-data and insights
│   ├── 🔄 Compare Mode (Region vs. Region)
│   │   ├── Dual Sidebar: select two regions to compare side-by-side
│   │   └── Performance Metric Breakdown: comparative charts for checked indicators
│   └── 🏆 Performance-Based Conditions (PBCs) Achievement Tracker
│       ├── Component 1: Empowering Girls (PBCs 1-5 Progress)
│       ├── Component 2: Teacher & Quality Standards (PBCs 6-10 Progress)
│       └── Component 3: Safe Schools & Infrastructure (PBCs 11-12 Progress)
│
└── 📁 About Tab (Mandate & Governance)
    ├── 🏛️ Institutional Implementing Partners (MoEST & PO-RALG)
    ├── 🎯 Project Development Objectives (PDOs)
    └── 💵 Financial Scope & Donor Acknowledgements (World Bank IDA)
```

---

## Core Technical Architecture

The frontend is built using standard, lightweight web technologies optimized for high performance and compatibility:

1. **HTML5 Structure (`index.html`)**: Defines semantic containers for the national dashboard charts, the map section, the customizable statistics sidebar, and the three components of the PBC progress tracker.
2. **Dynamic Styling (`style.css`)**: Uses CSS custom variables (CSS variables) to support custom dark/light themes. Includes premium styling such as backdrop filters for glassmorphism, responsive single-column layouts for mobile viewports, and custom scrollbars.
3. **Reactive JavaScript Application (`app.js`)**:
   - **State Management**: Keeps track of `currentActiveTab`, `activeMapMetric`, `selectedRegionName`, `activeComparisonRegion`, and the list of checked dashboard cards.
   - **Leaflet Map Integration**: Performs interactive choropleth coloring, dynamic scaling boundaries based on regional metrics, and renders pulse markers.
   - **Dynamic Card Builder**: Renders region statistics cards dynamically as elements are selected in the checkboxes popover. Handles card-zoom detailing on click.

---

## Styling Design Tokens (`style.css`)

The look and feel of the website is built upon a modern, premium dark theme:
* **Background Color**: `var(--bg-primary)` (`#0f172a`, a deep dark navy slate).
* **Card Backdrops**: `rgba(30, 41, 59, 0.7)` with `backdrop-filter: blur(16px)` for a glassmorphism effect.
* **National Colors Accents**:
  - Green (`#00e676` / `var(--accent-green)`)
  - Gold (`#ffc107` / `var(--accent-gold)`)
  - Blue (`#29b6f6` / `var(--accent-blue)`)
* **Responsive Breakpoints**:
  - Mobile (up to `768px`): Columns collapse into vertical stacked structures. Sidebars sit underneath primary containers.
  - Large Screens (above `1024px`): Double columns and multi-column grid matrices.

---

## Detailed Data Dictionary (`data.js` and `district_data.csv`)

The data layer models mainland Tanzania's regions and districts across 26 distinct performance parameters:
- **Schools**: New secondary schools built, Ward-level schools, Girls-only science academies, Boys-only academies, and vocational learning facilities.
- **Teachers**: Counts of teachers trained in STEM fields and academic programs.
- **Classrooms**: Constructed classrooms, upgraded classrooms, science labs, dormitories, and latrines.
- **Resources**: Core textbooks distributed, computers, laptops, projectors, UPS backups, and smartboards.

---

## Getting Started

### Local Setup & Testing
1. Clone the repository:
   ```bash
   git clone https://github.com/sequipmoest/sequip_web.git
   cd sequip_web
   ```
2. Run a local web server (e.g. using Python's built-in HTTP server or VS Code's Live Server extension):
   ```bash
   python3 -m http.server 8005
   ```
3. Open your browser and navigate to `http://localhost:8005/`.

---

## Related Documentation
* [user_manual.md](user_manual.md) — Comprehensive guide on navigating layout options, interactives, and maps.
