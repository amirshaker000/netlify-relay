/*

TemplateMo 619 Axis Industrial

https://templatemo.com/tm-619-axis-industrial

*/

/* ============================================================
   THE OBSERVER — PAGE-SPECIFIC STYLES
   ============================================================ */

/* Layout: Main + Sidebar */
.shell {
    display: grid;
    grid-template-columns: 1fr var(--sidebar-w, 340px);
    min-height: 100vh;
}

.shell__main { min-width: 0; }

/* Hero — radar variant */
.hero--radar { --fs-hero: clamp(3.5rem, 10vw, 10rem); }

.hero--radar .hero__grid { background-size: 32px 32px; }

.hero__rings {
    position: absolute;
    top: 30%;
    left: 45%;
    transform: translate(-50%, -50%);
    pointer-events: none;
}

.hero__ring {
    position: absolute;
    border: 1px solid rgba(255,62,0,0.06);
    border-radius: 50%;
    top: 50%;
    left: 50%;
}

.hero__ring:nth-child(1) { width: 200px; height: 200px; margin: -100px 0 0 -100px; }
.hero__ring:nth-child(2) { width: 400px; height: 400px; margin: -200px 0 0 -200px; }
.hero__ring:nth-child(3) { width: 650px; height: 650px; margin: -325px 0 0 -325px; }
.hero__ring:nth-child(4) { width: 950px; height: 950px; margin: -475px 0 0 -475px; }

.hero__ring:nth-child(1)::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 475px;
    height: 1px;
    background: linear-gradient(90deg, var(--safety), transparent);
    opacity: 0.12;
    transform-origin: 0 0;
    animation: sweepArm 8s linear infinite;
}

@keyframes sweepArm {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
}

/* Metrics Ribbon */
.ribbon {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    border-bottom: var(--border);
}

.ribbon__cell {
    padding: clamp(1rem, 1.8vw, 1.8rem) clamp(1rem, 1.5vw, 1.5rem);
    border-right: var(--border-thin);
    background: var(--base);
    transition: background 0s, color 0s;
    cursor: default;
}

.ribbon__cell:last-child { border-right: none; }
.ribbon__cell:hover { background: var(--ink); color: var(--base); }
.ribbon__cell:nth-child(3) { background: var(--ink); color: var(--base); }
.ribbon__cell:nth-child(3):hover { background: var(--safety); }

.ribbon__label { font-size: var(--fs-micro); text-transform: uppercase; letter-spacing: 0.16em; opacity: 0.4; margin-bottom: 0.6rem; }
.ribbon__value { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: clamp(1.4rem, 2.5vw, 2.2rem); line-height: 1; letter-spacing: -0.03em; }
.ribbon__unit { font-family: 'JetBrains Mono', monospace; font-size: 0.45em; font-weight: 400; opacity: 0.45; margin-left: 0.1em; }

.ribbon__cell .bar-track { margin-top: 0.8rem; height: 3px; }
.ribbon__cell:nth-child(3) .bar-track,
.ribbon__cell:hover .bar-track { background: rgba(255,255,255,0.12); }

/* Features Grid */
.features__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
    border: var(--border);
    box-shadow: var(--shadow);
}

.feat-card {
    padding: clamp(1.5rem, 2.5vw, 2.5rem);
    border-right: var(--border-thin);
    border-bottom: var(--border-thin);
    background: var(--base);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 220px;
    transition: background 0s, color 0s;
    cursor: default;
}

.feat-card:nth-child(3n) { border-right: none; }
.feat-card:nth-last-child(-n+3) { border-bottom: none; }
.feat-card:hover { background: var(--ink); color: var(--base); }

.feat-card--dark { background: var(--ink); color: var(--base); }
.feat-card--dark:hover { background: var(--safety); }
.feat-card--safety { background: var(--safety); color: var(--base); }
.feat-card--safety:hover { background: var(--ink); }

.feat-card__id { font-size: 0.55rem; text-transform: uppercase; letter-spacing: 0.2em; opacity: 0.25; margin-bottom: 1rem; }
.feat-card__icon { width: 28px; height: 28px; border: 2px solid currentColor; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; opacity: 0.6; font-size: 0.7rem; font-weight: 700; }
.feat-card__title { font-size: var(--fs-h3); margin-bottom: 0.6rem; line-height: 0.9; }
.feat-card__text { font-size: var(--fs-data); line-height: 1.7; opacity: 0.5; }
.feat-card__stat { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: clamp(2rem, 3.5vw, 3rem); line-height: 1; letter-spacing: -0.04em; margin-top: auto; padding-top: 1rem; }

