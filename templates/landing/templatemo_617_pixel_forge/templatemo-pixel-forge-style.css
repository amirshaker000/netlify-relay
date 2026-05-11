/*

TemplateMo 617 Pixel Forge
https://templatemo.com/tm-617-pixel-forge

*/

:root {
    --cyan: #00f0ff;
    --magenta: #ff2d6a;
    --purple: #a855f7;
    --deep-purple: #7c3aed;
    --dark-bg: #0a0a0f;
    --card-bg: rgba(255, 255, 255, 0.03);
    --card-border: rgba(255, 255, 255, 0.08);
    --text-main: #e8e8ed;
    --text-muted: #6b6b7a;
    --container-max: 1100px;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html {
    scroll-behavior: smooth;
}

body {
    font-family: 'Outfit', sans-serif;
    background: var(--dark-bg);
    color: var(--text-main);
    line-height: 1.6;
    overflow-x: hidden;
}

.container {
    max-width: var(--container-max);
    margin: 0 auto;
    width: 100%;
}

/* Grain overlay */
body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    opacity: 0.03;
    pointer-events: none;
    z-index: 9999;
}

/* Ambient background glow */
.ambient-glow {
    position: fixed;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    filter: blur(150px);
    opacity: 0.15;
    pointer-events: none;
    z-index: -1;
}

.glow-1 {
    top: -200px;
    right: -100px;
    background: var(--cyan);
}

.glow-2 {
    bottom: 20%;
    left: -200px;
    background: var(--magenta);
}

.glow-3 {
    bottom: -200px;
    right: 20%;
    background: var(--purple);
}

/* Navigation */
nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    padding: 1.5rem 4%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    backdrop-filter: blur(20px);
    background: rgba(10, 10, 15, 0.7);
    border-bottom: 1px solid var(--card-border);
}

.nav-inner {
    max-width: var(--container-max);
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.8rem;
    letter-spacing: 3px;
    background: linear-gradient(135deg, #fbbf24, #f472b6, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.logo span {
    font-family: 'Space Mono', monospace;
    font-size: 0.7rem;
    display: block;
    letter-spacing: 1px;
    background: none;
    -webkit-text-fill-color: var(--text-muted);
    margin-top: -5px;
}

.nav-links {
    display: flex;
    gap: 2.5rem;
    list-style: none;
}

.nav-links a {
    color: var(--text-muted);
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s ease;
    padding: 0.5rem 0.8rem;
    border-radius: 4px;
    display: inline-block;
    transform: scale(1);
}

.nav-links a:hover {
    color: var(--text-main);
    background: rgba(255, 255, 255, 0.06);
    transform: scale(1.08);
}

.nav-cta {
    padding: 0.7rem 1.5rem;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #fff;
    font-family: 'Space Mono', monospace;
    font-size: 0.8rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.25s ease;
    position: relative;
    overflow: hidden;
}

.nav-cta::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
}

.nav-cta:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
}

/* Hero Section - Asymmetrical */
.hero {
    min-height: 100vh;
    padding: 10rem 4% 4rem;
    display: flex;
    justify-content: center;
}

.hero-inner {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 4rem;
    align-items: center;
    max-width: var(--container-max);
    width: 100%;
}

.hero-content {
    padding-left: 0;
}

.hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 50px;
    font-size: 0.75rem;
    font-family: 'Space Mono', monospace;
    color: var(--text-muted);
    margin-bottom: 1.5rem;
}

.hero-badge::before {
    content: '';
    width: 6px;
    height: 6px;
    background: var(--text-muted);
    border-radius: 50%;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
}

.hero h1 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(3.5rem, 8vw, 7rem);
    line-height: 0.95;
    letter-spacing: 2px;
    margin-bottom: 1.5rem;
}

.hero h1 .line-1 {
    display: block;
    color: var(--text-main);
}

