@charset "utf-8";
/* CSS Document 

TemplateMo 610 Aurum Gold

https://templatemo.com/tm-610-aurum-gold

*/

:root {
	--gold-primary: #B8860B;
	--gold-light: #D4A84B;
	--gold-dark: #8B6914;
	--gold-accent: #C9A227;
	--bg-dark: #0F0E0C;
	--bg-card: #1A1815;
	--bg-card-hover: #252119;
	--text-primary: #F5F0E8;
	--text-secondary: #A69F94;
	--text-muted: #6B6560;
	--border-color: #2A2622;
	--success: #4A7C59;
	--danger: #8B3A3A;
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
	font-family: 'Libre Franklin', sans-serif;
	background-color: var(--bg-dark);
	color: var(--text-primary);
	line-height: 1.7;
	font-weight: 300;
	overflow-x: hidden;
}

/* Noise texture overlay */
body::before {
	content: '';
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	pointer-events: none;
	opacity: 0.03;
	z-index: 9999;
	background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
}

h1,
h2,
h3,
h4,
h5,
h6 {
	font-family: 'Cormorant Garamond', serif;
	font-weight: 500;
	line-height: 1.2;
	letter-spacing: 0.02em;
}

a {
	color: inherit;
	text-decoration: none;
	transition: color 0.3s ease;
}

img {
	max-width: 100%;
	height: auto;
}

.container {
	max-width: 1280px;
	margin: 0 auto;
	padding: 0 24px;
}

/* Navigation */
.nav {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 1000;
	padding: 20px 0;
	transition: all 0.4s ease;
}

.nav.scrolled {
	background: rgba(15, 14, 12, 0.95);
	backdrop-filter: blur(20px);
	padding: 14px 0;
	border-bottom: 1px solid var(--border-color);
}

.nav-inner {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.logo {
	font-family: 'Cormorant Garamond', serif;
	font-size: 28px;
	font-weight: 600;
	color: var(--gold-light);
	letter-spacing: 0.15em;
	text-transform: uppercase;
}

.logo span {
	color: var(--text-primary);
	font-weight: 400;
}

.nav-links {
	display: flex;
	align-items: center;
	gap: 40px;
	list-style: none;
}

.nav-links a {
	font-size: 13px;
	font-weight: 400;
	letter-spacing: 0.1em;
	text-transform: uppercase;
	color: var(--text-secondary);
	position: relative;
	padding: 8px 0;
	transition: color 0.4s ease;
}

.nav-links a::before {
	content: '―';
	position: absolute;
	left: -20px;
	top: 50%;
	transform: translateY(-50%);
	color: var(--gold-primary);
	font-size: 10px;
	opacity: 0;
	transition: opacity 0.3s ease, left 0.3s ease;
}

.nav-links a:hover,
.nav-links a.active {
	color: var(--gold-light);
}

.nav-links a:hover::before,
.nav-links a.active::before {
	opacity: 1;
	left: -16px;
}

.nav-cta {
	display: flex;
	align-items: center;
	gap: 16px;
}

/* Mobile Menu Styles */
.mobile-menu {
	position: fixed;
	top: 0;
	right: -100%;
	width: 100%;
	max-width: 400px;
	height: 100vh;
	background: var(--bg-card);
	z-index: 2000;
	padding: 100px 40px 40px;
	transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	border-left: 1px solid var(--border-color);
	overflow-y: auto;
}

.mobile-menu.open {
	right: 0;
}

.mobile-menu-overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.7);
	z-index: 1999;
	opacity: 0;
	visibility: hidden;
	transition: opacity 0.4s ease, visibility 0.4s ease;
}

.mobile-menu-overlay.open {
	opacity: 1;
	visibility: visible;
}

.mobile-menu-close {
	position: absolute;
	top: 24px;
	right: 24px;
	width: 48px;
	height: 48px;
	background: none;
	border: 1px solid var(--border-color);
	color: var(--text-secondary);
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s ease;
}

.mobile-menu-close:hover {
	border-color: var(--gold-primary);
	color: var(--gold-light);
}

.mobile-nav-links {
	list-style: none;
	margin-bottom: 40px;
}

.mobile-nav-links li {
	border-bottom: 1px solid var(--border-color);
}