.feat-card .spark__bar { background: var(--safety); }
.feat-card--dark .spark__bar { background: var(--term-green); }
.feat-card--safety .spark__bar { background: var(--base); }
.feat-card:hover .spark__bar { background: var(--safety); }
.feat-card--dark:hover .spark__bar { background: var(--base); }

/* Signal Section */
.signal__inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--gap);
    align-items: start;
}

.signal__text { font-size: var(--fs-data); line-height: 1.9; opacity: 0.55; max-width: 420px; margin-bottom: 2rem; }
.signal__tags { display: flex; flex-wrap: wrap; gap: 0.4rem; }

.signal__viz {
    border: var(--border);
    box-shadow: var(--shadow);
    background: var(--ink);
    padding: 1.5rem;
    color: var(--base);
}

.signal__viz-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; padding-bottom: 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.08); }
.signal__viz-title { font-size: var(--fs-micro); text-transform: uppercase; letter-spacing: 0.18em; color: var(--term-green); }
.signal__viz-status { font-size: 0.55rem; text-transform: uppercase; letter-spacing: 0.12em; opacity: 0.3; }

.signal__viz-canvas { width: 100%; height: 160px; position: relative; overflow: hidden; }

.signal__viz-bars { display: flex; align-items: center; gap: 2px; height: 100%; }

.signal__viz-bar {
    flex: 1;
    background: var(--term-green);
    opacity: 0.6;
    animation: waveBar 1.5s ease-in-out infinite alternate;
}

.signal__viz-bar:nth-child(odd)  { animation-delay: -0.3s; }
.signal__viz-bar:nth-child(3n)   { animation-delay: -0.6s; background: var(--safety); opacity: 0.5; }
.signal__viz-bar:nth-child(5n)   { animation-delay: -0.9s; }
.signal__viz-bar:nth-child(7n)   { animation-delay: -1.2s; background: var(--term-amber); opacity: 0.4; }

@keyframes waveBar {
    0% { height: 15%; } 25% { height: 65%; } 50% { height: 30%; } 75% { height: 80%; } 100% { height: 20%; }
}

.signal__viz-footer { display: flex; justify-content: space-between; margin-top: 0.8rem; padding-top: 0.6rem; border-top: 1px solid rgba(255,255,255,0.06); font-size: 0.55rem; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.25; }

/* CTA */
.cta { text-align: center; }
.cta__title { font-size: var(--fs-h1); margin-bottom: 1.2rem; }
.cta__text { font-size: var(--fs-data); line-height: 1.9; opacity: 0.45; max-width: 500px; margin: 0 auto 2.5rem; }
.cta__actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

/* About paragraph */
.about { padding: clamp(2.5rem, 5vw, 4rem) clamp(1rem, 4vw, 4rem); border-bottom: var(--border); background: var(--surface); }
.about__inner { max-width: 760px; margin: 0 auto; text-align: center; }
.about__text { font-size: var(--fs-data); line-height: 2; opacity: 0.6; margin-bottom: 1.5rem; }
.about__links { display: flex; gap: 0.6rem; justify-content: center; flex-wrap: wrap; }

/* ---- TERMINAL SIDEBAR ---- */
.sidebar {
    position: fixed;
    top: var(--header-h);
    right: 0;
    width: var(--sidebar-w, 340px);
    height: calc(100vh - var(--header-h));
    height: calc(100svh - var(--header-h));
    background: var(--term-bg);
    color: var(--base);
    border-left: var(--border);
    display: flex;
    flex-direction: column;
    z-index: 900;
    overflow: hidden;
}

.sidebar__header { padding: 0.7rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
.sidebar__title { font-size: var(--fs-micro); text-transform: uppercase; letter-spacing: 0.2em; color: var(--term-green); display: flex; align-items: center; gap: 0.4rem; }
.sidebar__title::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: var(--term-green); animation: pulse 2s ease-in-out infinite; }
.sidebar__meta { font-size: 0.52rem; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.2; }

.sidebar__stats { display: grid; grid-template-columns: 1fr 1fr 1fr; border-bottom: 1px solid rgba(255,255,255,0.06); flex-shrink: 0; }
.sidebar__stat { padding: 0.6rem 0.8rem; border-right: 1px solid rgba(255,255,255,0.06); transition: background 0s; cursor: default; }
.sidebar__stat:last-child { border-right: none; }
.sidebar__stat:hover { background: var(--safety); }
.sidebar__stat-label { font-size: 0.5rem; text-transform: uppercase; letter-spacing: 0.14em; opacity: 0.3; margin-bottom: 0.2rem; }
.sidebar__stat-val { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 0.95rem; letter-spacing: -0.03em; }