.hero h1 .line-2 {
    display: block;
    background: linear-gradient(90deg, #fbbf24, #f472b6, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.hero h1 .line-3 {
    display: block;
    color: var(--text-main);
    opacity: 0.4;
    font-size: 0.6em;
}

.hero-desc {
    color: var(--text-muted);
    font-size: 1.25rem;
    max-width: 450px;
    margin-bottom: 2.5rem;
    font-weight: 300;
    line-height: 1.7;
}

.hero-stats {
    display: flex;
    gap: 3rem;
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid var(--card-border);
}

.stat {
    text-align: left;
}

.stat-value {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 2.5rem;
    color: var(--text-main);
    line-height: 1;
}

.stat-label {
    font-size: 0.75rem;
    color: var(--text-muted);
    font-family: 'Space Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 1px;
}

/* Generator Demo */
.hero-demo {
    position: relative;
    z-index: 1;
}

.demo-container {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 12px;
    padding: 2rem;
    backdrop-filter: blur(20px);
    position: relative;
    overflow: hidden;
    max-width: 640px;
    max-height: 640px;
}

.demo-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
}

.demo-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
}

.demo-dot:nth-child(1) { background: #ff5f57; }
.demo-dot:nth-child(2) { background: #ffbd2e; }
.demo-dot:nth-child(3) { background: #28c840; }

.prompt-area {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--card-border);
    border-radius: 6px;
    padding: 1.2rem;
    margin-bottom: 1rem;
}

.prompt-label {
    font-family: 'Space Mono', monospace;
    font-size: 0.7rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 0.5rem;
}

.prompt-input {
    width: 100%;
    background: transparent;
    border: none;
    color: var(--text-main);
    font-family: 'Outfit', sans-serif;
    font-size: 1rem;
    line-height: 1.5;
    resize: none;
    outline: none;
}

.prompt-input::placeholder {
    color: var(--text-muted);
}

.demo-controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
}

.control-group {
    flex: 1;
    min-width: 120px;
}

.control-label {
    font-size: 0.7rem;
    color: var(--text-muted);
    margin-bottom: 0.4rem;
    display: block;
}

.control-select {
    width: 100%;
    padding: 0.6rem 1rem;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid var(--card-border);
    border-radius: 6px;
    color: var(--text-main);
    font-family: 'Outfit', sans-serif;
    font-size: 0.85rem;
    cursor: pointer;
    outline: none;
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b6b7a' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    padding-right: 2.5rem;
}

.control-select:focus {
    border-color: var(--text-main);
}

.control-select option {
    background: #1a1a22;
    color: var(--text-main);
    padding: 0.5rem;
}

.aspect-ratios {
    display: flex;
    gap: 0.5rem;
}

.aspect-btn {
    padding: 0.6rem 1rem;
    background: transparent;
    border: 1px solid var(--card-border);
    border-radius: 6px;
    color: var(--text-muted);
    font-family: 'Space Mono', monospace;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.aspect-btn:hover {
    border-color: rgba(255,255,255,0.2);
    color: var(--text-main);
}

.aspect-btn.active {
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.25);
    color: var(--text-main);
}

.generate-btn {
    width: 100%;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: #fff;
    font-family: 'Space Mono', monospace;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.25s ease;
    position: relative;
    overflow: hidden;
}

.generate-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
}

.generate-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
}

.generate-btn:active {
    background: rgba(255, 255, 255, 0.06);
    transform: translateY(0);
}

.generate-btn.loading {
    pointer-events: none;
}

.generate-btn .btn-text {
    transition: opacity 0.3s;
}

.generate-btn.loading .btn-text {
    opacity: 0;
}

.generate-btn .loader {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 24px;
    height: 24px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    opacity: 0;
    animation: none;
}

.generate-btn.loading .loader {
    opacity: 1;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: translate(-50%, -50%) rotate(360deg); }
}

/* Generated Image Display */
.output-area {
    margin-top: 1.5rem;
    position: relative;
}

.output-placeholder {
    aspect-ratio: 1;
    background: rgba(0,0,0,0.3);
    border: 1px dashed var(--card-border);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    transition: all 0.3s ease;
}

.output-placeholder.has-image {
    border: none;
    background: none;
}