.mobile-nav-links a {
	display: block;
	padding: 20px 0;
	font-family: 'Cormorant Garamond', serif;
	font-size: 24px;
	color: var(--text-secondary);
	transition: all 0.3s ease;
	position: relative;
}

.mobile-nav-links a::after {
	content: '→';
	position: absolute;
	right: 0;
	top: 50%;
	transform: translateY(-50%) translateX(-10px);
	opacity: 0;
	color: var(--gold-primary);
	transition: all 0.3s ease;
}

.mobile-nav-links a:hover,
.mobile-nav-links a.active {
	color: var(--gold-light);
	padding-left: 12px;
}

.mobile-nav-links a:hover::after,
.mobile-nav-links a.active::after {
	opacity: 1;
	transform: translateY(-50%) translateX(0);
}

.mobile-menu-cta {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.mobile-menu-cta .btn {
	width: 100%;
	text-align: center;
}

.btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 14px 32px;
	font-size: 12px;
	font-weight: 500;
	letter-spacing: 0.15em;
	text-transform: uppercase;
	border: none;
	cursor: pointer;
	transition: all 0.3s ease;
	font-family: 'Libre Franklin', sans-serif;
}

.btn-outline {
	background: transparent;
	border: 1px solid var(--gold-primary);
	color: var(--gold-light);
}

.btn-outline:hover {
	background: var(--gold-primary);
	color: var(--bg-dark);
}

.btn-primary {
	background: linear-gradient(135deg, var(--gold-primary) 0%, var(--gold-dark) 100%);
	color: var(--bg-dark);
	border: 1px solid var(--gold-light);
}

.btn-primary:hover {
	background: linear-gradient(135deg, var(--gold-light) 0%, var(--gold-primary) 100%);
	transform: translateY(-2px);
	box-shadow: 0 8px 30px rgba(184, 134, 11, 0.3);
}

.mobile-menu-btn {
	display: none;
	flex-direction: column;
	gap: 6px;
	background: none;
	border: 1px solid var(--border-color);
	cursor: pointer;
	padding: 12px;
	transition: all 0.3s ease;
}

.mobile-menu-btn:hover {
	border-color: var(--gold-primary);
}

.mobile-menu-btn span {
	width: 20px;
	height: 1.5px;
	background: var(--gold-light);
	transition: all 0.3s ease;
	transform-origin: center;
}

.mobile-menu-btn.active span:nth-child(1) {
	transform: rotate(45deg) translate(5px, 5px);
}

.mobile-menu-btn.active span:nth-child(2) {
	opacity: 0;
}

.mobile-menu-btn.active span:nth-child(3) {
	transform: rotate(-45deg) translate(5px, -5px);
}

/* Hide body scroll when menu open */
body.menu-open {
	overflow: hidden;
}

/* Hero Section */
.hero {
	min-height: 100vh;
	display: flex;
	align-items: center;
	position: relative;
	padding: 120px 0 80px;
	overflow: hidden;
}

.hero::before {
	content: '';
	position: absolute;
	top: -50%;
	right: -20%;
	width: 80%;
	height: 150%;
	background: radial-gradient(ellipse at center, rgba(184, 134, 11, 0.08) 0%, transparent 60%);
	pointer-events: none;
}

.hero-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 80px;
	align-items: center;
}

.hero-content {
	position: relative;
	z-index: 2;
}

.hero-badge {
	display: inline-flex;
	align-items: center;
	gap: 10px;
	padding: 10px 20px;
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	margin-bottom: 32px;
	font-size: 12px;
	letter-spacing: 0.1em;
	text-transform: uppercase;
	color: var(--text-secondary);
}

.hero-badge .dot {
	width: 8px;
	height: 8px;
	background: var(--success);
	border-radius: 50%;
	animation: pulse 2s infinite;
}

@keyframes pulse {

	0%,
	100% {
		opacity: 1;
	}

	50% {
		opacity: 0.5;
	}
}

.hero-title {
	font-size: clamp(48px, 6vw, 80px);
	color: var(--text-primary);
	margin-bottom: 24px;
	font-weight: 400;
}

.hero-title .gold {
	color: var(--gold-light);
	font-style: italic;
}

