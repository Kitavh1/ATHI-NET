const adminConfig = window.ATHINET_RECRUITMENT_CONFIG || {};
const adminBaseUrl = (adminConfig.supabaseUrl || '').replace(/\/$/, '');
let accessToken = '';
let jobs = [];
let applications = [];

const byId = (id) => document.getElementById(id);
const setMessage = (id, message, success = false) => {
  const node = byId(id);
  node.textContent = message;
  node.classList.toggle('success', success);
};

const api = async (path, options = {}) => {
  if (!adminBaseUrl || !adminConfig.supabaseAnonKey || !accessToken) throw new Error('Recruitment administration is not configured.');
  const response = await fetch(`${adminBaseUrl}${path}`, {
    ...options,
    headers: {
      apikey: adminConfig.supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  if (!response.ok) {
    if (response.status === 401) signOut();
    throw new Error('The request could not be completed. Check access and try again.');
  }
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

const addCell = (row, value) => {
  const cell = document.createElement('td');
  cell.textContent = value || 'Not provided';
  row.append(cell);
  return cell;
};

const formatTimestamp = (value) => new Intl.DateTimeFormat('en-KE', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Nairobi'
}).format(new Date(value));

const statusOptions = [
  ['received', 'Received'], ['under_review', 'Under Review'], ['shortlisted', 'Shortlisted'],
  ['interview', 'Interview'], ['successful', 'Successful'], ['unsuccessful', 'Unsuccessful']
];

const renderApplications = () => {
  const body = byId('applicationsBody');
  const needle = byId('applicationSearch').value.trim().toLowerCase();
  body.replaceChildren();
  const visible = applications.filter((application) =>
    `${application.full_name} ${application.email} ${application.job?.title || ''}`.toLowerCase().includes(needle)
  );

  visible.forEach((application) => {
    const row = document.createElement('tr');
    addCell(row, `${application.full_name}\n${application.email}\n${application.phone}`);
    addCell(row, application.job?.title);
    addCell(row, formatTimestamp(application.submitted_at));

    const statusCell = document.createElement('td');
    const status = document.createElement('select');
    status.setAttribute('aria-label', `Update status for ${application.full_name}`);
    statusOptions.forEach(([value, label]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      status.append(option);
    });
    status.value = application.status;
    status.addEventListener('change', async () => {
      try {
        await api(`/rest/v1/applications?id=eq.${encodeURIComponent(application.id)}`, {
          method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: status.value })
        });
        application.status = status.value;
        setMessage('applicationMessage', 'Application status updated.', true);
      } catch (error) {
        setMessage('applicationMessage', error.message);
        status.value = application.status;
      }
    });
    statusCell.append(status);
    row.append(statusCell);

    const documentCell = document.createElement('td');
    application.documents.forEach((documentRecord) => {
      const download = document.createElement('button');
      download.type = 'button';
      download.textContent = documentRecord.document_type.replaceAll('_', ' ');
      download.addEventListener('click', async () => {
        download.disabled = true;
        try {
          const response = await api(`/storage/v1/object/sign/recruitment-documents/${documentRecord.storage_path.split('/').map(encodeURIComponent).join('/')}`, {
            method: 'POST', body: JSON.stringify({ expiresIn: 60 })
          });
          const signedUrl = response.signedURL.startsWith('http') ? response.signedURL : `${adminBaseUrl}/storage/v1${response.signedURL}`;
          window.location.assign(signedUrl);
        } catch (error) {
          setMessage('applicationMessage', error.message);
          download.disabled = false;
        }
      });
      documentCell.append(download, document.createTextNode(' '));
    });
    if (!application.documents.length) documentCell.textContent = 'No documents';
    row.append(documentCell);

    const detailsCell = document.createElement('td');
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = 'Review details';
    details.append(summary);
    const detailLines = [
      `Reference: ${application.application_reference}`,
      `Town/county: ${application.town_county}, ${application.country}`,
      `Education: ${application.education_level} - ${application.course_qualification}`,
      `Institution: ${application.institution}`,
      `Experience: ${application.work_experience}`,
      `Employment: ${application.employment_status}`,
      `Skills: ${application.relevant_skills}`,
      `Interest: ${application.interest}`,
      `Cover letter: ${application.cover_letter}`,
      `Availability: ${application.availability}`
    ];
    details.append(createTextBlock(detailLines.join('\n')));
    detailsCell.append(details);
    row.append(detailsCell);
    body.append(row);
  });
  setMessage('applicationMessage', `${visible.length} application(s) shown. Latest 500 records are loaded.`);
};

const createTextBlock = (content) => {
  const paragraph = document.createElement('p');
  paragraph.textContent = content;
  return paragraph;
};

const loadApplications = async () => {
  const query = '/rest/v1/applications?select=id,application_reference,full_name,email,phone,town_county,country,education_level,course_qualification,institution,work_experience,employment_status,relevant_skills,interest,cover_letter,availability,status,submitted_at,job:jobs(title,slug),documents:application_documents(id,document_type,storage_path)&order=submitted_at.desc&limit=500';
  applications = await api(query);
  renderApplications();
};

const resetJobForm = () => {
  byId('jobForm').reset();
  byId('jobId').value = '';
  byId('jobEmail').value = 'athinet72@gmail.com';
  byId('jobPicker').value = '';
  setMessage('jobMessage', '');
};

const populateJobForm = (job) => {
  byId('jobId').value = job.id;
  byId('jobTitle').value = job.title;
  byId('jobSlug').value = job.slug;
  byId('jobDepartment').value = job.department || '';
  byId('jobLocation').value = job.location || '';
  byId('jobType').value = job.employment_type || '';
  byId('jobPositions').value = job.positions || '';
  byId('jobShortDescription').value = job.short_description;
  byId('jobDescription').value = job.description;
  byId('jobResponsibilities').value = (job.responsibilities || []).join('\n');
  byId('jobQualifications').value = (job.qualifications || []).join('\n');
  byId('jobExperience').value = job.required_experience || '';
  byId('jobSkills').value = (job.required_skills || []).join('\n');
  byId('jobDeadline').value = new Date(job.application_deadline).toISOString().slice(0, 16);
  byId('jobEmail').value = job.application_email;
  byId('jobStatus').value = job.status;
};

const loadJobs = async () => {
  jobs = await api('/rest/v1/jobs?select=*&order=created_at.desc');
  const picker = byId('jobPicker');
  picker.replaceChildren(new Option('Create a vacancy', ''));
  jobs.forEach((job) => picker.add(new Option(`${job.title} (${job.status})`, job.id)));
};

const loadWorkspace = async () => {
  await Promise.all([loadApplications(), loadJobs()]);
  byId('loginPanel').hidden = true;
  byId('adminWorkspace').hidden = false;
  byId('signOut').hidden = false;
};

const signOut = () => {
  accessToken = '';
  applications = [];
  jobs = [];
  byId('loginPanel').hidden = false;
  byId('adminWorkspace').hidden = true;
  byId('signOut').hidden = true;
};

byId('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  setMessage('loginMessage', '');
  try {
    if (!adminBaseUrl || !adminConfig.supabaseAnonKey) throw new Error('Recruitment administration is not configured.');
    const response = await fetch(`${adminBaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { apikey: adminConfig.supabaseAnonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: byId('adminEmail').value.trim(), password: byId('adminPassword').value })
    });
    const result = await response.json();
    if (!response.ok || !result.access_token) throw new Error('Sign-in failed. Check your account and try again.');
    accessToken = result.access_token;
    const isAdmin = await api('/rest/v1/rpc/is_recruitment_admin', { method: 'POST', body: '{}' });
    if (isAdmin !== true) throw new Error('This account is not authorized for recruitment administration.');
    byId('adminPassword').value = '';
    await loadWorkspace();
  } catch (error) {
    signOut();
    setMessage('loginMessage', error.message);
  }
});

byId('signOut').addEventListener('click', signOut);
byId('refreshApplications').addEventListener('click', async () => {
  try { await loadApplications(); }
  catch (error) { setMessage('applicationMessage', error.message); }
});
byId('applicationSearch').addEventListener('input', renderApplications);
byId('jobPicker').addEventListener('change', () => {
  const selected = jobs.find((job) => job.id === byId('jobPicker').value);
  if (selected) populateJobForm(selected);
  else resetJobForm();
});
byId('newJob').addEventListener('click', resetJobForm);

byId('jobForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!byId('jobForm').reportValidity()) return;
  const existing = jobs.find((job) => job.id === byId('jobId').value);
  const deadline = new Date(byId('jobDeadline').value);
  const status = byId('jobStatus').value;
  const payload = {
    title: byId('jobTitle').value.trim(),
    slug: byId('jobSlug').value.trim(),
    department: byId('jobDepartment').value.trim() || null,
    location: byId('jobLocation').value.trim() || null,
    employment_type: byId('jobType').value.trim() || null,
    positions: byId('jobPositions').value ? Number(byId('jobPositions').value) : null,
    short_description: byId('jobShortDescription').value.trim(),
    description: byId('jobDescription').value.trim(),
    responsibilities: byId('jobResponsibilities').value.split('\n').map((line) => line.trim()).filter(Boolean),
    qualifications: byId('jobQualifications').value.split('\n').map((line) => line.trim()).filter(Boolean),
    required_experience: byId('jobExperience').value.trim() || null,
    required_skills: byId('jobSkills').value.split('\n').map((line) => line.trim()).filter(Boolean),
    application_deadline: deadline.toISOString(),
    application_email: byId('jobEmail').value.trim(),
    status,
    published_at: status === 'open' ? existing?.published_at || new Date().toISOString() : existing?.published_at || null
  };

  try {
    const id = byId('jobId').value;
    await api(id ? `/rest/v1/jobs?id=eq.${encodeURIComponent(id)}` : '/rest/v1/jobs', {
      method: id ? 'PATCH' : 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(payload)
    });
    setMessage('jobMessage', 'Vacancy saved.', true);
    await loadJobs();
    resetJobForm();
    setMessage('jobMessage', 'Vacancy saved.', true);
  } catch (error) {
    setMessage('jobMessage', error.message);
  }
});