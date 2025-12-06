// script.js — Theme card interactivity (vanilla JS)

/* Utility: draw a tiny sparkline in a .sparkline element.
   We'll render a simple line whose length corresponds to count of prompts.
*/
function drawSparkline(el, count, color) {
    // clear
    el.innerHTML = '';
    const w = 60, h = 20;
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    // generate simple points
    const pts = [];
    for (let i = 0; i < Math.max(2, count); i++) {
        const x = 4 + i * ((w - 8) / Math.max(1, count-1));
        const jitter = Math.random()*6 - 3;
        const y = h/2 + (i % 2 ? -6 : 6) + jitter;
        pts.push([x, Math.max(2, Math.min(h-2, y))]);
    }
    // path string
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

/* Expand/collapse logic, tilt effect, populate featured prompt text and sparkline */
document.addEventListener('DOMContentLoaded', () => {
    const cards = Array.from(document.querySelectorAll('.theme-card'));

    // populate cards from data-* attributes
    cards.forEach(card => {
        const color = card.dataset.color || '#8b5e3c';
        const prompts = card.dataset.prompts ? card.dataset.prompts.split(',').map(s=>s.trim()) : [];
        const feature = card.dataset.feature || '';
        // set accent color
        const accentEl = card.querySelector('.theme-accent');
        const dotEl = card.querySelector('.theme-dot');
        if (accentEl) accentEl.style.background = color;
        if (dotEl) dotEl.style.background = color;
        // featured text
        const ft = card.querySelector('.featured-text');
        if (ft) ft.textContent = feature;
        // sparkline
        const sparkEl = card.querySelector('.sparkline');
        if (sparkEl) drawSparkline(sparkEl, prompts.length, color);
        // set view-prompts button target to first prompt id if missing
        const viewBtn = card.querySelector('.view-prompts');
        if (viewBtn && prompts.length>0 && !viewBtn.dataset.target) {
            viewBtn.dataset.target = `prompt-${prompts[0]}`;
        }
    });

    // only-one-open behavior: close others when opening new one
    function closeAll(except=null){
        cards.forEach(c => {
            if (c !== except) {
                c.classList.remove('open');
                c.setAttribute('aria-expanded','false');
                // reset max-height (handled by CSS class)
            }
        });
    }

    cards.forEach(card => {
        // click / keyboard
        const toggle = () => {
            const opening = !card.classList.contains('open');
            if (opening) {
                closeAll(card);
                card.classList.add('open');
                card.setAttribute('aria-expanded','true');
            } else {
                card.classList.remove('open');
                card.setAttribute('aria-expanded','false');
            }
        };

        card.addEventListener('click', (e) => {
            // avoid clicks on buttons inside
            if (e.target.closest('button')) return;
            toggle();
        });

        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle();
            } else if (e.key === 'Escape') {
                card.classList.remove('open');
            }
        });

        // tilt/parallax on mouse move
        card.addEventListener('mousemove', (ev) => {
            const r = card.getBoundingClientRect();
            const px = (ev.clientX - r.left) / r.width;
            const py = (ev.clientY - r.top) / r.height;
            const ry = (px - 0.5) * 8; // rotateY
            const rx = (0.5 - py) * 6; // rotateX
            card.style.setProperty('--rx', rx + 'deg');
            card.style.setProperty('--ry', ry + 'deg');
        });
        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--rx','0deg');
            card.style.setProperty('--ry','0deg');
        });

        // animate icon on open/close (small bounce)
        // icon handled via CSS .open selector

    });

    // view-prompts button scroll behavior (smooth)
    document.querySelectorAll('.view-prompts').forEach(btn=>{
        btn.addEventListener('click', (e)=>{
            e.stopPropagation();
            const targetId = btn.dataset.target;
            if (!targetId) return;
            const target = document.getElementById(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // optionally highlight for a moment
                target.classList.add('flash');
                setTimeout(()=> target.classList.remove('flash'), 1400);
            } else {
                // fallback: locate by heading text that contains prompt number
                const selector = `[id^="prompt-${targetId.split('-').pop()}"], .card-header`;
                // do nothing if not found
            }
        });
    });

});

// Smooth scrolling for navigation links
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetID = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetID);
        targetSection.scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Fade-in effect on scroll for paragraphs in Final Synthesis
const fadeElements = document.querySelectorAll('.final-synthesis p');

const fadeInOnScroll = () => {
    const triggerBottom = window.innerHeight * 0.85; // start fading when element is 85% down the viewport

    fadeElements.forEach(el => {
        const elementTop = el.getBoundingClientRect().top;
        if(elementTop < triggerBottom){
            el.classList.add('fade-in');
        }
    });
};

// Initialize scroll listener
window.addEventListener('scroll', fadeInOnScroll);

// Initial call to show elements already in view
fadeInOnScroll();
