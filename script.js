/* ===========================================================
   SWASTHYA CONNECT — shared behaviour
   =========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Mobile nav toggle ---- */
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggle && nav){
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
  }

  /* ---- Mark active nav link ---- */
  const current = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.main-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === current) a.classList.add('active');
  });

  /* ---- Accordion (FAQs) ---- */
  document.querySelectorAll('.accordion-item').forEach(item => {
    const trigger = item.querySelector('.acc-trigger');
    const panel = item.querySelector('.acc-panel');
    if (!trigger || !panel) return;
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.accordion-item.open').forEach(openItem => {
        if (openItem !== item){
          openItem.classList.remove('open');
          openItem.querySelector('.acc-panel').style.maxHeight = null;
        }
      });
      if (isOpen){
        item.classList.remove('open');
        panel.style.maxHeight = null;
      } else {
        item.classList.add('open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  /* ---- Contact form (front-end only demo) ---- */
  const form = document.querySelector('.contact-form');
  if (form){
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const status = form.querySelector('.form-status');
      if (status){
        status.textContent = 'Thanks — your message has been noted. This is a demo form for the CSP project, so nothing is sent to a live server.';
        status.classList.add('show');
      }
      form.reset();
    });
  }
});

/* ===========================================================
   SAATHI — rule-based wellness assistant widget
   Lightweight keyword matcher, no external calls, runs fully
   client-side so the widget works on every page of the site.
   =========================================================== */
(function(){
  const KB = [
    { keys: ['hand', 'wash', 'handwash', 'sanitiz'],
      reply: "Wash hands for at least 20 seconds with soap, covering palms, between fingers, and under nails. If soap isn't available, use a sanitiser with 60%+ alcohol. Want tips for before/after specific activities? Ask me about 'food hygiene' or 'after travel'." },
    { keys: ['water', 'drink', 'hydrat'],
      reply: "Aim for 8–10 glasses of water a day, more in heat or after exercise. Boil or filter water from unknown sources before drinking. Check the Health Tips page for a hydration tracker idea." },
    { keys: ['sleep', 'insomnia', 'tired'],
      reply: "Adults generally need 7–9 hours of sleep. Keep a consistent bedtime, dim screens an hour before bed, and avoid caffeine late in the day. See the Digital Wellness page for screen-time-before-bed guidance." },
    { keys: ['screen time', 'screen', 'phone addiction', 'social media', 'doomscroll'],
      reply: "Try the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds. Set app timers for social media and keep phones out of the bedroom at night. The Digital Wellness page has a full self-check." },
    { keys: ['hygiene', 'clean', 'sanitation'],
      reply: "Personal hygiene basics: daily bathing, brushing twice a day, clean clothes, trimmed nails, and regular handwashing. Visit the Hygiene page for a printable daily checklist." },
    { keys: ['menstrual', 'period', 'sanitary'],
      reply: "Change sanitary products every 4–6 hours, wash hands before and after, and dispose of products properly wrapped. The Hygiene page has a dedicated menstrual hygiene section." },
    { keys: ['diet', 'nutrition', 'food', 'eat'],
      reply: "Balance your plate: half vegetables/fruit, a quarter whole grains, a quarter protein. Limit ultra-processed snacks and added sugar. Check Health Tips for a sample weekly plate guide." },
    { keys: ['exercise', 'workout', 'fitness', 'walk'],
      reply: "150 minutes of moderate activity a week (about 22 minutes a day) supports heart, mood, and sleep. Brisk walking counts! See Health Tips for a beginner weekly plan." },
    { keys: ['stress', 'anxiety', 'mental health', 'burnout'],
      reply: "Short breathing breaks (4 seconds in, 6 seconds out, for 2 minutes) can lower stress quickly. Digital Wellness covers mindful tech habits, and it's always okay to talk to someone you trust or a counsellor." },
    { keys: ['privacy', 'password', 'scam', 'phishing', 'fraud'],
      reply: "Use unique passwords with a manager, enable two-factor authentication, and never share OTPs. Be wary of urgent messages asking for money or personal details. Full checklist on the Digital Wellness page." },
    { keys: ['contact', 'reach', 'email', 'phone number', 'support'],
      reply: "You can reach the Swasthya Connect team through the Contact page — there's a message form and listed contact details there." },
    { keys: ['hello', 'hi', 'hey', 'namaste'],
      reply: "Namaste! I'm Saathi, your wellness companion for this site. Ask me about hand hygiene, sleep, screen time, nutrition, mental wellbeing, or online safety." },
    { keys: ['thank'],
      reply: "Happy to help — stay well! Feel free to ask about another topic anytime." }
  ];

  const FALLBACK = "I don't have a specific tip for that yet, but you can explore the Health Tips, Hygiene, or Digital Wellness pages from the menu — or try asking about handwashing, sleep, screen time, nutrition, or online safety.";

  function findReply(text){
    const t = text.toLowerCase();
    for (const entry of KB){
      if (entry.keys.some(k => t.includes(k))) return entry.reply;
    }
    return FALLBACK;
  }

  function buildWidget(){
    const launcher = document.createElement('button');
    launcher.id = 'saathi-launcher';
    launcher.setAttribute('aria-label', 'Open Saathi wellness assistant');
    launcher.innerHTML = '💬';

    const win = document.createElement('div');
    win.id = 'saathi-window';
    win.innerHTML = `
      <div class="saathi-head">
        <div class="who"><span class="dot"></span> Saathi · Wellness Assistant</div>
        <button class="saathi-close" aria-label="Close chat">&times;</button>
      </div>
      <div id="saathi-body"></div>
      <div class="saathi-suggestions">
        <button class="saathi-chip" data-q="hand hygiene">Hand hygiene</button>
        <button class="saathi-chip" data-q="screen time">Screen time</button>
        <button class="saathi-chip" data-q="sleep tips">Sleep tips</button>
        <button class="saathi-chip" data-q="online safety">Online safety</button>
      </div>
      <form id="saathi-form">
        <input id="saathi-input" type="text" autocomplete="off" placeholder="Ask about health, hygiene, or digital wellness..." aria-label="Type your question" />
        <button id="saathi-send" type="submit">Send</button>
      </form>
    `;

    document.body.appendChild(launcher);
    document.body.appendChild(win);

    const body = win.querySelector('#saathi-body');

    function addMsg(text, who){
      const div = document.createElement('div');
      div.className = 'saathi-msg ' + who;
      div.textContent = text;
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
    }

    function greet(){
      if (body.children.length === 0){
        addMsg("Namaste! I'm Saathi 🌿 Ask me anything about health tips, hygiene, or digital wellness — or tap a suggestion below.", 'bot');
      }
    }

    launcher.addEventListener('click', () => {
      win.classList.toggle('open');
      if (win.classList.contains('open')){
        greet();
        win.querySelector('#saathi-input').focus();
      }
    });
    win.querySelector('.saathi-close').addEventListener('click', () => win.classList.remove('open'));

    win.querySelectorAll('.saathi-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const q = chip.getAttribute('data-q');
        addMsg(q, 'user');
        setTimeout(() => addMsg(findReply(q), 'bot'), 280);
      });
    });

    const form = win.querySelector('#saathi-form');
    const input = win.querySelector('#saathi-input');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (!val) return;
      addMsg(val, 'user');
      input.value = '';
      setTimeout(() => addMsg(findReply(val), 'bot'), 280);
    });
  }

  document.addEventListener('DOMContentLoaded', buildWidget);
})();
