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
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
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