.output-placeholder svg {
    width: 48px;
    height: 48px;
    margin-bottom: 1rem;
    opacity: 0.3;
}

.output-placeholder p {
    font-size: 0.85rem;
}

.generated-image {
    width: 100%;
    border-radius: 8px;
    display: none;
    animation: fadeIn 0.4s ease;
}

.generated-image.visible {
    display: block;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.image-actions {
    display: none;
    gap: 0.5rem;
    margin-top: 1rem;
}

.image-actions.visible {
    display: flex;
}

.action-btn {
    flex: 1;
    padding: 0.7rem;
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--card-border);
    border-radius: 6px;
    color: var(--text-muted);
    font-family: 'Space Mono', monospace;
    font-size: 0.7rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
}

.action-btn:hover {
    border-color: rgba(255,255,255,0.2);
    color: var(--text-main);
    background: rgba(255,255,255,0.05);
}

/* Floating decoration */
.floating-badge {
    position: absolute;
    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    padding: 0.8rem 1.4rem;
    font-family: 'Space Mono', monospace;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    z-index: 10;
    color: var(--text-main);
}

.badge-1 {
    top: -20px;
    right: 40px;
    animation: float 4s ease-in-out infinite;
}

.badge-2 {
    bottom: 80px;
    left: -30px;
    animation: float 4s ease-in-out infinite 1s;
}

/* Gallery Popup */
.gallery-popup {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.gallery-popup.active {
    opacity: 1;
    visibility: visible;
}

.popup-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(20px);
}

.popup-content {
    position: relative;
    max-width: 800px;
    max-height: 90vh;
    width: 90%;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    overflow: hidden;
    transform: scale(0.9) translateY(20px);
    transition: transform 0.3s ease;
}

.gallery-popup.active .popup-content {
    transform: scale(1) translateY(0);
}

.popup-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    transition: all 0.2s ease;
}

.popup-close:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(90deg);
}

.popup-image-container {
    width: 100%;
    max-height: 70vh;
    overflow: hidden;
}

.popup-image {
    width: 100%;
    height: auto;
    display: block;
}

.popup-info {
    padding: 1.5rem 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.popup-prompt {
    font-size: 1rem;
    color: var(--text-main);
    line-height: 1.6;
    margin-bottom: 1rem;
    font-style: italic;
}

.popup-prompt::before {
    content: '"';
}

.popup-prompt::after {
    content: '"';
}

.popup-style {
    display: inline-block;
    padding: 0.4rem 0.8rem;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    font-family: 'Space Mono', monospace;
    font-size: 0.75rem;
    color: var(--text-muted);
}

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

/* Gallery Section */
.gallery-section {
    padding: 6rem 4%;
    position: relative;
}

.gallery-inner {
    max-width: var(--container-max);
    margin: 0 auto;
}

.section-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 3rem;
    gap: 2rem;
    text-align: center;
}

.section-header > div {
    text-align: center;
}

.section-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(2.5rem, 5vw, 4rem);
    line-height: 1;
    letter-spacing: 2px;
    text-align: center;
}

.section-title span {
    color: var(--magenta);
}

.section-subtitle {
    color: var(--text-muted);
    font-size: 1.1rem;
    max-width: 500px;
    margin-top: 0.5rem;
    line-height: 1.7;
    text-align: center;
    margin-left: auto;
    margin-right: auto;
}

.filter-tabs {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
}

.filter-tab {
    padding: 0.6rem 1.2rem;
    background: transparent;
    border: 1px solid var(--card-border);
    border-radius: 4px;
    color: var(--text-muted);
    font-family: 'Space Mono', monospace;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.filter-tab:hover {
    border-color: rgba(255,255,255,0.2);
    color: var(--text-main);
}

.filter-tab.active {
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.25);
    color: var(--text-main);
}

/* Bento Gallery Grid */
.bento-gallery {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(3, 200px);
    gap: 1.2rem;
}

.gallery-item {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
}

.gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s;
}

.gallery-item:hover img {
    transform: scale(1.08);
}