.hero-desc {
	font-size: 18px;
	color: var(--text-secondary);
	max-width: 480px;
	margin-bottom: 40px;
	line-height: 1.8;
}

.hero-actions {
	display: flex;
	gap: 16px;
	margin-bottom: 60px;
}

.hero-stats {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 32px;
	padding-top: 40px;
	border-top: 1px solid var(--border-color);
}

.stat-item {
	text-align: left;
}

.stat-value {
	font-family: 'Cormorant Garamond', serif;
	font-size: 36px;
	color: var(--gold-light);
	margin-bottom: 4px;
}

.stat-label {
	font-size: 12px;
	color: var(--text-muted);
	text-transform: uppercase;
	letter-spacing: 0.1em;
}

/* Price Card */
.hero-visual {
	position: relative;
}

.price-card {
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	padding: 40px;
	position: relative;
}

.price-card::before {
	content: '';
	position: absolute;
	top: -1px;
	left: 40px;
	right: 40px;
	height: 2px;
	background: linear-gradient(90deg, transparent, var(--gold-primary), transparent);
}

.price-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 32px;
}

.price-label {
	font-size: 12px;
	text-transform: uppercase;
	letter-spacing: 0.15em;
	color: var(--text-muted);
}

.price-live {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 11px;
	color: var(--success);
	text-transform: uppercase;
	letter-spacing: 0.1em;
}

.price-live::before {
	content: '';
	width: 6px;
	height: 6px;
	background: var(--success);
	border-radius: 50%;
	animation: pulse 1.5s infinite;
}

.price-main {
	margin-bottom: 32px;
}

.price-value {
	font-family: 'Cormorant Garamond', serif;
	font-size: 64px;
	color: var(--text-primary);
	line-height: 1;
	margin-bottom: 8px;
}

.price-value .currency {
	font-size: 32px;
	color: var(--gold-light);
	vertical-align: top;
}

.price-change {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 6px 12px;
	background: rgba(74, 124, 89, 0.15);
	color: var(--success);
	font-size: 14px;
	font-weight: 500;
}

.price-change.down {
	background: rgba(139, 58, 58, 0.15);
	color: var(--danger);
}

.price-metals {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 16px;
	padding-top: 32px;
	border-top: 1px solid var(--border-color);
}

.metal-item {
	padding: 20px;
	background: var(--bg-dark);
	border: 1px solid var(--border-color);
	transition: all 0.3s ease;
}

.metal-item:hover {
	border-color: var(--gold-primary);
}

.metal-name {
	font-size: 11px;
	text-transform: uppercase;
	letter-spacing: 0.1em;
	color: var(--text-muted);
	margin-bottom: 8px;
}

.metal-price {
	font-family: 'Cormorant Garamond', serif;
	font-size: 24px;
	color: var(--text-primary);
}

.metal-change {
	font-size: 12px;
	color: var(--success);
	margin-top: 4px;
}

.metal-change.down {
	color: var(--danger);
}

/* Section Styles */
section {
	padding: 120px 0;
}

.section-header {
	text-align: center;
	max-width: 600px;
	margin: 0 auto 80px;
}

.section-label {
	font-size: 12px;
	text-transform: uppercase;
	letter-spacing: 0.2em;
	color: var(--gold-primary);
	margin-bottom: 16px;
}

.section-title {
	font-size: clamp(36px, 4vw, 52px);
	color: var(--text-primary);
	margin-bottom: 20px;
}

.section-desc {
	font-size: 16px;
	color: var(--text-secondary);
	line-height: 1.8;
}

/* Services Section */
.services {
	background: var(--bg-card);
	position: relative;
}

.services::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 1px;
	background: linear-gradient(90deg, transparent, var(--border-color), transparent);
}

.services-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 24px;
}

@media (max-width: 1200px) {
	.services-grid {
		grid-template-columns: repeat(2, 1fr);
	}
}

@media (max-width: 600px) {
	.services-grid {
		grid-template-columns: 1fr;
	}
}

.service-card {
	padding: 48px 32px;
	background: var(--bg-dark);
	border: 1px solid var(--border-color);
	text-align: center;
	transition: all 0.4s ease;
	position: relative;
	overflow: hidden;
}

