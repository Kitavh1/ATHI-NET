const businessNumber = '254705605922';
const modal = document.getElementById('packageModal');
const packageButtons = [...document.querySelectorAll('.btn-package')];
const modalClose = document.querySelector('.modal-close');
const contactForm = document.getElementById('contactForm');
const coverageForm = document.getElementById('coverageForm');
const packageForm = document.getElementById('packageForm');
const menuToggle = document.querySelector('.nav-toggle');
const mainNav = document.getElementById('mainNav');
const yearNode = document.getElementById('year');

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const openModal = (packageName, packagePrice) => {
  const selectedPackageName = document.getElementById('selectedPackageName');
  const selectedPackagePrice = document.getElementById('selectedPackagePrice');

  if (selectedPackageName) selectedPackageName.textContent = packageName;
  if (selectedPackagePrice) selectedPackagePrice.textContent = packagePrice;

  if (modal) {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    const firstInput = document.getElementById('packageName');
    if (firstInput) firstInput.focus();
  }
};

const closeModal = () => {
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
};

packageButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const packageName = button.dataset.package;
    const packagePrice = button.dataset.price;
    openModal(packageName, packagePrice);
  });
});

if (modalClose) {
  modalClose.addEventListener('click', closeModal);
}

if (modal) {
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal && modal.classList.contains('is-open')) {
    closeModal();
  }
});

const setStatus = (element, text, type) => {
  if (!element) return;
  element.textContent = text;
  element.classList.remove('error', 'success');
  if (type) element.classList.add(type);
};

const validateRequired = (value) => value.trim().length > 0;

const validatePhone = (value) => /^\+?[0-9\s-]{7,15}$/.test(value.trim());

const openWhatsApp = (message) => {
  const whatsappUrl = `https://wa.me/${businessNumber}?text=${encodeURIComponent(message)}`;
  return window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
};

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

if (coverageForm) {
  coverageForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const county = document.getElementById('county');
    const town = document.getElementById('town');
    const landmark = document.getElementById('landmark');
    const status = document.getElementById('coverageStatus');

    if (!county || !town || !status) return;

    if (!validateRequired(county.value) || !validateRequired(town.value)) {
      setStatus(status, 'Please enter your county and town or estate before checking coverage.', 'error');
      return;
    }

    const message = [
      'Hello ATHINET, I would like to check if my area is covered for home internet.',
      `County: ${county.value.trim()}`,
      `Town or estate: ${town.value.trim()}`,
      landmark && landmark.value.trim() ? `Nearest landmark: ${landmark.value.trim()}` : 'Nearest landmark: Not provided',
      'Please confirm coverage and next steps.'
    ].join('\n');

    setStatus(status, 'Coverage details prepared. Please confirm with ATHINET before subscribing.', 'success');
    openWhatsApp(message);
    coverageForm.reset();
  });
}

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('contactName');
    const phone = document.getElementById('contactPhone');
    const location = document.getElementById('contactLocation');
    const packageSelect = document.getElementById('contactPackage');
    const messageField = document.getElementById('contactMessage');
    const status = document.getElementById('contactStatus');

    if (!name || !phone || !location || !packageSelect || !messageField || !status) return;

    if (!validateRequired(name.value) || !validateRequired(location.value) || !validateRequired(messageField.value)) {
      setStatus(status, 'Please complete all required fields before sending your enquiry.', 'error');
      return;
    }

    if (!validatePhone(phone.value)) {
      setStatus(status, 'Please enter a valid phone number for contact.', 'error');
      return;
    }

    const message = [
      'Hello ATHINET, I would like to enquire about your internet packages.',
      `Name: ${name.value.trim()}`,
      `Phone: ${phone.value.trim()}`,
      `Location: ${location.value.trim()}`,
      `Selected Package: ${packageSelect.value}`,
      `Message: ${messageField.value.trim()}`
    ].join('\n');

    setStatus(status, 'Your enquiry details are ready. Please send the prefilled WhatsApp message to continue.', 'success');
    openWhatsApp(message);
    contactForm.reset();
  });
}