.gallery-item::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%);
    opacity: 0;
    transition: opacity 0.3s;
}

.gallery-item:hover::after {
    opacity: 1;
}

.item-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1.2rem;
    transform: translateY(20px);
    opacity: 0;
    transition: all 0.3s;
    z-index: 2;
}

.gallery-item:hover .item-info {
    transform: translateY(0);
    opacity: 1;
}

.item-prompt {
    font-size: 0.8rem;
    color: var(--text-main);
    margin-bottom: 0.3rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.item-style {
    font-family: 'Space Mono', monospace;
    font-size: 0.65rem;
    color: var(--text-muted);
    text-transform: uppercase;
}

/* Bento Layout Variations */
.gallery-item:nth-child(1) {
    grid-column: span 2;
    grid-row: span 2;
}

.gallery-item:nth-child(5) {
    grid-column: span 2;
}

.gallery-item:nth-child(8) {
    grid-column: span 2;
}

/* Features Section - Redesigned Human-Crafted */
.features-section {
    padding: 6rem 4%;
}

.features-inner {
    max-width: var(--container-max);
    margin: 0 auto;
}

.features-header {
    text-align: center;
    margin-bottom: 4rem;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
}

.feature-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 8px;
    padding: 2rem;
    position: relative;
    overflow: hidden;
    transition: all 0.2s ease;
}

.feature-card:hover {
    border-color: rgba(255, 255, 255, 0.15);
}

/* Unique card accents - each card gets different treatment */
.feature-card:nth-child(1) {
    border-top: 2px solid #4a4a52;
}

.feature-card:nth-child(2)::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, rgba(255,255,255,0.05), transparent);
}

.feature-card:nth-child(3) {
    border-left: 2px solid #4a4a52;
}

.feature-card:nth-child(4)::after {
    content: '';
    position: absolute;
    bottom: -20px;
    left: -20px;
    width: 100px;
    height: 100px;
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 50%;
}

.feature-card:nth-child(5) {
    border-bottom: 2px solid #4a4a52;
}

.feature-card.highlight {
    grid-row: span 2;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-left: 3px solid #5a5a62;
}

.feature-card.highlight::before {
    content: '★';
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    font-size: 0.8rem;
    color: var(--text-muted);
    opacity: 0.3;
}

/* Icon styling - varied, not uniform */
.feature-icon {
    width: 64px;
    height: 64px;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    position: relative;
}

.feature-icon svg {
    width: 40px;
    height: 40px;
    stroke-width: 1.5;
}

/* Each icon gets subtle treatment */
.feature-card:nth-child(1) .feature-icon svg {
    color: var(--text-main);
    opacity: 0.8;
}

.feature-card:nth-child(2) .feature-icon svg {
    color: var(--text-muted);
}

.feature-card:nth-child(3) .feature-icon svg {
    color: var(--text-main);
    opacity: 0.8;
}

.feature-card:nth-child(4) .feature-icon svg {
    color: var(--text-muted);
}

.feature-card:nth-child(5) .feature-icon svg {
    color: var(--text-main);
    opacity: 0.8;
}

/* Decorative number for each card */
.feature-number {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 3rem;
    color: var(--text-main);
    opacity: 0.1;
    line-height: 1;
}

.feature-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.5rem;
    letter-spacing: 1px;
    margin-bottom: 0.8rem;
}

.feature-desc {
    color: var(--text-muted);
    font-size: 1.05rem;
    line-height: 1.8;
}

.feature-stat {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--card-border);
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
}

.feature-stat-value {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 2rem;
    color: var(--text-main);
}

.feature-stat-label {
    font-size: 0.9rem;
    color: var(--text-muted);
}

/* How It Works */
.how-section {
    padding: 6rem 4%;
    background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.01), transparent);
}

.how-inner {
    max-width: var(--container-max);
    margin: 0 auto;
}

.how-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    max-width: 900px;
    margin: 3rem auto 0;
    position: relative;
}