.service-card::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 2px;
	background: var(--gold-primary);
	transform: scaleX(0);
	transition: transform 0.4s ease;
}

.service-card:hover {
	transform: translateY(-8px);
	border-color: var(--gold-dark);
	background: var(--bg-card-hover);
}

.service-card:hover::before {
	transform: scaleX(1);
}

.service-icon {
	width: 64px;
	height: 64px;
	margin: 0 auto 24px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid var(--gold-dark);
	color: var(--gold-light);
	font-size: 24px;
	transition: all 0.4s ease;
}

.service-card:hover .service-icon {
	background: var(--gold-primary);
	color: var(--bg-dark);
	border-color: var(--gold-primary);
}

.service-title {
	font-size: 22px;
	color: var(--text-primary);
	margin-bottom: 16px;
}

.service-desc {
	font-size: 14px;
	color: var(--text-secondary);
	line-height: 1.7;
}

/* Why Gold Section */
.why-gold {
	position: relative;
}

.why-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 80px;
	align-items: center;
}

.why-content {
	padding-right: 40px;
}

.why-content .section-label {
	text-align: left;
}

.why-content .section-title {
	text-align: left;
}

.why-list {
	list-style: none;
	margin-top: 40px;
}

.why-item {
	display: flex;
	gap: 20px;
	padding: 24px 0;
	border-bottom: 1px solid var(--border-color);
}

.why-item:last-child {
	border-bottom: none;
}

.why-number {
	font-family: 'Cormorant Garamond', serif;
	font-size: 32px;
	color: var(--gold-dark);
	line-height: 1;
	min-width: 40px;
}

.why-text h4 {
	font-size: 20px;
	color: var(--text-primary);
	margin-bottom: 8px;
	font-weight: 500;
}

.why-text p {
	font-size: 14px;
	color: var(--text-secondary);
	line-height: 1.7;
}

.why-visual {
	position: relative;
}

.why-image-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	grid-template-rows: repeat(2, 1fr);
	gap: 12px;
}

.why-thumb {
	aspect-ratio: 1;
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	overflow: hidden;
	position: relative;
	transition: all 0.4s ease;
}

.why-thumb::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(135deg, rgba(184, 134, 11, 0.1) 0%, transparent 60%);
	z-index: 1;
	opacity: 0;
	transition: opacity 0.4s ease;
}

.why-thumb:hover {
	border-color: var(--gold-dark);
	transform: scale(1.02);
	z-index: 2;
}

.why-thumb:hover::before {
	opacity: 1;
}

.why-thumb img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	transition: transform 0.6s ease;
}

.why-thumb:hover img {
	transform: scale(1.08);
}

/* First image spans 2x2 on desktop and tablet */
.why-thumb:nth-child(1) {
	grid-column: span 2;
	grid-row: span 2;
}

/* Mobile - 2 column layout */
@media (max-width: 600px) {
	.why-image-grid {
		grid-template-columns: repeat(2, 1fr);
		grid-template-rows: auto;
		gap: 8px;
	}

	.why-thumb:nth-child(1) {
		grid-column: span 2;
		grid-row: span 2;
	}

	.why-thumb:nth-child(2),
	.why-thumb:nth-child(3),
	.why-thumb:nth-child(4),
	.why-thumb:nth-child(5) {
		aspect-ratio: 1;
	}
}

/* Products Section */
.products {
	background: var(--bg-card);
}

.products-tabs {
	display: flex;
	justify-content: center;
	gap: 8px;
	margin-bottom: 60px;
}

.tab-btn {
	padding: 14px 32px;
	background: transparent;
	border: 1px solid var(--border-color);
	color: var(--text-secondary);
	font-family: 'Libre Franklin', sans-serif;
	font-size: 12px;
	font-weight: 500;
	letter-spacing: 0.1em;
	text-transform: uppercase;
	cursor: pointer;
	transition: all 0.3s ease;
}

.tab-btn:hover {
	border-color: var(--gold-dark);
	color: var(--text-primary);
}

.tab-btn.active {
	background: var(--gold-primary);
	border-color: var(--gold-primary);
	color: var(--bg-dark);
}

.products-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 24px;
}