if (packageForm) {
  packageForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('packageName');
    const phone = document.getElementById('packagePhone');
    const location = document.getElementById('packageLocation');
    const status = document.getElementById('packageStatus');

    if (!name || !phone || !location || !status) return;

    if (!validateRequired(name.value) || !validateRequired(location.value)) {
      setStatus(status, 'Please enter your name and location before continuing.', 'error');
      return;
    }

    if (!validatePhone(phone.value)) {
      setStatus(status, 'Please enter a valid phone number to receive your enquiry on WhatsApp.', 'error');
      return;
    }

    const selectedPackageName = document.getElementById('selectedPackageName')?.textContent || 'Selected package';
    const selectedPackagePrice = document.getElementById('selectedPackagePrice')?.textContent || 'Price not provided';

    const message = [
      'Hello ATHINET, I am interested in your internet package.',
      `Name: ${name.value.trim()}`,
      `Phone: ${phone.value.trim()}`,
      `Location: ${location.value.trim()}`,
      `Package: ${selectedPackageName}`,
      `Price: ${selectedPackagePrice}`,
      'Please confirm availability and next steps.'
    ].join('\n');

    setStatus(status, 'Your package enquiry is ready. Please send the WhatsApp message to ATHINET.', 'success');
    openWhatsApp(message);
    packageForm.reset();
    closeModal();
  });
}

document.querySelectorAll('.faq-question').forEach((question) => {
  question.addEventListener('click', () => {
    const item = question.closest('.faq-item');
    const isOpen = item.classList.contains('is-open');

    document.querySelectorAll('.faq-item').forEach((faqItem) => {
      faqItem.classList.remove('is-open');
      const trigger = faqItem.querySelector('.faq-question');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });

    if (!isOpen) {
      item.classList.add('is-open');
      question.setAttribute('aria-expanded', 'true');
    }
  });
});

const quoteDialog = document.getElementById('quoteDialog');
const quoteForm = document.getElementById('serviceQuoteForm');
const quoteConsent = document.getElementById('quoteConsent');
const quoteFields = document.getElementById('quoteFields');
const quoteService = document.getElementById('quoteService');
const quoteStatus = document.getElementById('serviceQuoteStatus');
const quoteDialogClose = document.querySelector('.services-dialog-close');
let lastQuoteTrigger = null;

if (quoteDialog && quoteForm && quoteConsent && quoteFields && quoteService) {
  const setQuoteConsent = () => {
    quoteFields.disabled = !quoteConsent.checked;
  };

  quoteConsent.addEventListener('change', setQuoteConsent);

  document.querySelectorAll('.quote-trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      if (typeof quoteDialog.showModal !== 'function') {
        setStatus(quoteStatus, 'This browser cannot open the enquiry form. Please contact ATHINET on +254 705 605 922.', 'error');
        return;
      }

      lastQuoteTrigger = trigger;
      quoteForm.reset();
      quoteConsent.checked = false;
      quoteFields.disabled = true;
      setStatus(quoteStatus, '', '');

      const requestedService = trigger.dataset.service;
      if (requestedService) {
        const matchingOption = [...quoteService.options].find((option) => option.value === requestedService || option.textContent === requestedService);
        if (matchingOption) quoteService.value = matchingOption.value;
      }

      quoteDialog.showModal();
      quoteConsent.focus();
    });
  });

  if (quoteDialogClose) {
    quoteDialogClose.addEventListener('click', () => quoteDialog.close());
  }

  quoteDialog.addEventListener('click', (event) => {
    if (event.target === quoteDialog) quoteDialog.close();
  });

  quoteDialog.addEventListener('close', () => {
    if (lastQuoteTrigger && lastQuoteTrigger.isConnected) lastQuoteTrigger.focus();
  });

  quoteForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!quoteConsent.checked) {
      setStatus(quoteStatus, 'Please review and accept the consent notice before entering or using enquiry details.', 'error');
      quoteConsent.focus();
      return;
    }

    if (!quoteForm.reportValidity()) return;

    const name = document.getElementById('quoteName');
    const email = document.getElementById('quoteEmail');
    const phone = document.getElementById('quotePhone');
    const company = document.getElementById('quoteCompany');
    const description = document.getElementById('quoteDescription');
    const budget = document.getElementById('quoteBudget');

    if (!name || !email || !phone || !company || !description || !budget) {
      setStatus(quoteStatus, 'The enquiry form could not be completed. Please contact ATHINET directly.', 'error');
      return;
    }

    if (!validatePhone(phone.value)) {
      setStatus(quoteStatus, 'Please enter a valid phone number before continuing.', 'error');
      phone.focus();
      return;
    }

    const enquiry = [
      'Hello ATHINET, I would like to enquire about a service.',
      `Full name: ${name.value.trim()}`,
      `Email: ${email.value.trim() || 'Not provided'}`,
      `Phone: ${phone.value.trim()}`,
      `Company/business: ${company.value.trim() || 'Not provided'}`,
      `Service required: ${quoteService.value}`,
      `Project description: ${description.value.trim()}`,
      `Estimated budget: ${budget.value || 'Not provided'}`
    ].join('\n');

    openWhatsApp(enquiry);
    setStatus(quoteStatus, 'A draft enquiry has been prepared for WhatsApp. Review it there and press Send to contact ATHINET. If WhatsApp did not open, call +254 705 605 922.', 'success');
    quoteForm.reset();
    quoteFields.disabled = true;
    quoteStatus.focus();
  });
}