.how-grid::before {
    content: '';
    position: absolute;
    top: 40px;
    left: 15%;
    right: 15%;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--card-border), var(--card-border), transparent);
}

.how-step {
    text-align: center;
    position: relative;
}

.step-number {
    width: 80px;
    height: 80px;
    margin: 0 auto 1.5rem;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 2rem;
    color: var(--text-main);
    position: relative;
    z-index: 2;
}

.step-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.3rem;
    letter-spacing: 1px;
    margin-bottom: 0.5rem;
}

.step-desc {
    color: var(--text-muted);
    font-size: 1rem;
    line-height: 1.7;
}

/* Pricing Section */
.pricing-section {
    padding: 6rem 4%;
}

.pricing-inner {
    max-width: var(--container-max);
    margin: 0 auto;
}

.pricing-toggle {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-bottom: 3rem;
}

.pricing-toggle span {
    font-size: 0.9rem;
    color: var(--text-muted);
}

.pricing-toggle span.active {
    color: var(--text-main);
}

.toggle-switch {
    width: 50px;
    height: 26px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 50px;
    position: relative;
    cursor: pointer;
}

.toggle-switch::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 18px;
    height: 18px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 50%;
    transition: transform 0.3s;
}

.toggle-switch.yearly::after {
    transform: translateX(24px);
}

.save-badge {
    padding: 0.3rem 0.6rem;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 4px;
    font-family: 'Space Mono', monospace;
    font-size: 0.7rem;
    color: var(--text-main);
}

.pricing-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    max-width: 900px;
    margin: 0 auto;
}

.price-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 4px;
    padding: 2.5rem;
    position: relative;
    transition: all 0.2s ease;
}

.price-card:hover {
    border-color: rgba(255, 255, 255, 0.15);
}

.price-card.popular {
    border-color: #5a5a62;
    background: var(--card-bg);
}

.popular-badge {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    padding: 0.4rem 1rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    font-family: 'Space Mono', monospace;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.plan-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.5rem;
    letter-spacing: 1px;
    margin-bottom: 0.5rem;
}

.plan-desc {
    color: var(--text-muted);
    font-size: 1rem;
    margin-bottom: 1.5rem;
}

.plan-price {
    margin-bottom: 1.5rem;
}

.price-value {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 3.5rem;
    line-height: 1;
}

.price-period {
    color: var(--text-muted);
    font-size: 0.85rem;
}

.price-yearly-total {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin-top: 0.3rem;
    height: 1.3em;
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.2s ease;
}

.price-yearly-total.visible {
    visibility: visible;
    opacity: 1;
}

.price-yearly-total span {
    color: var(--text-main);
    font-weight: 500;
}

.plan-features {
    list-style: none;
    margin-bottom: 2rem;
}

.plan-features li {
    padding: 0.6rem 0;
    font-size: 1rem;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 0.8rem;
}

.plan-features li::before {
    content: '✓';
    color: var(--text-main);
    font-weight: bold;
}

.plan-btn {
    width: 100%;
    padding: 1rem;
    background: transparent;
    border: 1px solid #4a4a52;
    border-radius: 6px;
    color: var(--text-main);
    font-family: 'Space Mono', monospace;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.plan-btn:hover {
    border-color: #6a6a72;
    background: rgba(255, 255, 255, 0.03);
}

.price-card.popular .plan-btn {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    font-weight: 700;
    position: relative;
    overflow: hidden;
}

.price-card.popular .plan-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
}

.price-card.popular .plan-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
}

/* FAQ Section */
.faq-section {
    padding: 6rem 4%;
    max-width: 800px;
    margin: 0 auto;
}

.faq-list {
    margin-top: 3rem;
}

.faq-item {
    border-bottom: 1px solid var(--card-border);
}