/* Products Tab Content */
.products-tab-content {

	display: none;
}

.products-tab-content.active {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 24px;
}

@media (max-width: 1200px) {

	.products-tab-content.active,
	.products-grid {
		grid-template-columns: repeat(3, 1fr);
		gap: 20px;
	}
}

@media (max-width: 900px) {

	.products-tab-content.active,
	.products-grid {
		grid-template-columns: repeat(2, 1fr);
		gap: 16px;
	}
}

@media (max-width: 480px) {

	.products-tab-content.active,
	.products-grid {
		grid-template-columns: 1fr;
		gap: 16px;
	}

	.product-info {
		padding: 20px;
	}

	.product-name {
		font-size: 18px;
	}

	.product-weight {
		font-size: 11px;
		margin-bottom: 12px;
	}

	.product-price {
		font-size: 22px;
	}

	.product-btn {
		width: 36px;
		height: 36px;
		font-size: 18px;
	}
}

.product-card {
	background: var(--bg-dark);
	border: 1px solid var(--border-color);
	overflow: hidden;
	transition: all 0.4s ease;
}

.product-card:hover {
	border-color: var(--gold-dark);
	transform: translateY(-4px);
}

.product-image {
	aspect-ratio: 1;
	background: linear-gradient(180deg, #1F1D1A 0%, #151412 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	overflow: hidden;
}

.product-image::after {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: radial-gradient(circle at 30% 30%, rgba(184, 134, 11, 0.08) 0%, transparent 60%);
	pointer-events: none;
}

.product-image img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	transition: transform 0.5s ease;
}

.product-card:hover .product-image img {
	transform: scale(1.05);
}

.product-info {
	padding: 24px;
}

.product-name {
	font-family: 'Cormorant Garamond', serif;
	font-size: 20px;
	color: var(--text-primary);
	margin-bottom: 4px;
}

.product-weight {
	font-size: 12px;
	color: var(--text-muted);
	text-transform: uppercase;
	letter-spacing: 0.1em;
	margin-bottom: 16px;
}

.product-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.product-price {
	font-family: 'Cormorant Garamond', serif;
	font-size: 24px;
	color: var(--gold-light);
}

.product-btn {
	width: 40px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: transparent;
	border: 1px solid var(--border-color);
	color: var(--text-secondary);
	font-size: 20px;
	cursor: pointer;
	transition: all 0.3s ease;
}

.product-btn:hover {
	background: var(--gold-primary);
	border-color: var(--gold-primary);
	color: var(--bg-dark);
}

/* Testimonials */
.testimonials {
	position: relative;
	overflow: hidden;
}

.testimonials::before {
	content: '"';
	position: absolute;
	top: 80px;
	left: 10%;
	font-family: 'Cormorant Garamond', serif;
	font-size: 400px;
	color: var(--gold-dark);
	opacity: 0.05;
	line-height: 1;
	pointer-events: none;
}

.testimonials-wrapper {
	position: relative;
	max-width: 900px;
	margin: 0 auto;
}

.testimonials-slider {
	text-align: center;
	overflow: hidden;
}

