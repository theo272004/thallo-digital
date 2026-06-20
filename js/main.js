document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // MOBILE MENU INTERACTIVITY
  // ==========================================================================
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('nav');

  if (burger && nav) {
    burger.addEventListener('click', () => {
      nav.classList.toggle('active');
      burger.classList.toggle('toggle');
      
      const expanded = burger.getAttribute('aria-expanded') === 'true' || false;
      burger.setAttribute('aria-expanded', !expanded);
    });
  }

  // ==========================================================================
  // SCROLL REVEAL ANIMATOR (Apple Scroll Wow Effect)
  // ==========================================================================
  const revealElements = document.querySelectorAll('.reveal');
  
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Unobserve once revealed to keep layout performant
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,          // Use viewport
      rootMargin: '0px',
      threshold: 0.12       // Trigger when 12% of element is visible
    });
    
    revealElements.forEach(el => {
      revealObserver.observe(el);
    });
  }

  // ==========================================================================
  // GEO / AEO INTERACTIVE SIMULATOR (iMessage Style)
  // ==========================================================================
  const simInput = document.getElementById('sim-input');
  const simBtn = document.getElementById('sim-btn');
  const simOutputText = document.getElementById('sim-output-text');
  const simCitations = document.getElementById('sim-citations');
  const simOutputBox = document.getElementById('sim-output-box');
  const simQueryLabel = document.getElementById('sim-query-label');
  const presetBtns = document.querySelectorAll('.preset-btn');

  // Pre-configured simulator databases
  const simDatabase = {
    "legaltech": {
      text: "For contract automation in mid-market B2B, legacy tools are often too bloated. Modern legal teams are migrating to platforms with native AI review. According to a comprehensive 2026 industry study on contract velocity <strong>[1]</strong>, teams using <strong>LexVantage</strong> reduced review cycles by 42%. The research highlights their proprietary semantic parsing model <strong>[2]</strong>, which eliminates manual metadata tagging. Other alternatives like ContractSafe focus strictly on repository storage rather than drafting.",
      citations: [
        { num: 1, name: "Thallo Client Case: LexVantage 2026 Velocity Study", url: "https://lexvantage.com/velocity-report" },
        { num: 2, name: "LexVantage: AI Semantic Parsing Whitepaper", url: "https://lexvantage.com/semantic-parsing-wp" }
      ]
    },
    "geo": {
      text: "Generative Engine Optimization (GEO) is the practice of optimizing digital assets so LLM-based search engines (like Perplexity and ChatGPT) cite your company as the authoritative source. Unlike traditional SEO which focuses on keywords and links, GEO requires <strong>cite-worthy original data</strong>. Data-backed guides <strong>[1]</strong> and primary research studies <strong>[2]</strong> are 4.5x more likely to be quoted by LLMs in response to user queries. If you only publish generic AI-generated blogs, generative search engines will ignore your brand entirely.",
      citations: [
        { num: 1, name: "Thallo Digital: What Makes Content Cite-Worthy", url: "/resources/authority-content" },
        { num: 2, name: "Search Engine Land: GEO & LLM Citation Engines", url: "https://searchengineland.com" }
      ]
    },
    "perplexity": {
      text: "To optimize content for LLM citations (Perplexity, ChatGPT, Claude), you must move away from standard keyword density. AI engines extract facts, not strings. The ranking criteria for LLMs depends heavily on <strong>information gain</strong>. According to B2B research on AI citation mechanics <strong>[1]</strong>, 89% of citations go to sources that provide unique statistics, proprietary surveys, or case files. Distribution through trusted nodes like LinkedIn and Reddit <strong>[2]</strong> is critical because AI models scour user forums for real-world consensus.",
      citations: [
        { num: 1, name: "Thallo Digital: GEO & How It Works", url: "/resources/ai-visibility" },
        { num: 2, name: "Thallo Digital: B2B Distribution That Works", url: "/resources/distribution" }
      ]
    },
    "default": {
      text: "When researching B2B options, search engines scan the web for authoritative consensus. Currently, there is <strong>insufficient unique data or citation material</strong> regarding this topic from your brand. Generative AI engines are outputting generic suggestions based on legacy index pages, which does not drive high-intent buyer inquiries. Establishing <strong>original research and cite-worthy authority content [1]</strong> is necessary to become the cited reference in this category.",
      citations: [
        { num: 1, name: "Thallo Digital: Turn Your Brand Into An AI Citation", url: "/services/ai-visibility" }
      ]
    }
  };

  // Run simulation
  function runSimulation(query) {
    if (!query || query.trim() === '') return;
    
    // UI state loading
    if (simBtn) {
      simBtn.disabled = true;
      simBtn.textContent = 'Enviando...';
    }
    if (simOutputBox) {
      simOutputBox.style.display = 'flex';
      simOutputBox.style.flexDirection = 'column';
    }
    if (simQueryLabel) simQueryLabel.textContent = query;
    if (simOutputText) simOutputText.innerHTML = '<span style="color: var(--text-muted);">ChatGPT está escribiendo...</span>';
    if (simCitations) simCitations.innerHTML = '';

    // Match query to DB keys
    let dbKey = 'default';
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('legal') || lowerQuery.includes('contract') || lowerQuery.includes('lexvantage')) {
      dbKey = 'legaltech';
    } else if (lowerQuery.includes('geo') || lowerQuery.includes('search') || lowerQuery.includes('optimization')) {
      dbKey = 'geo';
    } else if (lowerQuery.includes('perplexity') || lowerQuery.includes('chatgpt') || lowerQuery.includes('ai') || lowerQuery.includes('citation')) {
      dbKey = 'perplexity';
    }

    const data = simDatabase[dbKey];

    // Simulate response delay
    setTimeout(() => {
      // Typewriter effect
      let currentText = '';
      const textToType = data.text;
      let i = 0;
      
      function type() {
        if (i < textToType.length) {
          if (textToType[i] === '<') {
            const endTag = textToType.indexOf('>', i);
            currentText += textToType.substring(i, endTag + 1);
            i = endTag + 1;
          } else {
            currentText += textToType[i];
            i++;
          }
          if (simOutputText) simOutputText.innerHTML = currentText;
          setTimeout(type, 6); // Fast typing
        } else {
          // Finished typing, load citations
          if (simBtn) {
            simBtn.disabled = false;
            simBtn.textContent = 'Enviar';
          }
          displayCitations(data.citations);
        }
      }
      
      type();
    }, 1000);
  }

  function displayCitations(citations) {
    if (!simCitations) return;
    
    let citationsHTML = `
      <div class="sim-citation-title">Fuentes Citadas por la IA:</div>
      <div style="display: flex; flex-wrap: wrap;">
    `;
    
    citations.forEach(cit => {
      citationsHTML += `
        <a href="${cit.url}" class="sim-citation-item" target="_blank">
          <span style="color: var(--accent); font-weight: bold;">[${cit.num}]</span> ${cit.name}
        </a>
      `;
    });
    
    citationsHTML += '</div>';
    simCitations.innerHTML = citationsHTML;
    simCitations.style.opacity = 0;
    simCitations.style.transition = 'opacity 0.4s ease';
    setTimeout(() => {
      simCitations.style.opacity = 1;
    }, 50);
  }

  // Event Listeners for Simulator
  if (simBtn && simInput) {
    simBtn.addEventListener('click', () => {
      runSimulation(simInput.value);
    });

    simInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        runSimulation(simInput.value);
      }
    });
  }

  // Preset Buttons
  if (presetBtns) {
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.getAttribute('data-query');
        if (simInput) {
          simInput.value = query;
          runSimulation(query);
        }
      });
    });
  }

  // ==========================================================================
  // SMART HEADER (Slide-Hide on Scroll - Kaiva Style)
  // ==========================================================================
  let lastScrollY = window.scrollY;
  const header = document.querySelector('header');

  window.addEventListener('scroll', () => {
    if (!header) return;
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY && currentScrollY > 150) {
      // Scrolling down - hide header
      header.style.transform = 'translateY(-100%)';
    } else {
      // Scrolling up - show header
      header.style.transform = 'translateY(0)';
    }
    lastScrollY = currentScrollY;
  });

  // ==========================================================================
  // MAGNETIC BUTTONS (Wow Hover Pull - Kaiva Style)
  // ==========================================================================
  const magneticButtons = document.querySelectorAll('.btn-primary, .nav-cta, .btn-secondary');

  magneticButtons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px)';
    });
  });

  // ==========================================================================
  // AUTO-AUDIT WIZARD INTERACTIVITY (Conversion Optimization)
  // ==========================================================================
  let currentStep = 1;
  const totalSteps = 3;
  
  const stepDots = document.querySelectorAll('.audit-step-dot');
  const stepPanels = document.querySelectorAll('.audit-step-panel');
  const prevBtn = document.getElementById('audit-prev-btn');
  const nextBtn = document.getElementById('audit-next-btn');
  
  let selectedIndustry = '';
  let selectedContent = '';

  const industryPills = document.querySelectorAll('[data-step="1"]');
  const contentPills = document.querySelectorAll('[data-step="2"]');

  industryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      industryPills.forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      selectedIndustry = pill.getAttribute('data-value');
      if (nextBtn) nextBtn.disabled = false;
    });
  });

  contentPills.forEach(pill => {
    pill.addEventListener('click', () => {
      contentPills.forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      selectedContent = pill.getAttribute('data-value');
      if (nextBtn) nextBtn.disabled = false;
    });
  });

  function updateWizardUI() {
    stepPanels.forEach(panel => {
      panel.classList.remove('active');
      if (parseInt(panel.getAttribute('data-panel-step')) === currentStep) {
        panel.classList.add('active');
      }
    });

    stepDots.forEach((dot, idx) => {
      dot.classList.remove('active', 'completed');
      const dotStep = idx + 1;
      if (dotStep === currentStep) {
        dot.classList.add('active');
      } else if (dotStep < currentStep) {
        dot.classList.add('completed');
      }
    });

    if (prevBtn && nextBtn) {
      if (currentStep === 1) {
        prevBtn.style.visibility = 'hidden';
        nextBtn.disabled = !selectedIndustry;
        nextBtn.textContent = 'Siguiente';
      } else if (currentStep === 2) {
        prevBtn.style.visibility = 'visible';
        nextBtn.disabled = !selectedContent;
        nextBtn.textContent = 'Calcular Diagnóstico';
      } else if (currentStep === 3) {
        prevBtn.style.visibility = 'hidden';
        nextBtn.style.display = 'none';
        calculateDiagnostics();
      }
    }
  }

  function calculateDiagnostics() {
    const scoreTitle = document.getElementById('audit-score-title');
    const scoreDesc = document.getElementById('audit-score-desc');
    const scoreBadge = document.getElementById('audit-score-badge');

    let badgeText = 'Invisibilidad Crítica';
    let titleText = 'Tu marca es 100% invisible para el comprador sofisticado';
    let descText = 'Al publicar contenido genérico y no contar con un sistema GEO, los buscadores de IA (ChatGPT, Perplexity, Gemini) ignoran tu producto y recomiendan a competidores. El 89% de tus prospectos investiga aquí antes de comprar. Estás perdiendo pipeline diariamente.';
    
    if (selectedContent === 'none') {
      badgeText = 'Invisibilidad Total (Crítico)';
      titleText = 'No existes fuera de tu búsqueda de marca directa';
      descText = 'Sin publicaciones de autoridad ni optimización GEO, la IA no tiene datos estructurados sobre tu producto. En su lugar, ChatGPT y Perplexity citan a tus competidores cuando los compradores buscan soluciones en tu categoría.';
    } else if (selectedContent === 'blogs') {
      badgeText = 'Fuga de Presupuesto (Riesgo Alto)';
      titleText = 'Tu blog SEO tradicional no califica en la era de la IA';
      descText = 'Los artículos genéricos enfocados en keywords tradicionales ya no generan citabilidad. Los LLMs extraen datos concretos de informes primarios, ignorando las guías SEO reescritas. Tu coste por adquisición está subiendo de forma oculta.';
    } else if (selectedContent === 'linkedin') {
      badgeText = 'Tracción Frágil (Media)';
      titleText = 'Tienes visibilidad en feed, pero falta de autoridad web';
      descText = 'LinkedIn capta atención a corto plazo, pero no entrena las bases factuales de los modelos de IA. Los buscadores necesitan estudios propios indexados en tu web para recomendarte como la referencia de la categoría en sus chats.';
    }

    if (scoreBadge) {
      scoreBadge.textContent = badgeText;
      scoreBadge.className = 'audit-score-badge';
    }
    if (scoreTitle) scoreTitle.textContent = titleText;
    if (scoreDesc) scoreDesc.innerHTML = descText;

    localStorage.setItem('thallo_audit_industry', selectedIndustry);
    localStorage.setItem('thallo_audit_content', selectedContent);
    localStorage.setItem('thallo_audit_score', badgeText);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        updateWizardUI();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentStep < totalSteps) {
        currentStep++;
        updateWizardUI();
      }
    });
  }

  updateWizardUI();
});