.faq-question {
    width: 100%;
    padding: 1.5rem 0;
    background: transparent;
    border: none;
    text-align: left;
    color: var(--text-main);
    font-family: 'Outfit', sans-serif;
    font-size: 1.1rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.faq-question::after {
    content: '+';
    font-family: 'Space Mono', monospace;
    font-size: 1.5rem;
    color: var(--text-muted);
    transition: transform 0.3s;
}

.faq-item.open .faq-question::after {
    transform: rotate(45deg);
}

.faq-answer {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s ease;
}

.faq-answer p {
    padding-bottom: 1.5rem;
    color: var(--text-muted);
    font-size: 1.05rem;
    line-height: 1.8;
}

.faq-item.open .faq-answer {
    max-height: 200px;
}

/* CTA Section - Redesigned */
.cta-section {
    padding: 8rem 4%;
}

.cta-box {
    max-width: 900px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 4rem;
    align-items: center;
    position: relative;
}

.cta-content {
    position: relative;
}

.cta-eyebrow {
    font-family: 'Space Mono', monospace;
    font-size: 0.75rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 1rem;
}

.cta-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(2.5rem, 5vw, 4rem);
    letter-spacing: 2px;
    line-height: 1;
    margin-bottom: 1.5rem;
}

.cta-title span {
    display: block;
    color: var(--text-muted);
    font-size: 0.5em;
    margin-top: 0.3em;
}

.cta-desc {
    color: var(--text-muted);
    font-size: 1.15rem;
    max-width: 400px;
    line-height: 1.7;
    margin-bottom: 2.5rem;
}

.cta-buttons {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.cta-btn-primary {
    padding: 1rem 2rem;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #fff;
    font-family: 'Space Mono', monospace;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.25s ease;
    position: relative;
    overflow: hidden;
}

.cta-btn-primary::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
}

.cta-btn-primary:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
}

.cta-btn-secondary {
    padding: 1rem 2rem;
    background: transparent;
    border: 1px solid #4a4a52;
    color: var(--text-main);
    font-family: 'Space Mono', monospace;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.cta-btn-secondary:hover {
    border-color: #6a6a72;
    background: rgba(255, 255, 255, 0.03);
}

.cta-visual {
    position: relative;
    max-width: 400px;
    justify-self: end;
}

.cta-demo-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 8px;
    padding: 1.2rem;
    position: relative;
}

.cta-demo-prompt {
    background: rgba(0,0,0,0.3);
    border: 1px solid var(--card-border);
    border-radius: 4px;
    padding: 1rem 1rem;
    margin-bottom: 1rem;
    font-size: 0.85rem;
    color: var(--text-muted);
    font-style: italic;
    min-height: 4.5em;
    line-height: 1.5;
}

.cta-demo-prompt::before {
    content: '"';
}

.cta-demo-prompt::after {
    content: '"';
}

.cta-demo-arrow {
    text-align: center;
    margin-bottom: 1rem;
    color: var(--text-muted);
    font-size: 1.2rem;
}

.cta-demo-result {
    position: relative;
    border-radius: 6px;
    overflow: hidden;
    aspect-ratio: 4/3;
}

.cta-demo-result img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.cta-demo-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--card-border);
}

.cta-demo-time {
    font-family: 'Space Mono', monospace;
    font-size: 0.75rem;
    color: var(--text-muted);
}

.cta-demo-time span {
    color: var(--text-main);
}

.cta-demo-actions {
    display: flex;
    gap: 0.5rem;
}

.cta-demo-action {
    width: 28px;
    height: 28px;
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--card-border);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
}

.cta-users {
    position: absolute;
    bottom: -15px;
    left: 1rem;
    display: flex;
    align-items: center;
    background: var(--dark-bg);
    border: 1px solid var(--card-border);
    padding: 0.5rem 1rem;
    border-radius: 50px;
}

.cta-user-avatars {
    display: flex;
    margin-right: 0.8rem;
}

.cta-user-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    margin-left: -8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.6rem;
    color: rgba(255, 255, 255, 0.7);
}

.cta-user-avatar:first-child {
    margin-left: 0;
}

.cta-user-count {
    font-size: 0.75rem;
    color: var(--text-muted);
}

.cta-user-count span {
    color: var(--text-main);
    font-weight: 600;
}