.testimonials-track {
	display: flex;
	transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.testimonial-item {
	min-width: 100%;
	padding: 0 60px;
}

.testimonial-text {
	font-family: 'Cormorant Garamond', serif;
	font-size: clamp(24px, 3vw, 36px);
	font-style: italic;
	color: var(--text-primary);
	line-height: 1.6;
	margin-bottom: 40px;
}

.testimonial-author {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
}

.author-name {
	font-size: 16px;
	font-weight: 500;
	color: var(--text-primary);
	letter-spacing: 0.05em;
}

.author-title {
	font-size: 13px;
	color: var(--text-muted);
	text-transform: uppercase;
	letter-spacing: 0.1em;
}

/* Testimonial Navigation Arrows */
.testimonial-nav {
	position: absolute;
	top: 50%;
	transform: translateY(-50%);
	width: 100%;
	display: flex;
	justify-content: space-between;
	pointer-events: none;
	padding: 0 0;
}

.testimonial-arrow {
	width: 56px;
	height: 56px;
	background: transparent;
	border: 1px solid var(--border-color);
	color: var(--text-muted);
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	pointer-events: auto;
	transition: all 0.3s ease;
	opacity: 0.5;
}

.testimonial-arrow:hover {
	opacity: 1;
	border-color: var(--gold-primary);
	color: var(--gold-light);
	background: rgba(184, 134, 11, 0.1);
}

.testimonial-arrow svg {
	width: 20px;
	height: 20px;
}

.testimonial-arrow.prev {
	margin-left: -80px;
}

.testimonial-arrow.next {
	margin-right: -80px;
}

.testimonial-dots {
	display: flex;
	justify-content: center;
	gap: 12px;
	margin-top: 48px;
}

.dot {
	width: 8px;
	height: 8px;
	background: var(--border-color);
	cursor: pointer;
	transition: all 0.3s ease;
}

.dot:hover {
	background: var(--text-muted);
}

.dot.active {
	background: var(--gold-primary);
	width: 32px;
}

/* Trust Section */
.trust {
	background: var(--bg-card);
	padding: 80px 0;
}

.trust-grid {
	display: grid;
	grid-template-columns: repeat(5, 1fr);
	gap: 40px;
	align-items: center;
}

.trust-item {
	text-align: center;
	opacity: 0.5;
	transition: opacity 0.3s ease;
}

.trust-item:hover {
	opacity: 1;
}

.trust-logo {
	font-family: 'Cormorant Garamond', serif;
	font-size: 18px;
	color: var(--text-secondary);
	letter-spacing: 0.1em;
	text-transform: uppercase;
}

/* CTA Section */
.cta {
	position: relative;
	background: linear-gradient(135deg, rgba(184, 134, 11, 0.1) 0%, transparent 50%);
}

.cta-inner {
	text-align: center;
	max-width: 700px;
	margin: 0 auto;
}

.cta-title {
	font-size: clamp(36px, 4vw, 56px);
	color: var(--text-primary);
	margin-bottom: 24px;
}

.cta-title .gold {
	color: var(--gold-light);
}

.cta-desc {
	font-size: 18px;
	color: var(--text-secondary);
	margin-bottom: 40px;
	line-height: 1.8;
}

.cta-actions {
	display: flex;
	justify-content: center;
	gap: 16px;
}

/* Contact Section */
.contact {
	background: var(--bg-card);
}

.contact-grid {
	display: grid;
	grid-template-columns: 1fr 1.2fr;
	gap: 80px;
}

.contact-info h3 {
	font-size: 32px;
	color: var(--text-primary);
	margin-bottom: 24px;
}

.contact-info p {
	font-size: 16px;
	color: var(--text-secondary);
	margin-bottom: 40px;
	line-height: 1.8;
}

.contact-details {
	list-style: none;
}

.contact-details li {
	display: flex;
	align-items: flex-start;
	gap: 16px;
	padding: 20px 0;
	border-bottom: 1px solid var(--border-color);
}

.contact-details li:last-child {
	border-bottom: none;
}

.contact-icon {
	width: 40px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: var(--bg-dark);
	border: 1px solid var(--border-color);
	color: var(--gold-light);
	font-size: 16px;
	flex-shrink: 0;
}

.contact-text {
	padding-top: 4px;
}

.contact-label {
	font-size: 11px;
	text-transform: uppercase;
	letter-spacing: 0.1em;
	color: var(--text-muted);
	margin-bottom: 4px;
}

.contact-value {
	font-size: 16px;
	color: var(--text-primary);
}

/* Contact Form */
.contact-form {
	background: var(--bg-dark);
	border: 1px solid var(--border-color);
	padding: 48px;
}

.form-row {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 24px;
	margin-bottom: 24px;
}

.form-group {
	margin-bottom: 24px;
}

.form-group:last-of-type {
	margin-bottom: 32px;
}

.form-label {
	display: block;
	font-size: 11px;
	text-transform: uppercase;
	letter-spacing: 0.1em;
	color: var(--text-muted);
	margin-bottom: 10px;
}

.form-input,
.form-select,
.form-textarea {
	width: 100%;
	padding: 16px 20px;
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	color: var(--text-primary);
	font-family: 'Libre Franklin', sans-serif;
	font-size: 15px;
	transition: all 0.3s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
	outline: none;
	border-color: var(--gold-primary);
	background: var(--bg-card-hover);
}

.form-input::placeholder,
.form-textarea::placeholder {
	color: var(--text-muted);
}

.form-select {
	appearance: none;
	cursor: pointer;
	background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23A69F94' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
	background-repeat: no-repeat;
	background-position: right 16px center;
}

.form-textarea {
	min-height: 140px;
	resize: vertical;
}

.form-submit {
	width: 100%;
}

/* Footer */
.footer {
	background: var(--bg-dark);
	padding: 80px 0 40px;
	border-top: 1px solid var(--border-color);
}

.footer-grid {
	display: grid;
	grid-template-columns: 2fr 1fr 1fr 1fr;
	gap: 60px;
	margin-bottom: 60px;
}

.footer-brand .logo {
	margin-bottom: 20px;
}

.footer-brand p {
	font-size: 14px;
	color: var(--text-secondary);
	line-height: 1.8;
	max-width: 360px;
}

.footer-title {
	font-family: 'Cormorant Garamond', serif;
	font-size: 18px;
	color: var(--text-primary);
	margin-bottom: 24px;
}

.footer-links {
	list-style: none;
}

.footer-links li {
	margin-bottom: 12px;
}

.footer-links a {
	font-size: 14px;
	color: var(--text-secondary);
	transition: all 0.3s ease;
}

.footer-links a:hover {
	color: var(--gold-light);
	padding-left: 8px;
}

.footer-bottom {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-top: 40px;
	border-top: 1px solid var(--border-color);
}

.footer-copy {
	font-size: 13px;
	color: var(--text-muted);
}

.footer-socials {
	display: flex;
	gap: 16px;
}

.social-link {
	width: 40px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid var(--border-color);
	color: var(--text-secondary);
	font-size: 16px;
	transition: all 0.3s ease;
}

.social-link:hover {
	border-color: var(--gold-primary);
	color: var(--gold-light);
	background: rgba(184, 134, 11, 0.1);
}

/* Responsive */
@media (max-width: 1200px) {
	.footer-grid {
		grid-template-columns: repeat(2, 1fr);
	}
}

@media (max-width: 992px) {

	.nav-links,
	.nav-cta {
		display: none;
	}

	.mobile-menu-btn {
		display: flex;
	}

	.hero-grid,
	.why-grid,
	.contact-grid {
		grid-template-columns: 1fr;
		gap: 60px;
	}

	.hero-stats {
		grid-template-columns: repeat(3, 1fr);
	}

	.trust-grid {
		grid-template-columns: repeat(3, 1fr);
	}
}

@media (max-width: 768px) {
	section {
		padding: 80px 0;
	}

	.hero {
		padding: 100px 0 60px;
	}

	.hero-stats {
		grid-template-columns: 1fr;
		gap: 20px;
	}

	.stat-item {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.stat-value {
		font-size: 28px;
		margin-bottom: 0;
	}

	.form-row {
		grid-template-columns: 1fr;
	}

	.footer-grid {
		grid-template-columns: 1fr;
		gap: 40px;
	}

	.footer-bottom {
		flex-direction: column;
		gap: 20px;
		text-align: center;
	}

	.trust-grid {
		grid-template-columns: repeat(2, 1fr);
	}

	.hero-actions,
	.cta-actions {
		flex-direction: column;
	}

	.btn {
		width: 100%;
	}

	.products-tabs {
		flex-wrap: wrap;
	}

	.testimonial-nav {
		display: none;
	}

	.testimonial-item {
		padding: 0 20px;
	}
}

@media (min-width: 769px) and (max-width: 1100px) {
	.testimonial-arrow.prev {
		margin-left: -20px;
	}

	.testimonial-arrow.next {
		margin-right: -20px;
	}
}

/* Animations */
@keyframes fadeInUp {
	from {
		opacity: 0;
		transform: translateY(30px);
	}

	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.fade-in-up {
	animation: fadeInUp 0.8s ease forwards;
}

.delay-1 {
	animation-delay: 0.1s;
}

.delay-2 {
	animation-delay: 0.2s;
}

.delay-3 {
	animation-delay: 0.3s;
}

.delay-4 {
	animation-delay: 0.4s;
}