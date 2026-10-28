/* ==========================================================================
   Hampton Roads Primary Care - Official Site Motion & Interactive Layer
   1. Scroll Reveal Observer ([data-reveal])
   2. Signature Move: Index with Preview (.poster-index)
   3. The One Live Thing: Interactive Coverage & Visit Pass (#plan-select, #visit-select)
   4. Callback Bar Submission Handler (#callback-form)
   5. Reduced-Motion Video Guard
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- 0. Responsive Mobile Navigation & Submenu Accordions ---------- */
  const siteNav = document.getElementById('site-nav');
  const navToggle = document.getElementById('nav-toggle');
  const toggleLabel = navToggle ? navToggle.querySelector('.site-nav__toggle-label') : null;
  const subToggles = siteNav ? siteNav.querySelectorAll('.site-nav__sub-toggle') : [];

  function closeAllSubmenus(exceptItem) {
    if (!siteNav) return;
    siteNav.querySelectorAll('.site-nav__item.is-sub-open').forEach((item) => {
      if (item !== exceptItem) {
        item.classList.remove('is-sub-open');
        const btn = item.querySelector('.site-nav__sub-toggle');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function setNavOpen(open) {
    if (!siteNav || !navToggle) return;
    siteNav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (toggleLabel) {
      toggleLabel.textContent = open ? 'Close' : 'Menu';
    }
    if (!open) {
      closeAllSubmenus(null);
    }
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = siteNav.classList.contains('is-open');
      setNavOpen(!isOpen);
    });

    subToggles.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const parentItem = btn.closest('.site-nav__item');
        if (!parentItem) return;
        const willOpen = !parentItem.classList.contains('is-sub-open');
        closeAllSubmenus(parentItem);
        parentItem.classList.toggle('is-sub-open', willOpen);
        btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        setNavOpen(false);
      }
    });

    document.addEventListener('click', (e) => {
      if (siteNav.classList.contains('is-open') && !siteNav.contains(e.target)) {
        setNavOpen(false);
      }
    });
  }

  /* ---------- 1. Reduced-Motion Guard for Video Loops & Hero Fading Slideshow ---------- */
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const videos = document.querySelectorAll('video[autoplay]');
  const heroSlides = document.querySelectorAll('#hero-slider .hero-slide');
  let heroSlideIndex = 0;
  let heroSlideTimer = null;

  function stepHeroSlide() {
    if (heroSlides.length < 2) return;
    heroSlides[heroSlideIndex].classList.remove('is-active');
    heroSlideIndex = (heroSlideIndex + 1) % heroSlides.length;
    const nextSlide = heroSlides[heroSlideIndex];
    if (nextSlide.getAttribute('loading') === 'lazy') {
      nextSlide.removeAttribute('loading');
    }
    nextSlide.classList.add('is-active');
  }

  function syncHeroSlideshow() {
    if (heroSlideTimer) {
      clearInterval(heroSlideTimer);
      heroSlideTimer = null;
    }
    if (!reducedMotionQuery.matches && heroSlides.length > 1) {
      heroSlides.forEach((img, idx) => {
        if (idx > 0) {
          img.removeAttribute('loading');
        }
      });
      heroSlideTimer = setInterval(stepHeroSlide, 4800);
    }
  }

  function syncVideoMotion() {
    videos.forEach((vid) => {
      if (reducedMotionQuery.matches) {
        vid.pause();
        vid.removeAttribute('autoplay');
      } else {
        vid.play().catch(() => {});
      }
    });
    syncHeroSlideshow();
  }

  syncVideoMotion();
  if (typeof reducedMotionQuery.addEventListener === 'function') {
    reducedMotionQuery.addEventListener('change', syncVideoMotion);
  }

  /* ---------- 2. Section Part Entrances ([data-reveal]) ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window && revealEls.length > 0) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.08
      }
    );

    revealEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
        el.classList.add('is-in');
      } else {
        io.observe(el);
      }
    });

    const revealVisibleNow = () => {
      const sy = window.scrollY || document.documentElement.scrollTop || 0;
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight * 2.5);
      if (sy >= maxScroll) {
        revealEls.forEach((el) => {
          el.classList.add('is-in');
          io.unobserve(el);
        });
        return;
      }
      revealEls.forEach((el) => {
        if (el.classList.contains('is-in')) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 1.4 && rect.bottom > -50) {
          el.classList.add('is-in');
          io.unobserve(el);
        }
      });
    };

    window.addEventListener('scroll', revealVisibleNow, { passive: true });
    window.addEventListener('wheel', revealVisibleNow, { passive: true });
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- 3. Signature Move: Index with Preview ---------- */
  const indexWrap = document.getElementById('service-poster-index');
  const previewFrame = indexWrap ? indexWrap.querySelector('.poster-index__frame') : null;
  const previewImg = document.getElementById('poster-preview-img');

  if (indexWrap && previewFrame && previewImg) {
    const rows = indexWrap.querySelectorAll('.poster-index__row');

    rows.forEach((row) => {
      const showPreview = () => {
        const src = row.getAttribute('data-preview');
        const alt = row.getAttribute('data-alt') || '';
        if (src && previewImg.getAttribute('src') !== src) {
          previewImg.setAttribute('src', src);
          previewImg.setAttribute('alt', alt);
        }
        const wrapRect = indexWrap.getBoundingClientRect();
        const rowRect = row.getBoundingClientRect();
        const offsetY = Math.max(0, rowRect.top - wrapRect.top - 24);
        previewFrame.style.transform = 'translate3d(0, ' + Math.round(offsetY) + 'px, 0)';
        previewFrame.classList.add('is-open');
      };

      row.addEventListener('pointerenter', showPreview);
      row.addEventListener('focus', showPreview);
    });

    indexWrap.addEventListener('pointerleave', () => {
      previewFrame.classList.remove('is-open');
    });

    indexWrap.addEventListener('focusout', (e) => {
      if (!indexWrap.contains(e.relatedTarget)) {
        previewFrame.classList.remove('is-open');
      }
    });
  }

  /* ---------- 4. The One Live Thing: Interactive Coverage & Visit Pass ---------- */
  const planSelect = document.getElementById('plan-select');
  const visitSelect = document.getElementById('visit-select');
  const ticketBadge = document.getElementById('ticket-badge');
  const ticketPrice = document.getElementById('ticket-price');
  const ticketSummary = document.getElementById('ticket-summary');
  const ticketCta = document.getElementById('ticket-cta');
  const ticketNetTitle = document.getElementById('ticket-network-title');
  const ticketNetDesc = document.getElementById('ticket-network-desc');

  const COVERAGE_DATA = {
    medicare: {
      badge: 'In-Network Virginia Plan',
      netTitle: 'Virginia Medicare & Medicaid Accepted',
      netDesc: 'Active Part B, Medicare Advantage, and Virginia Medicaid plans accepted at Suite 622 in Portsmouth.',
      cta: 'Book With Medicare',
      visits: {
        wellness: {
          price: '$0 Copay',
          summary: 'Annual Medicare Wellness and preventive visits are covered at 100% with no deductible on eligible plans.'
        },
        chronic: {
          price: 'In-Network',
          summary: 'Standard Part B or Medicaid copay applies for diabetes, blood pressure, heart failure, and COPD management.'
        },
        acute: {
          price: 'Same-Day',
          summary: 'Urgent sick visits for flu, strep, sinus infections, and minor injuries billed directly to Medicare or Medicaid.'
        },
        telehealth: {
          price: 'Covered',
          summary: 'HIPAA-compliant video visits across Virginia covered at standard in-network primary care rates.'
        }
      }
    },
    tricare: {
      badge: 'Military & Family Coverage',
      netTitle: 'TRICARE Prime & Select Welcome',
      netDesc: 'Led by a 10-year U.S. Navy Special Operations IDC-proudly serving Naval Medical Center Portsmouth & Norfolk families.',
      cta: 'Book With TRICARE',
      visits: {
        wellness: {
          price: '$0 Preventive',
          summary: 'Covered clinical preventive exams, immunizations, and health screenings for eligible TRICARE beneficiaries.'
        },
        chronic: {
          price: 'TRICARE Rate',
          summary: 'Continuity of care for blood pressure, metabolic health, and post-service transition medicine.'
        },
        acute: {
          price: 'Same-Week',
          summary: 'Fast Portsmouth waterfront appointments for acute illness or minor injury without hospital wait times.'
        },
        telehealth: {
          price: 'Video Visit',
          summary: 'Secure Virginia telemedicine consultations for prescriptions, lab reviews, and follow-up care.'
        }
      }
    },
    commercial: {
      badge: 'Commercial Network Plan',
      netTitle: 'Anthem BCBS & Sentara Health Plans',
      netDesc: 'In-network primary care for employer, individual marketplace, and municipal plans across Hampton Roads.',
      cta: 'Book Commercial Visit',
      visits: {
        wellness: {
          price: '$0 Physical',
          summary: 'Most ACA-compliant Anthem and Sentara plans cover one annual preventive physical per year at $0 copay.'
        },
        chronic: {
          price: 'PCP Copay',
          summary: 'Billed at your primary care office visit copay for ongoing chronic condition and medication management.'
        },
        acute: {
          price: 'PCP Copay',
          summary: 'Save compared to urgent care or ER copays with a same-day primary care sick visit in Downtown Portsmouth.'
        },
        telehealth: {
          price: 'PCP Copay',
          summary: 'Virtual visits from work or home anywhere in Virginia billed as a standard primary care consultation.'
        }
      }
    },
    sliding: {
      badge: 'Income-Based Discount',
      netTitle: 'Sliding-Scale Fee Program',
      netDesc: 'No one will be denied access to service due to inability to pay. Discounts scale by household size and income.',
      cta: 'Request Sliding Scale',
      visits: {
        wellness: {
          price: 'Scaled Fee',
          summary: 'Upfront Good Faith Estimate provided before your annual physical, lab panel, or preventive screening.'
        },
        chronic: {
          price: 'Scaled Fee',
          summary: 'Affordable ongoing visits and generic medication guidance for hypertension, diabetes, and asthma.'
        },
        acute: {
          price: 'Scaled Fee',
          summary: 'Transparent self-pay and sliding-scale rates for acute sick care and minor injury treatment.'
        },
        telehealth: {
          price: 'Scaled Fee',
          summary: 'Reduced-fee Virginia video consultations with clear written pricing before your appointment begins.'
        }
      }
    }
  };

  function updateTicket() {
    if (!planSelect || !visitSelect) return;
    const planKey = planSelect.value || 'medicare';
    const visitKey = visitSelect.value || 'wellness';
    const plan = COVERAGE_DATA[planKey] || COVERAGE_DATA.medicare;
    const visit = plan.visits[visitKey] || plan.visits.wellness;

    if (ticketBadge) ticketBadge.textContent = plan.badge;
    if (ticketPrice) ticketPrice.textContent = visit.price;
    if (ticketSummary) ticketSummary.textContent = visit.summary;
    if (ticketCta) ticketCta.textContent = plan.cta;
    if (ticketNetTitle) ticketNetTitle.textContent = plan.netTitle;
    if (ticketNetDesc) ticketNetDesc.textContent = plan.netDesc;
  }

  if (planSelect && visitSelect) {
    planSelect.addEventListener('change', updateTicket);
    visitSelect.addEventListener('change', updateTicket);
  }

  /* ---------- 5. Three-Cell Callback Bar Submission ---------- */
  const callbackForm = document.getElementById('callback-form');
  const callbackStatus = document.getElementById('callback-status');
  const callbackSubmit = document.getElementById('cb-submit');

  if (callbackForm) {
    callbackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('cb-name');
      const phoneInput = document.getElementById('cb-phone');
      const reasonInput = document.getElementById('cb-reason');

      const name = nameInput ? nameInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const reason = reasonInput ? reasonInput.value : 'Appointment Request';

      if (!name || !phone) return;

      if (callbackSubmit) {
        callbackSubmit.textContent = 'Request Prepared';
      }
      if (callbackStatus) {
        callbackStatus.textContent =
          'Thank you, ' + name + '. Calling (757) 516-7554 or opening your email client to confirm ' + reason + ' at ' + phone + '.';
      }

      const subject = encodeURIComponent('Callback Request: ' + reason + ' - ' + name);
      const body = encodeURIComponent(
        'Patient Name: ' + name + '\nPhone: ' + phone + '\nVisit Type: ' + reason + '\nClinic: 355 Crawford St, Suite 622, Portsmouth, VA'
      );
      window.location.href = 'mailto:info@htrpc.com?subject=' + subject + '&body=' + body;
    });
  }

  /* ---------- 6. About Page: Interactive Clinician Care Matcher ---------- */
  const needSelect = document.getElementById('need-select');
  const visitPrefSelect = document.getElementById('visit-pref-select');
  const matchName = document.getElementById('provider-match-name');
  const matchRole = document.getElementById('provider-match-role');
  const matchDesc = document.getElementById('provider-match-desc');
  const matchCta = document.getElementById('provider-match-cta');

  const CLINICIAN_MATCH = {
    cardio: {
      name: 'Laurie A. Salerno, ANP-BC',
      role: 'MS SUNY Buffalo · 34 Years in Cardiology, Internal Medicine & Nutrition',
      desc: 'Recommended for hypertension, heart failure, atrial fibrillation, Type 2 diabetes, cholesterol management, and food-based metabolic care.',
      anchor: '#laurie-salerno'
    },
    acute: {
      name: 'Aaron Sents, PA-C',
      role: 'MMS Yale University · 10-Yr U.S. Navy Special Ops IDC · Emergency Medicine',
      desc: 'Recommended for veteran and TRICARE transition care, same-day acute illness, minor injuries, men’s health, and comprehensive preventive physicals.',
      anchor: '#aaron-sents'
    },
    family: {
      name: 'Shanice Edwards, NP-BC, MSN, BSN',
      role: 'MSN Walden University · Norfolk State BSN · Family & Trauma-Informed Care',
      desc: 'Recommended for family primary care, women’s wellness exams, anxiety and depression management, medication adherence, and whole-person prevention.',
      anchor: '#shanice-edwards'
    }
  };

  function updateClinicianMatch() {
    if (!needSelect) return;
    const key = needSelect.value || 'cardio';
    const pref = visitPrefSelect ? visitPrefSelect.value : 'office';
    const item = CLINICIAN_MATCH[key] || CLINICIAN_MATCH.cardio;
    const modeNote =
      pref === 'telehealth'
        ? ' Available via HIPAA-compliant Virginia video visit or in Portsmouth.'
        : ' Available in-person at 355 Crawford Street, Suite 622 in Downtown Portsmouth.';

    if (matchName) matchName.textContent = item.name;
    if (matchRole) matchRole.textContent = item.role;
    if (matchDesc) matchDesc.textContent = item.desc + modeNote;
    if (matchCta) matchCta.setAttribute('href', item.anchor);
  }

  if (needSelect) {
    needSelect.addEventListener('change', updateClinicianMatch);
    if (visitPrefSelect) visitPrefSelect.addEventListener('change', updateClinicianMatch);
  }

  /* ---------- 7. Locations Page: Interactive Harbor Route & Drive-Time Planner ---------- */
  const citySelect = document.getElementById('city-select');
  const modeSelect = document.getElementById('mode-select');
  const routeTime = document.getElementById('route-time');
  const routeTitle = document.getElementById('route-title');
  const routeDesc = document.getElementById('route-desc');
  const routeParking = document.getElementById('route-parking');

  const ROUTE_DATA = {
    portsmouth: {
      driveTime: '3–8 Mins',
      transitTime: '5 Min Walk',
      title: 'Portsmouth, Olde Towne, Churchland & Cradock',
      driveDesc: 'Take High Street or Effingham Street directly to 355 Crawford Street on the Downtown Portsmouth waterfront, two minutes from Naval Medical Center Portsmouth.',
      transitDesc: 'HRT bus routes and the High Street Elizabeth River Ferry dock stop within two blocks of 355 Crawford Street, Suite 622.',
      parking: 'Garage and street parking directly adjacent to 355 Crawford Street with elevator access to the 6th floor (Suite 622).'
    },
    norfolk: {
      driveTime: '6–10 Mins',
      transitTime: '8 Min Ferry',
      title: 'Downtown Norfolk, Ghent, Berkley & Naval Station Norfolk',
      driveDesc: 'Cross the Downtown Tunnel (I-264 W) or Midtown Tunnel (US-58 W) into Downtown Portsmouth and exit onto Crawford Street.',
      transitDesc: 'Board the Elizabeth River Pedestrian Ferry at Waterside in Downtown Norfolk and disembark at High Street Landing, a short walk from Suite 622.',
      parking: 'Skip hospital complex congestion with direct sixth-floor suite access on the Portsmouth harbor.'
    },
    chesapeake: {
      driveTime: '12–16 Mins',
      transitTime: 'Same-Week Video',
      title: 'Western Branch, Deep Creek, South Norfolk & Greenbrier',
      driveDesc: 'Take I-264 E from Western Branch or I-464 N / Route 17 N from Deep Creek and Greenbrier straight into Downtown Portsmouth.',
      transitDesc: 'Chesapeake patients can combine in-office annual physicals at Suite 622 with HIPAA video visits for routine follow-ups and refills.',
      parking: 'Easy weekday morning and afternoon access off I-264 Exit 7 toward Crawford Street.'
    },
    suffolk: {
      driveTime: '15–22 Mins',
      transitTime: 'Same-Week Video',
      title: 'Harbour View, North Suffolk, Driver & Downtown Suffolk',
      driveDesc: 'Follow I-664 S / I-264 E from Harbour View or US-58 E from Downtown Suffolk directly to the Portsmouth waterfront.',
      transitDesc: 'Suffolk patients frequently use Virginia Telemedicine for lab reviews, blood pressure check-ins, and medication management.',
      parking: 'Convenient elevator access to Suite 622 with no sprawling medical campus walk.'
    },
    vabeach: {
      driveTime: '22–28 Mins',
      transitTime: 'Statewide Video',
      title: 'Virginia Beach, Town Center & Kempsville + Statewide Telehealth',
      driveDesc: 'Take I-264 W straight to Downtown Portsmouth for comprehensive annual exams, or connect from home via Virginia Telemedicine.',
      transitDesc: 'Any resident physically located in the Commonwealth of Virginia can book a HIPAA-compliant video consultation from a phone or computer.',
      parking: 'Full hybrid care: annual lab work in Portsmouth paired with virtual follow-ups.'
    }
  };

  function updateRoutePlanner() {
    if (!citySelect) return;
    const cityKey = citySelect.value || 'portsmouth';
    const modeKey = modeSelect ? modeSelect.value : 'drive';
    const data = ROUTE_DATA[cityKey] || ROUTE_DATA.portsmouth;

    if (routeTime) routeTime.textContent = modeKey === 'transit' ? data.transitTime : data.driveTime;
    if (routeTitle) routeTitle.textContent = data.title;
    if (routeDesc) routeDesc.textContent = modeKey === 'transit' ? data.transitDesc : data.driveDesc;
    if (routeParking) routeParking.textContent = data.parking;
  }

  if (citySelect) {
    citySelect.addEventListener('change', updateRoutePlanner);
    if (modeSelect) modeSelect.addEventListener('change', updateRoutePlanner);
  }

  /* ---------- 8. Education Page: Interactive Blood Pressure & A1C Target Checker ---------- */
  const metricSelect = document.getElementById('metric-select');
  const levelSelect = document.getElementById('level-select');
  const eduBadge = document.getElementById('edu-target-badge');
  const eduStage = document.getElementById('edu-target-stage');
  const eduMeaning = document.getElementById('edu-target-meaning');
  const eduAction = document.getElementById('edu-target-action');

  const EDU_TARGETS = {
    bp: {
      normal: {
        badge: 'Normal Blood Pressure',
        stage: 'Under 120/80 mmHg',
        meaning: 'Your systolic pressure is below 120 and diastolic is below 80. Artery wall pressure is in the healthy target range.',
        action: 'Continue annual wellness screenings, regular physical activity, and a heart-healthy low-sodium diet.'
      },
      elevated: {
        badge: 'Elevated / Stage 1 Range',
        stage: '120–139 / 80–89 mmHg',
        meaning: 'Consistent readings at or above 130/80 mmHg indicate Stage 1 Hypertension, which silently increases heart disease and stroke risk.',
        action: 'Schedule a primary care blood pressure check at Suite 622, start a twice-daily home cuff log, and review nutrition strategies.'
      },
      high: {
        badge: 'Stage 2 Hypertension',
        stage: '140/90 mmHg or Higher',
        meaning: 'Sustained readings at 140/90 mmHg or above require active clinical management to protect your heart, kidneys, and brain vasculature.',
        action: 'Book a Chronic Disease Management visit in Portsmouth for a personalized medication and lifestyle care plan.'
      }
    },
    a1c: {
      normal: {
        badge: 'Normal Glucose Range',
        stage: 'A1C Below 5.7%',
        meaning: 'Your 3-month average blood sugar is in the non-diabetic reference range.',
        action: 'Maintain routine preventive lab panels during your Annual Wellness Exam.'
      },
      elevated: {
        badge: 'Prediabetes Range',
        stage: 'A1C 5.7% to 6.4%',
        meaning: 'Blood sugar is elevated above normal, signaling insulin resistance and heightened risk of progressing to Type 2 diabetes.',
        action: 'Work with Laurie Salerno, ANP-BC or our team on food-based metabolic nutrition and weight management to reverse prediabetes.'
      },
      high: {
        badge: 'Diabetes Care Range',
        stage: 'A1C 6.5% or Higher',
        meaning: 'Indicates diabetes requiring structured quarterly A1C monitoring, kidney and foot protection, and individualized therapy.',
        action: 'Schedule a Type 2 Diabetes & Chronic Care consultation at Suite 622 or by Virginia telehealth.'
      }
    }
  };

  function updateEduChecker() {
    if (!metricSelect || !levelSelect) return;
    const m = metricSelect.value || 'bp';
    const l = levelSelect.value || 'normal';
    const data = (EDU_TARGETS[m] && EDU_TARGETS[m][l]) || EDU_TARGETS.bp.normal;

    if (eduBadge) eduBadge.textContent = data.badge;
    if (eduStage) eduStage.textContent = data.stage;
    if (eduMeaning) eduMeaning.textContent = data.meaning;
    if (eduAction) eduAction.textContent = data.action;
  }

  if (metricSelect && levelSelect) {
    metricSelect.addEventListener('change', updateEduChecker);
    levelSelect.addEventListener('change', updateEduChecker);
  }

  /* ---------- 9. Payment & Insurance Page: 2026 Sliding-Scale Fee Calculator ---------- */
  const scaleTierSelect = document.getElementById('scale-tier-select');
  const scalePatientSelect = document.getElementById('scale-patient-select');
  const scaleFeeOut = document.getElementById('scale-fee-output');
  const scaleDescOut = document.getElementById('scale-desc-output');
  const scaleIncomeOut = document.getElementById('scale-income-output');

  const SCALE_RATES = {
    catA: {
      label: 'Category A (100% FPL & Below)',
      income: 'Up to $15,960 (1 person) · $33,000 (family of 4)',
      newFee: '$25 – $30',
      estFee: '$25 – $30',
      summary: 'Maximum sliding-scale discount: $25 for CPT 99203/99204 or 99213/99214 visits, and $30 for comprehensive CPT 99205/99215 visits.'
    },
    catB: {
      label: 'Category B (100% to 125% FPL)',
      income: 'Up to $19,950 (1 person) · $41,250 (family of 4)',
      newFee: '$35 – $40',
      estFee: '$35 – $40',
      summary: 'Category B discounted fee: $35 for standard new or established visits (CPT 99203/99204/99213/99214) and $40 for extended complexity (99205/99215).'
    },
    catC: {
      label: 'Category C (125% to 150% FPL)',
      income: 'Up to $23,940 (1 person) · $49,500 (family of 4)',
      newFee: '$45 – $50',
      estFee: '$45 – $50',
      summary: 'Category C discounted fee: $45 for standard new or established visits and $50 for extended complexity visits.'
    },
    catD: {
      label: 'Category D (150% to 175% FPL)',
      income: 'Up to $27,930 (1 person) · $57,750 (family of 4)',
      newFee: '$55 – $60',
      estFee: '$55 – $60',
      summary: 'Category D discounted fee: $55 for standard new or established visits and $60 for extended complexity visits.'
    },
    catE: {
      label: 'Category E (175% to 200% FPL)',
      income: 'Up to $31,920 (1 person) · $66,000 (family of 4)',
      newFee: '$60 – $65',
      estFee: '$65',
      summary: 'Category E discounted fee: $60–$65 for new patient visits (full charge $300–$380) and $65 for established patient visits (full charge $170–$340).'
    }
  };

  function updateScaleCalc() {
    if (!scaleTierSelect || !scalePatientSelect) return;
    const tier = SCALE_RATES[scaleTierSelect.value] || SCALE_RATES.catA;
    const isEst = scalePatientSelect.value === 'est';

    if (scaleFeeOut) scaleFeeOut.textContent = isEst ? tier.estFee : tier.newFee;
    if (scaleDescOut) scaleDescOut.textContent = tier.summary;
    if (scaleIncomeOut) scaleIncomeOut.textContent = tier.income;
  }

  if (scaleTierSelect && scalePatientSelect) {
    scaleTierSelect.addEventListener('change', updateScaleCalc);
    scalePatientSelect.addEventListener('change', updateScaleCalc);
  }

  /* ---------- 10. Interactive Filter Bars (Services & Blog Pages) ---------- */
  const filterButtons = document.querySelectorAll('[data-filter-btn]');
  if (filterButtons.length > 0) {
    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const group = btn.getAttribute('data-filter-group');
        const val = btn.getAttribute('data-filter-btn');
        document.querySelectorAll('[data-filter-group="' + group + '"][data-filter-btn]').forEach((b) => {
          const active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        document.querySelectorAll('[data-filter-item="' + group + '"]').forEach((item) => {
          const cat = item.getAttribute('data-category') || '';
          const show = val === 'all' || cat.split(' ').includes(val);
          item.style.display = show ? '' : 'none';
        });
      });
    });
  }
})();
