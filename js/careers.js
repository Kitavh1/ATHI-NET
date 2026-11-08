const jobList = document.getElementById('vacancyList');
const emptyMessage = document.getElementById('vacancyEmpty');
const applicationForm = document.getElementById('applicationForm');
const applicationNotice = document.getElementById('applicationNotice');
const applicationFields = document.getElementById('applicationFields');
const applicationStatus = document.getElementById('applicationStatus');
const applicationSubmit = document.getElementById('applicationSubmit');
const vacancyDialog = document.getElementById('vacancyDialog');
const vacancyDetails = document.getElementById('vacancyDetails');
const dialogActions = document.getElementById('dialogActions');
const recruitmentConfig = window.ATHINET_RECRUITMENT_CONFIG || {};
const staticJobs = Array.isArray(window.ATHINET_JOBS) ? window.ATHINET_JOBS : [];
const configured = Boolean(recruitmentConfig.supabaseUrl && recruitmentConfig.supabaseAnonKey && recruitmentConfig.turnstileSiteKey);
let lastFocusedElement = null;
let pendingIdempotencyKey = null;

const formatDate = (date) => new Intl.DateTimeFormat('en-KE', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Nairobi'
}).format(new Date(date));

const isOpen = (job) => job.status === 'open' && Date.parse(job.applicationDeadline) > Date.now();

const showStatus = (message, type = '') => {
  applicationStatus.textContent = message;
  applicationStatus.classList.toggle('success', type === 'success');
};

const normalizeJob = (job) => ({
  ...job,
  employmentType: job.employmentType ?? job.employment_type ?? null,
  shortDescription: job.shortDescription ?? job.short_description ?? job.description ?? '',
  applicationDeadline: job.applicationDeadline ?? job.application_deadline,
  applicationEmail: job.applicationEmail ?? job.application_email ?? 'athinet72@gmail.com',
  requiredExperience: job.requiredExperience ?? job.required_experience ?? null,
  requiredSkills: job.requiredSkills ?? job.required_skills ?? [],
  publishedAt: job.publishedAt ?? job.published_at
});

const createText = (tagName, text, className = '') => {
  const element = document.createElement(tagName);
  element.textContent = text;
  if (className) element.className = className;
  return element;
};

const makeApplyButton = (job, label = 'Apply Now') => {
  if (!isOpen(job)) {
    const closedButton = createText('button', 'Applications closed', 'btn btn-career-outline');
    closedButton.type = 'button';
    closedButton.disabled = true;
    return closedButton;
  }
  if (!configured) {
    const link = createText('a', 'Apply by email', 'btn btn-primary');
    const subject = encodeURIComponent(`Application: ${job.title}`);
    const body = encodeURIComponent(`Hello ATHINET,\n\nI would like to apply for the ${job.title} position. My application documents are attached.\n\nFull name:\nPhone number:\n\nThank you.`);
    link.href = `mailto:${job.applicationEmail}?subject=${subject}&body=${body}`;
    return link;
  }
  const button = createText('button', label, 'btn btn-primary');
  button.type = 'button';
  button.disabled = !isOpen(job) || job.applicationEnabled === false;
  button.addEventListener('click', () => selectVacancy(job));
  return button;
};

const selectVacancy = (job) => {
  if (!configured || !isOpen(job) || job.applicationEnabled === false) return;
  pendingIdempotencyKey = null;
  document.getElementById('selectedJobTitle').textContent = job.title;
  document.getElementById('vacancySlug').value = job.slug;
  showStatus('');
  if (applicationForm.hidden) {
    applicationNotice.focus?.();
  } else {
    document.getElementById('applicantName').focus();
  }
  document.getElementById('application').scrollIntoView({ behavior: 'smooth' });
};

const addDetail = (parent, heading, value) => {
  const section = document.createElement('section');
  section.append(createText('h3', heading));
  if (Array.isArray(value) && value.length) {
    const list = document.createElement('ul');
    value.forEach((item) => list.append(createText('li', item)));
    section.append(list);
  } else {
    section.append(createText('p', value || 'Not specified in the vacancy notice.'));
  }
  parent.append(section);
};