const chatPanel = document.getElementById('chatPanel');
const chatToggle = document.getElementById('chatToggle');
const chatClose = document.getElementById('chatClose');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');
const offTopicReply = "I'm ATHINET's official AI business assistant, and I'm here to help with our company, products, and services. Is there anything about ATHINET I can help you with?";
const unknownBusinessReply = "I don't have verified information about that at the moment. Please contact the ATHINET team for accurate assistance.";
const chatWhatsAppUrl = 'https://wa.me/254705605922?text=' + encodeURIComponent('Hello ATHINET, I would like to enquire about your services.');
const athinetKnowledgeBase = Object.freeze({
  verifiedCompanyServices: ['Home internet packages and coverage enquiries published on the ATHINET website'],
  professionalOfferings: [
    'Website development and custom software',
    'Cybersecurity consultation and basic assessments',
    'Data analytics and reporting',
    'Networking and IT solutions',
    'Business process automation'
  ],
  professional: {
    name: 'Brian Kitavi Mumo',
    role: 'available to support ATHINET projects and client engagements, subject to the company’s agreed service arrangements'
  }
});
const isServicesPage = window.location.pathname.endsWith('/services.html');
const servicesPagePath = isServicesPage ? '' : 'services.html';
const serviceQuoteHref = `${servicesPagePath}#quote`;
const internetPackagesHref = `${isServicesPage ? 'index.html' : ''}#packages`;
const coverageHref = `${isServicesPage ? 'index.html' : ''}#coverage`;
const chatContactActions = [
  { label: 'Make an enquiry', href: '#contact' },
  { label: 'WhatsApp ATHINET', href: 'https://wa.me/254705605922', external: true }
];