/* Footer */
footer {
    padding: 4rem 4% 2rem;
    border-top: 1px solid var(--card-border);
}

.footer-inner {
    max-width: var(--container-max);
    margin: 0 auto;
}

.footer-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    margin-bottom: 3rem;
    align-items: start;
}

.footer-brand .logo {
    margin-bottom: 1rem;
}

.footer-desc {
    color: var(--text-muted);
    font-size: 1rem;
    max-width: 300px;
    margin-bottom: 1.5rem;
    line-height: 1.7;
}

.social-links {
    display: flex;
    gap: 1rem;
}

.social-link {
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    transition: all 0.3s;
}

.social-link:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: var(--text-main);
}

.footer-subscribe {
    max-width: 400px;
    justify-self: end;
}

.footer-subscribe h4 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.2rem;
    letter-spacing: 1px;
    margin-bottom: 0.8rem;
}

.subscribe-desc {
    color: var(--text-muted);
    font-size: 0.9rem;
    margin-bottom: 1.2rem;
    line-height: 1.6;
}

.subscribe-form {
    display: flex;
    gap: 0.5rem;
}

.subscribe-input {
    flex: 1;
    padding: 0.9rem 1.2rem;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: var(--text-main);
    font-family: 'Outfit', sans-serif;
    font-size: 0.9rem;
    outline: none;
    transition: all 0.2s ease;
}

.subscribe-input::placeholder {
    color: var(--text-muted);
}

.subscribe-input:focus {
    border-color: rgba(255, 255, 255, 0.25);
    background: rgba(255, 255, 255, 0.08);
}

.subscribe-btn {
    padding: 0.9rem 1.5rem;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: #fff;
    font-family: 'Space Mono', monospace;
    font-size: 0.8rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.25s ease;
    position: relative;
    overflow: hidden;
}

.subscribe-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
}

.subscribe-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
}

.footer-col h4 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.2rem;
    letter-spacing: 1px;
    margin-bottom: 1.5rem;
}

.footer-col ul {
    list-style: none;
}

.footer-col li {
    margin-bottom: 0.8rem;
}

.footer-col a {
    color: var(--text-muted);
    text-decoration: none;
    font-size: 0.9rem;
    transition: color 0.3s;
}

.footer-col a:hover {
    color: var(--text-main);
}

.footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 2rem;
    border-top: 1px solid var(--card-border);
    flex-wrap: wrap;
    gap: 1rem;
}

.copyright {
    color: var(--text-muted);
    font-size: 0.85rem;
}

.copyright a {
    color: var(--text-main);
    text-decoration: none;
    transition: opacity 0.2s ease;
}

.copyright a:hover {
    opacity: 0.7;
}

.footer-legal {
    display: flex;
    gap: 2rem;
}

.footer-legal a {
    color: var(--text-muted);
    text-decoration: none;
    font-size: 0.85rem;
    transition: color 0.3s;
}

.footer-legal a:hover {
    color: var(--text-main);
}

/* Mobile Menu */
.mobile-toggle {
    display: none;
    flex-direction: column;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 5px;
}

.mobile-toggle span {
    width: 24px;
    height: 2px;
    background: var(--text-main);
    transition: all 0.3s;
}

.mobile-toggle.active span:nth-child(1) {
    transform: rotate(45deg) translate(5px, 5px);
}

.mobile-toggle.active span:nth-child(2) {
    opacity: 0;
}

.mobile-toggle.active span:nth-child(3) {
    transform: rotate(-45deg) translate(5px, -5px);
}

.mobile-menu {
    display: flex;
    position: fixed;
    top: 70px;
    left: 0;
    right: 0;
    height: calc(100vh - 70px);
    height: calc(100dvh - 70px);
    background: rgba(10, 10, 15, 0.98);
    backdrop-filter: blur(20px);
    padding: 1.5rem 2rem;
    flex-direction: column;
    gap: 0;
    border-bottom: 1px solid var(--card-border);
    z-index: 99;
    overflow-y: auto;
    transform: translateX(-100%);
    opacity: 0;
    visibility: hidden;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, visibility 0.3s ease;
}