const showDetails = (job, trigger) => {
  if (typeof vacancyDialog.showModal !== 'function') return;
  lastFocusedElement = trigger;
  vacancyDetails.replaceChildren();
  dialogActions.replaceChildren();
  vacancyDetails.append(createText('h2', job.title));
  const metadata = createText('p', `${job.location || 'Location not specified'} · ${job.employmentType || 'Employment type not specified'} · ${job.positions ?? 'Positions not specified'}`);
  vacancyDetails.append(metadata);
  addDetail(vacancyDetails, 'About the role', job.description || job.shortDescription);
  addDetail(vacancyDetails, 'Department', job.department);
  addDetail(vacancyDetails, 'Responsibilities', job.responsibilities);
  addDetail(vacancyDetails, 'Qualifications', job.qualifications);
  addDetail(vacancyDetails, 'Required experience', job.requiredExperience);
  addDetail(vacancyDetails, 'Required skills', job.requiredSkills);
  addDetail(vacancyDetails, 'Application deadline', formatDate(job.applicationDeadline));
  const status = createText('p', isOpen(job) ? 'Status: Open' : 'Status: Closed', `vacancy-status${isOpen(job) ? '' : ' is-closed'}`);
  vacancyDetails.append(status);
  const applyButton = makeApplyButton(job);
  applyButton.addEventListener('click', () => vacancyDialog.close());
  dialogActions.append(applyButton);
  vacancyDialog.showModal();
};

const renderJobs = (jobs) => {
  jobList.replaceChildren();
  const visibleJobs = jobs.filter((job) => job.status !== 'draft');
  emptyMessage.hidden = visibleJobs.length > 0;

  visibleJobs.forEach((rawJob) => {
    const job = normalizeJob(rawJob);
    const card = document.createElement('article');
    card.className = 'vacancy-card';
    const content = document.createElement('div');
    const meta = document.createElement('div');
    meta.className = 'vacancy-meta';
    meta.append(createText('span', job.location || 'Location not specified'));
    meta.append(createText('span', job.employmentType || 'Employment type not specified'));
    if (job.department) meta.append(createText('span', job.department));
    const status = createText('span', isOpen(job) ? 'Open' : 'Closed', `vacancy-status${isOpen(job) ? '' : ' is-closed'}`);
    content.append(status, createText('h3', job.title), meta, createText('p', job.shortDescription));
    content.append(createText('p', `Application deadline: ${formatDate(job.applicationDeadline)}`, 'vacancy-deadline'));

    const actions = document.createElement('div');
    actions.className = 'vacancy-card-actions';
    const detailsButton = createText('button', 'View Details', 'btn btn-career-outline');
    detailsButton.type = 'button';
    detailsButton.addEventListener('click', () => showDetails(job, detailsButton));
    actions.append(detailsButton, makeApplyButton(job));
    card.append(content, actions);
    jobList.append(card);
  });
};

const publicJobFields = 'slug,title,department,location,employment_type,positions,short_description,description,responsibilities,qualifications,required_experience,required_skills,application_deadline,application_email,status,published_at';

const loadJobs = async () => {
  if (!configured) {
    renderJobs(staticJobs);
    return;
  }

  const baseUrl = recruitmentConfig.supabaseUrl.replace(/\/$/, '');
  try {
    const response = await fetch(`${baseUrl}/rest/v1/jobs?select=${publicJobFields}&status=eq.open&published_at=not.is.null&application_deadline=gte.${encodeURIComponent(new Date().toISOString())}&order=published_at.desc`, {
      headers: { apikey: recruitmentConfig.supabaseAnonKey, Authorization: `Bearer ${recruitmentConfig.supabaseAnonKey}` }
    });
    if (!response.ok) throw new Error('Vacancies could not be loaded.');
    const jobs = await response.json();
    renderJobs(jobs.map(normalizeJob));
  } catch {
    jobList.replaceChildren();
    emptyMessage.hidden = false;
    emptyMessage.textContent = 'Current vacancies could not be loaded. Please contact ATHINET at athinet72@gmail.com.';
  }
};

const validateFiles = (formData) => {
  const fileFields = ['cv', 'certificates', 'supportingDocuments'];
  let total = 0;
  for (const field of fileFields) {
    const files = formData.getAll(field).filter((entry) => entry instanceof File && entry.size > 0);
    for (const file of files) {
      total += file.size;
      const extension = file.name.toLowerCase().split('.').pop();
      if (!['pdf', 'docx'].includes(extension) || file.size > 5 * 1024 * 1024) {
        return 'Each document must be a PDF or DOCX file no larger than 5 MB.';
      }
    }
  }
  if (total > 10 * 1024 * 1024) return 'All uploaded documents must total no more than 10 MB.';
  return '';
};