.sidebar__chart { padding: 0.8rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); flex-shrink: 0; }
.sidebar__chart-title { font-size: 0.5rem; text-transform: uppercase; letter-spacing: 0.14em; opacity: 0.25; margin-bottom: 0.5rem; }
.sidebar__chart-bars { display: flex; align-items: flex-end; gap: 2px; height: 36px; }
.sidebar__chart-col { flex: 1; min-height: 1px; background: var(--term-green); opacity: 0.5; transition: none; }
.sidebar__chart-col:nth-child(3n) { background: var(--safety); opacity: 0.6; }
.sidebar__chart-col:hover { opacity: 1; background: var(--base); }

.sidebar__log { flex: 1; overflow: hidden; position: relative; }
.sidebar__log-scroll { position: absolute; inset: 0; overflow-y: hidden; }
.sidebar__log-track { animation: logScrollV 60s linear infinite; }

@keyframes logScrollV { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }

.sidebar__log-entry { padding: 0.35rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.025); font-size: 0.6rem; line-height: 1.5; display: flex; gap: 0.5rem; align-items: baseline; }
.sidebar__log-entry:hover { background: rgba(255,255,255,0.03); }
.sidebar__log-time { color: rgba(255,255,255,0.12); flex-shrink: 0; font-size: 0.52rem; min-width: 5.5em; }
.sidebar__log-tag { font-size: 0.48rem; text-transform: uppercase; letter-spacing: 0.08em; padding: 0.1em 0.35em; border: 1px solid; flex-shrink: 0; }
.log-ok   { color: var(--term-green); border-color: rgba(0,255,102,0.25); }
.log-warn { color: var(--term-amber); border-color: rgba(255,170,0,0.25); }
.log-sys  { color: var(--safety);     border-color: rgba(255,62,0,0.25); }
.log-info { color: #66AAFF;           border-color: rgba(102,170,255,0.25); }
.sidebar__log-msg { color: rgba(255,255,255,0.4); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.sidebar__log::before, .sidebar__log::after { content: ''; position: absolute; left: 0; right: 0; height: 30px; z-index: 2; pointer-events: none; }
.sidebar__log::before { top: 0; background: linear-gradient(var(--term-bg), transparent); }
.sidebar__log::after  { bottom: 0; background: linear-gradient(transparent, var(--term-bg)); }

.sidebar__footer { padding: 0.5rem 1rem; border-top: 1px solid rgba(255,255,255,0.06); font-size: 0.5rem; text-transform: uppercase; letter-spacing: 0.12em; opacity: 0.15; display: flex; justify-content: space-between; flex-shrink: 0; }

.sidebar-toggle {
    display: none;
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    z-index: 1100;
    width: 48px;
    height: 48px;
    background: var(--ink);
    color: var(--term-green);
    border: 2px solid var(--safety);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: var(--shadow-safety);
    align-items: center;
    justify-content: center;
}

/* Responsive */
@media (max-width: 1024px) {
    .shell { grid-template-columns: 1fr; }
    .sidebar { display: none; width: 340px; }
    .sidebar.open { display: flex; }
    .sidebar-toggle { display: flex; }

    .features__grid { grid-template-columns: repeat(2, 1fr); }
    .feat-card:nth-child(3n) { border-right: var(--border-thin); }
    .feat-card:nth-child(2n) { border-right: none; }
    .feat-card:nth-last-child(-n+3) { border-bottom: var(--border-thin); }
    .feat-card:nth-last-child(-n+2) { border-bottom: none; }

    .ribbon { grid-template-columns: repeat(3, 1fr); }
    .ribbon__cell:nth-child(3) { border-right: none; }

    .signal__inner { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
    .features__grid { grid-template-columns: 1fr; }
    .feat-card, .feat-card:nth-child(3n), .feat-card:nth-child(2n) { border-right: none; border-bottom: var(--border-thin); }
    .feat-card:last-child { border-bottom: none; }

    .ribbon { grid-template-columns: 1fr 1fr; }
    .ribbon__cell { border-right: var(--border-thin); border-bottom: var(--border-thin); }
    .ribbon__cell:nth-child(2n) { border-right: none; }
    .ribbon__cell:last-child { border-bottom: none; }
}

@media (max-width: 480px) {
    .ribbon { grid-template-columns: 1fr; }
    .ribbon__cell { border-right: none; border-bottom: var(--border-thin); }
    .ribbon__cell:last-child { border-bottom: none; }
    .cta__actions { flex-direction: column; width: 100%; }
    .btn { width: 100%; }
}
