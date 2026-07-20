# SEQUIP Interactive Dashboard — User Navigation Manual

Welcome to the official navigation manual for the **Secondary Education Quality Improvement Project (SEQUIP) Dashboard**. This guide explains every interactive element, button, and navigation flow across the platform.

---

## 1. Top Navigation Bar & Global Controls

At the very top of the screen is the official Ministry Header containing the project title, navigation tabs, and the theme switcher:

### Tab Navigation
* **Home Button (Layout Selector)**:
  - **Action**: Click the **Home** button in the header.
  - **Response**: The website loads the National Summary view containing KPI cards, cumulative performance charts, and the NECTA leaderboards.
* **Maps Button (Layout Selector)**:
  - **Action**: Click the **Maps** button in the header.
  - **Response**: The website transitions to the Geographical Explorer, loading the interactive Leaflet choropleth map, regional statistics sidebar, and the Performance-Based Conditions (PBCs) tracker.
* **About Button (Layout Selector)**:
  - **Action**: Click the **About** button in the header.
  - **Response**: The website loads the project overview page detailing the project objectives, implementing partners, and World Bank funding.

### Light/Dark Mode Switcher
* **Sun/Moon Toggle Icon**:
  - **Action**: Click the theme toggle icon (located next to the navigation buttons).
  - **Response**: The interface instantly switches between the dark theme and light theme, updating backgrounds, text colors, and glassmorphic card borders globally.

---

## 2. Home Tab: National Performance Dashboard

When the Home Tab is active, you can interact with the following elements:

### National KPI Summary Cards
- Located at the top of the Home layout.
- Hovering over a card applies a subtle 3D hover scale effect.
- The cards summarize:
  1. **Total Investment**: Displays total funding in TZS Billions with a colorful money bag emoji (`💰`).
  2. **Infrastructure Built**: Displays total classrooms, labs, and houses.
  3. **New Schools**: Displays count of established schools.
  4. **STEM Teachers Trained**: Displays the count of trained teachers.

### Interactive Performance Charts
- Built using native Javascript canvas charting:
  * **Hovering Chart Bars/Lines**: Hovering your cursor over bars (Infrastructure Targets) or line points (AEP Girls Enrolment Trends) displays an interactive tooltip showing precise numerical values and labels.

### Regional NECTA Performance Leaderboard
* **Search Bar**:
  - **Action**: Type a region name (e.g. "Mwanza", "Kagera") into the search box.
  - **Response**: The table filters rows in real-time, showing only matching regions.
* **Column Sorting**:
  - **Action**: Click on any table header (e.g., "Region Name", "Pass Rate (%)", "GPA").
  - **Response**: The table sorts rows in ascending or descending order.
* **Pagination Controls**:
  - **Action**: Click **Next**, **Previous**, or a page number link below the table.
  - **Response**: The table changes pages to reveal other regional records.

---

## 3. Maps Tab: Geographical Explorer

When the Maps Tab is active, you can access the geographical analysis features:

### Interactive GIS Map
* **Zoom Controls (+ / -)**:
  - **Action**: Click the `+` or `-` buttons at the top left of the map, or use your mouse scroll wheel.
  - **Response**: The map zooms in or out of specific regional boundaries.
* **Region Hover (Tooltip)**:
  - **Action**: Move your mouse pointer over any region on the map.
  - **Response**: The region's border is highlighted with a gold outline, and a floating tooltip displays the region name along with its active metric count.
* **Region Click (Sidebar Update)**:
  - **Action**: Click on a region (e.g. Dodoma, Morogoro).
  - **Response**: The map pans slightly to center the region, and the **Regional Statistics Sidebar** on the right side instantly updates to show the statistics for that specific region.
* **Active Metric Dropdown Selector**:
  - **Action**: Click the dropdown at the top center of the map.
  - **Response**: Opens a selection list. Choosing an item (e.g., *Classrooms Built*, *STEM Teachers Trained*) instantly updates the choropleth color shading based on the selected metric thresholds.
* **Density Map Toggle Button**:
  - **Action**: Click the **Density Map** toggle.
  - **Response**: Enables or disables the region-wide color shading.
* **Girls' Schools Toggle Button**:
  - **Action**: Click the **Girls' Schools** toggle.
  - **Response**: Toggles the visibility of green/gold pulse indicators indicating the locations of girls' science and boarding schools.
* **Reset View Button**:
  - **Action**: Click the **All Regions** button.
  - **Response**: Resets the map zoom level to fit mainland Tanzania's full geographical boundary.

### Choose Metrics popover (Sidebar Customizer)
* **Toggle Button**:
  - **Action**: Click **Choose Metrics to Display**.
  - **Response**: Opens a glassmorphic checklist panel overlay.
* **Selecting/Deselecting Indicators**:
  - **Action**: Check or uncheck individual boxes (e.g. *🏫 New Schools Built*, *💻 ICT Laptops*).
  - **Response**: The sidebar grid instantly adds or removes the corresponding statistic card.
* **Select All Links**:
  - **Action**: Click **Select All** inside the checklist panel.
  - **Response**: Checks all 26 indicators and renders all cards.
* **Clear Link**:
  - **Action**: Click **Clear** inside the checklist panel.
  - **Response**: Unchecks all boxes, hiding all statistics cards.
* **Outside Click Panel Dismissal**:
  - **Action**: Click anywhere outside the panel.
  - **Response**: Closes the checklist panel safely.

### Card Zoom Detail
* **Action**: Click on any statistic card in the sidebar.
  - **Response**: The card zooms in (scales up) with a smooth transition, displaying detailed micro-data and additional context for the selected indicator. Click again to minimize.

### Compare Mode
* **Action**: Check the **Compare Mode** checkbox in the sidebar.
  - **Response**: Splts the sidebar layout into a dual-column comparison view. Click a region on the map to load in Column A, then select another to load in Column B to compare stats side-by-side.

---

## 4. Performance-Based Conditions (PBCs) Tracker

Located directly below the geographical map:
* **Progress Tracking**:
  - **100% Progress**: Displays an emerald progress bar filled to the end, marked by a success emoji (e.g. `🎉`, `🏆`).
  - **Partial Progress**: Displays a golden progress bar filled to its respective percentage (e.g., `57%`), marked by a warning emoji (`🏗️`).
* **Components Layout**:
  - Automatically collapses into a single column on mobile screens to ensure the progress bars and labels wrap cleanly without clipping.