const loadTurnstile = () => new Promise((resolve, reject) => {
  if (window.turnstile) return resolve();
  const script = document.createElement('script');
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
  script.async = true;
  script.onload = resolve;
  script.onerror = reject;
  document.head.append(script);
});

const activateForm = async () => {
  applicationNotice.hidden = true;
  applicationForm.hidden = false;
  applicationFields.disabled = false;
  try {
    await loadTurnstile();
    window.turnstile.render('#turnstileWidget', {
      sitekey: recruitmentConfig.turnstileSiteKey,
      callback: (token) => { document.getElementById('turnstileToken').value = token; },
      'expired-callback': () => { document.getElementById('turnstileToken').value = ''; }
    });
  } catch {
    applicationFields.disabled = true;
    applicationNotice.hidden = false;
    applicationNotice.querySelector('strong').textContent = 'Secure application form could not be loaded.';
    applicationNotice.querySelector('p').textContent = 'Please contact ATHINET at athinet72@gmail.com to apply.';
    applicationForm.hidden = true;
  }
};

const setSuccess = (result) => {
  applicationStatus.replaceChildren();
  applicationStatus.classList.add('success');
  applicationStatus.append(createText('strong', 'Application Submitted Successfully!'));
  applicationStatus.append(createText('span', `Application reference: ${result.reference}`));
  applicationStatus.append(createText('span', `Position: ${result.position}`));
  applicationStatus.append(createText('span', 'Thank you for your interest in joining ATHINET. Your application has been received successfully. Our recruitment team will review your submission and contact shortlisted candidates.'));
  applicationForm.reset();
  pendingIdempotencyKey = null;
  document.getElementById('selectedJobTitle').textContent = 'Select an open vacancy';
  document.getElementById('vacancySlug').value = '';
  window.turnstile?.reset();
};

applicationForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!configured || !applicationForm.reportValidity()) return;

  const formData = new FormData(applicationForm);
  const phone = String(formData.get('phone') || '').trim();
  if (!/^\+?[0-9][0-9\s().-]{6,23}$/.test(phone)) {
    showStatus('Enter a valid phone number, including its country code where appropriate.');
    document.getElementById('applicantPhone').focus();
    return;
  }

  const fileError = validateFiles(formData);
  if (fileError) {
    showStatus(fileError);
    return;
  }

  const vacancySlug = String(formData.get('vacancySlug') || '');
  if (!vacancySlug || !document.getElementById('turnstileToken').value) {
    showStatus('Select an open vacancy and complete the spam-protection check before submitting.');
    return;
  }

  applicationSubmit.disabled = true;
  applicationSubmit.textContent = 'Submitting…';
  applicationFields.disabled = true;
  showStatus('Submitting your application securely…');
  pendingIdempotencyKey ||= crypto.randomUUID();

  try {
    const response = await fetch(`${recruitmentConfig.supabaseUrl.replace(/\/$/, '')}/functions/v1/apply`, {
      method: 'POST',
      headers: {
        apikey: recruitmentConfig.supabaseAnonKey,
        Authorization: `Bearer ${recruitmentConfig.supabaseAnonKey}`,
        'X-Idempotency-Key': pendingIdempotencyKey
      },
      body: formData
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Your application could not be submitted. Please try again or email ATHINET.');
    setSuccess(result);
  } catch (error) {
    showStatus(error.message || 'Your application could not be submitted. Please try again or email ATHINET.');
    window.turnstile?.reset();
    document.getElementById('turnstileToken').value = '';
  } finally {
    applicationFields.disabled = false;
    applicationSubmit.disabled = false;
    applicationSubmit.textContent = 'Submit application';
  }
});

document.getElementById('dialogClose').addEventListener('click', () => vacancyDialog.close());
vacancyDialog.addEventListener('close', () => lastFocusedElement?.focus());
document.querySelectorAll('.nav-toggle').forEach((toggle) => {
  const nav = document.getElementById(toggle.getAttribute('aria-controls'));
  if (!nav) return;
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation menu');
  }));
});

document.getElementById('year').textContent = new Date().getFullYear();
if (configured) activateForm();
loadJobs();