.mobile-menu.active {
    transform: translateX(0);
    opacity: 1;
    visibility: visible;
}

.mobile-menu a {
    color: var(--text-main);
    text-decoration: none;
    font-size: 1.1rem;
    padding: 1rem 0;
    border-bottom: 1px solid var(--card-border);
    transform: translateX(-20px);
    opacity: 0;
    transition: transform 0.3s ease, opacity 0.3s ease, background 0.2s ease;
    margin: 0 -1rem;
    padding-left: 1rem;
    padding-right: 1rem;
}

.mobile-menu.active a {
    transform: translateX(0);
    opacity: 1;
}

.mobile-menu.active a:nth-child(1) { transition-delay: 0.1s; }
.mobile-menu.active a:nth-child(2) { transition-delay: 0.15s; }
.mobile-menu.active a:nth-child(3) { transition-delay: 0.2s; }
.mobile-menu.active a:nth-child(4) { transition-delay: 0.25s; }

.mobile-menu a:hover {
    background: rgba(255, 255, 255, 0.04);
}

.mobile-menu .nav-cta {
    margin-top: 1.5rem;
    transform: translateX(-20px);
    opacity: 0;
    transition: transform 0.3s ease 0.3s, opacity 0.3s ease 0.3s;
}

.mobile-menu.active .nav-cta {
    transform: translateX(0);
    opacity: 1;
}

@media (min-width: 769px) {
    .mobile-menu {
        display: none !important;
    }
}

/* Responsive */
@media (max-width: 1024px) {
    .hero-inner {
        grid-template-columns: 1fr;
        gap: 3rem;
    }

    .hero-content {
        padding-left: 0;
        text-align: center;
    }

    .hero-desc {
        margin: 0 auto 2.5rem;
    }

    .hero-stats {
        justify-content: center;
    }

    .bento-gallery {
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: auto;
    }

    .gallery-item:nth-child(1) {
        grid-column: span 2;
        grid-row: span 1;
    }

    .gallery-item:nth-child(5),
    .gallery-item:nth-child(8) {
        grid-column: span 1;
    }

    .features-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .feature-card.highlight {
        grid-row: span 1;
    }

    .pricing-grid {
        grid-template-columns: 1fr;
        max-width: 400px;
    }

    .footer-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    nav {
        padding: 1rem 4%;
    }

    .nav-links, .nav-cta {
        display: none;
    }

    .mobile-toggle {
        display: flex;
    }

    .hero {
        padding-top: 8rem;
    }

    .floating-badge {
        display: none;
    }

    .section-header {
        flex-direction: column;
        align-items: center;
    }

    .bento-gallery {
        grid-template-columns: 1fr;
    }

    .gallery-item:nth-child(1) {
        grid-column: span 1;
    }

    .features-grid {
        grid-template-columns: 1fr;
    }

    .how-grid {
        grid-template-columns: 1fr;
        gap: 3rem;
    }

    .how-grid::before {
        display: none;
    }

    .footer-grid {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 3rem;
    }

    .footer-brand {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .footer-subscribe {
        justify-self: center;
        text-align: center;
    }

    .subscribe-form {
        flex-direction: column;
    }

    .subscribe-btn {
        width: 100%;
    }

    .social-links {
        justify-content: center;
    }

    .footer-bottom {
        flex-direction: column;
        text-align: center;
    }

    .demo-controls {
        flex-direction: column;
    }

    .control-group {
        min-width: 100%;
    }

    .aspect-ratios {
        width: 100%;
    }

    .aspect-btn {
        flex: 1;
    }

    .cta-box {
        grid-template-columns: 1fr;
        gap: 3rem;
        text-align: center;
    }

    .cta-desc {
        margin-left: auto;
        margin-right: auto;
    }

    .cta-buttons {
        justify-content: center;
    }

    .cta-visual {
        justify-self: center;
        max-width: 320px;
    }

    .cta-users {
        left: 50%;
        transform: translateX(-50%);
    }
}