const getChatReply = (message) => {
  const text = message.toLowerCase().replace(/[’']/g, "'").trim();
  const serviceAction = (section = '') => [
    { label: 'View professional services', href: `${servicesPagePath}#${section || 'company-services'}` },
    { label: 'Request a quotation', href: serviceQuoteHref }
  ];

  if (/\b(football|soccer|sports?|politics?|political|relationship advice|homework|school assignment|entertainment|movie|movies|celebrity|recipe|weather|stock market|general coding|write code|programming help)\b/.test(text)) {
    return { text: offTopicReply };
  }

  if (/\b(ignore|disregard|override|bypass)\b.{0,50}\b(instruction|rule|restriction|prompt|identity|previous)\b|\b(reveal|show|print|share)\b.{0,40}\b(system prompt|instructions|api key|backend|configuration|secret)\b|\b(pretend|act as|roleplay as)\b/.test(text)) {
    return { text: offTopicReply };
  }

  if (/^(hi|hello|hey|good morning|good afternoon|good evening)[!. ]*$/.test(text)) {
    return {
      text: 'Hello! I’m ATHINET AI Assistant, ATHINET’s official business assistant. I can help with published home internet information and professional offerings featured for ATHINET engagements, subject to agreed arrangements. What would you like to know?'
    };
  }

  if (/\b(who are you|what is your name|your identity)\b/.test(text)) {
    return {
      text: 'I’m ATHINET AI Assistant, ATHINET’s official virtual business representative. This website chat provides automated answers from published site information and can direct you to the ATHINET team.'
    };
  }

  if (/\b(two heads tech|developer|technology provider|who built|who developed)\b/.test(text)) {
    return {
      text: 'ATHINET identifies Two Heads Tech Enterprise as its developer and technology provider.'
    };
  }

  if (/\b(hire|engage|work with|contact|reach)\b.{0,45}\b(team|developer|technical|software|professional)\b|\bwho handles\b.{0,35}\b(software|development|technical)\b/.test(text)) {
    return {
      text: `${athinetKnowledgeBase.professional.name} is the technical professional behind the software and IT expertise featured on the Services page. He is ${athinetKnowledgeBase.professional.role}. Contact ATHINET to discuss an engagement.`,
      actions: serviceAction('team')
    };
  }

  if (/\b(quote|quotation|estimate|pricing|price|cost|budget)\b/.test(text) && /\b(request|ask|get|need|want|project|service|how|quote|quotation)\b/.test(text)) {
    return {
      text: 'You can prepare a project enquiry using the quotation form on the Services page. It opens WhatsApp with a draft for you to review and send; this website does not store submissions.',
      actions: [{ label: 'Request a quotation', href: serviceQuoteHref }]
    };
  }

  if (/\b(what services|which services|services do you offer|what does athinet do|what does the company do|about athinet|about the company|company information)\b/.test(text)) {
    return {
      text: `ATHINET's published website verifies ${athinetKnowledgeBase.verifiedCompanyServices[0]}. The Services page also presents ${athinetKnowledgeBase.professionalOfferings.join(', ')} as professional team offerings for ATHINET engagements, subject to agreed company arrangements. Contact ATHINET to confirm scope and availability.`,
      actions: serviceAction()
    };
  }

  if (/\b(business internet|business connectivity|office internet)\b/.test(text)) {
    return {
      text: 'ATHINET’s published site lists home internet packages. Business connectivity options are not detailed there, so please contact ATHINET to confirm availability and requirements.',
      actions: [
        { label: 'Business connectivity enquiries', href: `${servicesPagePath}#company-services` },
        { label: 'Request a quotation', href: serviceQuoteHref }
      ]
    };
  }

  if (/\b(website development|web development|business website|corporate website|e-commerce|ecommerce|web application|custom software|software development|pos system|point of sale|business management system|inventory system|school management|erp|saas|database application)\b|\b(develop|build|create)\b.{0,30}\b(website|websites|web app|web application)\b/.test(text)) {
    return {
      text: 'The Services page presents website development and custom software—including business websites, e-commerce, POS, inventory, school management, ERP, and SaaS applications—as professional team offerings. Work is subject to agreed ATHINET arrangements and confirmed project scope.',
      actions: serviceAction('software')
    };
  }

  if (/\b(cybersecurity|cyber security|vulnerability assessment|security assessment|secure coding|network security)\b/.test(text)) {
    return {
      text: 'Cybersecurity consultation, security awareness, secure application development, and basic vulnerability assessment are presented as professional team offerings. Any assessment requires agreed scope and authorization; no certification or security guarantee is implied.',
      actions: serviceAction('cybersecurity')
    };
  }

  if (/\b(data analytics|data analysis|power bi|excel report|business intelligence|data visualization|data cleaning)\b/.test(text)) {
    return {
      text: 'The Services page presents data analysis, data cleaning, Excel reporting, Power BI dashboards, business intelligence, and visualization as professional team offerings using Python, Excel, and Power BI.',
      actions: serviceAction('analytics')
    };
  }

  if (/\b(networking|network configuration|network troubleshooting|it support|it infrastructure|system deployment|technology consultancy)\b/.test(text)) {
    return {
      text: 'The Services page presents network configuration and troubleshooting, infrastructure, IT support, system deployment, and technical consultancy as professional team offerings. These are separate from ATHINET’s published home internet packages.',
      actions: serviceAction('networking')
    };
  }

  if (/\b(business automation|workflow automation|process automation|digital transformation|business reporting|digital business management)\b/.test(text)) {
    return {
      text: 'Business process and workflow automation, database development, reporting, and digital business management are presented as professional team offerings on the Services page.',
      actions: serviceAction('automation')
    };
  }

  if (/\b(portfolio|selected projects|wi-flow|motor hub|schoolyard|athi auto spares|athinet website)\b/.test(text)) {
    return {
      text: 'The Services page presents WI-FLOW, MOTOR HUB, SCHOOLYARD, the ATHINET website, and ATHI AUTO SPARES as selected development project or portfolio work—not as a claim that each is an ATHINET product or client endorsement.',
      actions: serviceAction('projects')
    };
  }

  if (/\b(website|web address|url|webpage|site link)\b/.test(text) && /\b(athinet|company|official|your|website|web address|url|webpage)\b/.test(text)) {
    return {
      text: 'ATHINET’s official website is https://kitavh1.github.io/ATHI-NET/.',
      actions: [{ label: 'Visit ATHINET', href: 'https://kitavh1.github.io/ATHI-NET/', external: true }]
    };
  }

  if (/\b(package|packages|plan|plans|price|prices|pricing|cost|costs|mbps|speed)\b/.test(text)) {
    if (!/\b(internet|wifi|wi-fi|broadband|mbps|home connection|installation)\b/.test(text) && /\b(website|software|pos|cybersecurity|cyber security|analytics|consultancy|automation|project)\b/.test(text)) {
      return { text: unknownBusinessReply, actions: chatContactActions };
    }

    return {
      text: 'ATHINET advertises these monthly home internet packages:\n5 Mbps — KES 1,500\n6 Mbps — KES 2,000\n10 Mbps — KES 2,998\n15 Mbps — KES 3,450\n25 Mbps — KES 4,750\nPlease confirm current availability and terms with ATHINET.',
      actions: [{ label: 'View packages', href: internetPackagesHref }]
    };
  }

  if (/\b(install|installation|setup)\b/.test(text)) {
    return {
      text: 'The website currently advertises an installation fee of KES 1,500. Please confirm eligibility and any applicable conditions with ATHINET.',
      actions: [{ label: 'Ask ATHINET on WhatsApp', href: chatWhatsAppUrl, external: true }]
    };
  }

  if (/\b(coverage|covered|cover|availability|available in|service area|my area|county|estate|location)\b/.test(text)) {
    return {
      text: 'I can’t verify coverage for a specific address here. Share your area with ATHINET to confirm availability before subscribing.',
      actions: [
        { label: 'Check coverage', href: coverageHref },
        { label: 'Ask on WhatsApp', href: chatWhatsAppUrl, external: true }
      ]
    };
  }

  if (/\b(contact|phone|call|whatsapp|support|agent|person|subscribe|subscription|sign up|connect)\b/.test(text)) {
    return {
      text: 'You can call or WhatsApp ATHINET on +254 705 605 922 for package and service enquiries.',
      actions: [
        { label: 'Call ATHINET', href: 'tel:+254705605922' },
        ...chatContactActions.slice(1)
      ]
    };
  }

  if (/\b(what is athinet|company)\b/.test(text)) {
    return {
      text: 'ATHINET is a technology company. Its website provides verified information about home internet connectivity and advertised packages. Please contact the ATHINET team to confirm other service details and availability.',
      actions: chatContactActions
    };
  }

  if (/\b(athinet|internet|wi-?fi|broadband|router|connectivity|service|services|website|business)\b/.test(text)) {
    return { text: unknownBusinessReply };
  }

  return { text: offTopicReply };
};

const appendChatMessage = (message, sender, actions = []) => {
  if (!chatMessages) return;

  const bubble = document.createElement('div');
  bubble.className = `chat-message ${sender}`;
  const text = document.createElement('p');
  text.textContent = message;
  bubble.append(text);

  actions.forEach((action) => {
    const link = document.createElement('a');
    link.href = action.href;
    link.textContent = action.label;
    if (action.external) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    bubble.append(link);
  });

  chatMessages.append(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

const setChatOpen = (isOpen) => {
  if (!chatPanel || !chatToggle) return;
  chatPanel.classList.toggle('is-open', isOpen);
  chatPanel.setAttribute('aria-hidden', String(!isOpen));
  chatToggle.setAttribute('aria-expanded', String(isOpen));
  if (isOpen && chatInput) chatInput.focus();
};

if (chatPanel && chatToggle && chatClose && chatForm && chatInput) {
  chatToggle.addEventListener('click', () => {
    setChatOpen(chatPanel.getAttribute('aria-hidden') === 'true');
  });

  chatClose.addEventListener('click', () => {
    setChatOpen(false);
    chatToggle.focus();
  });

  chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;

    appendChatMessage(message, 'user');
    const reply = getChatReply(message);
    appendChatMessage(reply.text, 'assistant', reply.actions);
    chatInput.value = '';
  });

  document.querySelectorAll('[data-chat-suggestion]').forEach((button) => {
    button.addEventListener('click', () => {
      const message = button.dataset.chatSuggestion;
      if (!message) return;
      appendChatMessage(message, 'user');
      const reply = getChatReply(message);
      appendChatMessage(reply.text, 'assistant', reply.actions);
      if (chatMessages) {
        const suggestions = chatMessages.querySelector('.chat-suggestions');
        if (suggestions) suggestions.remove();
      }
      chatInput.focus();
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && chatPanel.classList.contains('is-open')) {
      setChatOpen(false);
      chatToggle.focus();
    }
  });
}
