// script.js — Refactored for GitHub Pages
document.addEventListener('DOMContentLoaded', () => {

    /* ==== SPARKLINE UTILITY ==== */
    function drawSparkline(el, count, color) {
        el.innerHTML = '';
        const w = 60, h = 20;
        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('width', w);
        svg.setAttribute('height', h);
        svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
        const pts = [];
        for (let i = 0; i < Math.max(2, count); i++) {
            const x = 4 + i * ((w - 8) / Math.max(1, count - 1));
            const jitter = Math.random() * 6 - 3;
            const y = h/2 + (i % 2 ? -6 : 6) + jitter;
            pts.push([x, Math.max(2, Math.min(h-2, y))]);
        }
        const d = pts.map((p,i)=> (i===0?`M ${p[0]} ${p[1]}`:`L ${p[0]} ${p[1]}`)).join(' ');
        const path = document.createElementNS(svgNS,'path');
        path.setAttribute('d', d);
        path.setAttribute('fill','none');
        path.setAttribute('stroke', color || '#8b5e3c');
        path.setAttribute('stroke-width','1.6');
        path.setAttribute('stroke-linecap','round');
        path.setAttribute('stroke-linejoin','round');
        svg.appendChild(path);
        el.appendChild(svg);
    }

    /* ==== THEME CARD INTERACTIVITY ==== */
    const cards = Array.from(document.querySelectorAll('.theme-card'));

    // Populate cards from data-* attributes
    cards.forEach(card => {
        const color = card.dataset.color || '#8b5e3c';
        const prompts = card.dataset.prompts ? card.dataset.prompts.split(',').map(s=>s.trim()) : [];
        const feature = card.dataset.feature || '';

        // Accent & dot
        const accentEl = card.querySelector('.theme-accent');
        const dotEl = card.querySelector('.theme-dot');
        if(accentEl) accentEl.style.background = color;
        if(dotEl) dotEl.style.background = color;

        // Featured text
        const ft = card.querySelector('.featured-text');
        if(ft) ft.textContent = feature;

        // Sparkline
        const sparkEl = card.querySelector('.sparkline');
        if(sparkEl) drawSparkline(sparkEl, prompts.length, color);

        // Default target for view-prompts
        const viewBtn = card.querySelector('.view-prompts');
        if(viewBtn && prompts.length > 0 && !viewBtn.dataset.target) {
            viewBtn.dataset.target = `prompt-${prompts[0]}`;
        }
    });

    // Only-one-open behavior
    function closeAll(except=null){
        cards.forEach(c => {
            if(c !== except){
                c.classList.remove('open');
                c.setAttribute('aria-expanded','false');
            }
        });
    }

    // Card interactions
    cards.forEach(card => {
        const toggle = () => {
            const opening = !card.classList.contains('open');
            if(opening){
                closeAll(card);
                card.classList.add('open');
                card.setAttribute('aria-expanded','true');
            } else {
                card.classList.remove('open');
                card.setAttribute('aria-expanded','false');
            }
        };

        // Click toggle (ignore buttons inside)
        card.addEventListener('click', e => {
            if(e.target.closest('button')) return;
            toggle();
        });

        // Keyboard toggle
        card.addEventListener('keydown', e => {
            if(e.key === 'Enter' || e.key === ' '){
                e.preventDefault();
                toggle();
            } else if(e.key === 'Escape'){
                card.classList.remove('open');
            }
        });

        // Tilt / parallax
        card.addEventListener('mousemove', ev => {
            const r = card.getBoundingClientRect();
            const px = (ev.clientX - r.left) / r.width;
            const py = (ev.clientY - r.top) / r.height;
            const ry = (px - 0.5) * 8;
            const rx = (0.5 - py) * 6;
            card.style.setProperty('--rx', rx+'deg');
            card.style.setProperty('--ry', ry+'deg');
        });
        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--rx','0deg');
            card.style.setProperty('--ry','0deg');
        });
    });

    /* ==== VIEW-PROMPTS SCROLL ==== */
    document.querySelectorAll('.view-prompts').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const targetId = btn.dataset.target;
            if(!targetId) return;
            const target = document.getElementById(targetId);
            if(target){
                target.scrollIntoView({behavior:'smooth', block:'start'});
                target.classList.add('flash');
                setTimeout(()=>target.classList.remove('flash'), 1400);
            }
        });
    });

    /* ==== NAV SMOOTH SCROLL ==== */
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e){
            e.preventDefault();
            const targetID = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetID);
            if(targetSection){
                targetSection.scrollIntoView({behavior:'smooth'});
            }
        });
    });

    /* ==== FADE-IN ON SCROLL ==== */
    const fadeElements = document.querySelectorAll('.final-synthesis p');
    const fadeInOnScroll = () => {
        const triggerBottom = window.innerHeight * 0.85;
        fadeElements.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            if(elementTop < triggerBottom){
                el.classList.add('fade-in');
            }
        });
    };
    window.addEventListener('scroll', fadeInOnScroll);
    fadeInOnScroll(); // initial call
});
