import { createClient } from 'npm:@supabase/supabase-js@2';

const allowedOrigins = new Set([
  'https://athinet.co.ke',
  'https://www.athinet.co.ke'
]);
const allowedTurnstileHostnames = new Set(['athinet.co.ke', 'www.athinet.co.ke']);
const corsHeaders = (origin: string | null) => ({
  ...(origin && allowedOrigins.has(origin) ? { 'Access-Control-Allow-Origin': origin } : {}),
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info, x-idempotency-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin'
});
const maxFileSize = 5 * 1024 * 1024;
const maxTotalSize = 10 * 1024 * 1024;
const allowedTypes = new Map([
  ['pdf', 'application/pdf'],
  ['docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
]);

type UploadDocument = { type: 'cv' | 'certificate' | 'supporting_document'; file: File };

const respond = (body: Record<string, unknown>, status = 200, origin: string | null = null) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders(origin), 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
});

const textField = (form: FormData, key: string, maxLength: number): string => {
  const value = form.get(key);
  if (typeof value !== 'string') throw new Error(`Please provide ${key}.`);
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) throw new Error(`Please check the ${key} field.`);
  return normalized;
};

const readLimitedBody = async (request: Request, limit: number): Promise<Request> => {
  if (!request.body) throw new Error('The application form is empty.');
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) {
      await reader.cancel();
      throw new Error('The total upload is larger than the 10 MB limit.');
    }
    chunks.push(value);
  }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const headers = new Headers(request.headers);
  headers.delete('content-length');
  return new Request(request.url, { method: 'POST', headers, body });
};

const verifyFile = async (value: FormDataEntryValue | null, kind: UploadDocument['type'], required: boolean): Promise<UploadDocument | null> => {
  if (!(value instanceof File) || value.size === 0) {
    if (required) throw new Error('A CV or resume is required.');
    return null;
  }
  if (value.size > maxFileSize) throw new Error('Each document must be no larger than 5 MB.');
  const extension = value.name.toLowerCase().split('.').pop() || '';
  const expectedType = allowedTypes.get(extension);
  if (!expectedType || value.type !== expectedType) throw new Error('Documents must be PDF or DOCX files with a matching file type.');

  const header = new Uint8Array(await value.slice(0, 8).arrayBuffer());
  if (extension === 'pdf' && new TextDecoder().decode(header.slice(0, 5)) !== '%PDF-') {
    throw new Error('A submitted PDF file could not be verified.');
  }
  if (extension === 'docx' && !(header[0] === 0x50 && header[1] === 0x4b)) {
    throw new Error('A submitted DOCX file could not be verified.');
  }
  return { type: kind, file: value };
};

const verifyTurnstile = async (token: string, remoteIp: string | null) => {
  const secret = Deno.env.get('TURNSTILE_SECRET_KEY');
  if (!secret) throw new Error('Application submission is not configured. Please contact ATHINET.');
  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set('remoteip', remoteIp);
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  if (!response.ok) return false;
  const result = await response.json();
  return result.success === true && typeof result.hostname === 'string' && allowedTurnstileHostnames.has(result.hostname);
};

const sendNotification = async (input: { name: string; email: string; title: string; reference: string; submittedAt: string }) => {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('RECRUITMENT_FROM_EMAIL');
  if (!apiKey || !from) return false;
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: ['athinet72@gmail.com'],
        subject: `New application: ${input.title}`,
        text: [
          `Applicant: ${input.name}`,
          `Position: ${input.title}`,
          `Application reference: ${input.reference}`,
          `Submission date: ${input.submittedAt}`,
          `Contact email: ${input.email}`
        ].join('\n')
      })
    });
    if (!response.ok) console.error('Recruitment notification email failed.');
    return response.ok;
  } catch {
    console.error('Recruitment notification email failed.');
    return false;
  }
};

Deno.serve(async (request) => {
  const origin = request.headers.get('origin');
  const requestCorsHeaders = corsHeaders(origin);
  if (!origin || !allowedOrigins.has(origin)) {
    return new Response(JSON.stringify({ error: 'Origin not allowed.' }), {
      status: 403,
      headers: { ...requestCorsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  }
  if (request.method === 'OPTIONS') return new Response('ok', { headers: requestCorsHeaders });
  if (request.method !== 'POST') return respond({ error: 'Method not allowed.' }, 405, origin);

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > maxTotalSize + 2 * 1024 * 1024) return respond({ error: 'The total upload is larger than the 10 MB limit.' }, 413, origin);

  const idempotencyKey = request.headers.get('x-idempotency-key') || '';
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idempotencyKey)) {
    return respond({ error: 'The application could not be verified. Refresh the page and try again.' }, 400, origin);
  }

  try {
    const boundedRequest = await readLimitedBody(request, maxTotalSize + 2 * 1024 * 1024);
    const form = await boundedRequest.formData();
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) throw new Error('Application submission is not configured. Please contact ATHINET.');
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    const { data: existing } = await supabase.from('applications')
      .select('application_reference,submitted_at,job:jobs(title)')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();
    if (existing) {
      return respond({ reference: existing.application_reference, submittedAt: existing.submitted_at, position: existing.job.title }, 200, origin);
    }

    const applicant = {
      full_name: textField(form, 'fullName', 120),
      email: textField(form, 'email', 254).toLowerCase(),
      phone: textField(form, 'phone', 25),
      town_county: textField(form, 'townCounty', 120),
      country: textField(form, 'country', 80),
      education_level: textField(form, 'educationLevel', 80),
      course_qualification: textField(form, 'courseQualification', 160),
      institution: textField(form, 'institution', 160),
      work_experience: textField(form, 'workExperience', 2500),
      employment_status: textField(form, 'employmentStatus', 80),
      relevant_skills: textField(form, 'relevantSkills', 1500),
      interest: textField(form, 'interest', 2500),
      cover_letter: textField(form, 'coverLetter', 5000),
      availability: textField(form, 'availability', 160)
    };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applicant.email)) throw new Error('Enter a valid email address.');
    if (!/^\+?[0-9][0-9\s().-]{6,23}$/.test(applicant.phone)) throw new Error('Enter a valid phone number.');
    if (form.get('consent') !== 'on') throw new Error('Consent is required to submit an application.');

    const documents = (await Promise.all([
      verifyFile(form.get('cv'), 'cv', true),
      verifyFile(form.get('certificates'), 'certificate', false),
      verifyFile(form.get('supportingDocuments'), 'supporting_document', false)
    ])).filter((document): document is UploadDocument => document !== null);
    if (documents.reduce((total, document) => total + document.file.size, 0) > maxTotalSize) {
      throw new Error('All uploaded documents must total no more than 10 MB.');
    }

    const captchaToken = textField(form, 'turnstileToken', 4096);
    if (!await verifyTurnstile(captchaToken, request.headers.get('cf-connecting-ip'))) {
      return respond({ error: 'Spam protection could not verify this submission. Please try again.' }, 400, origin);
    }

    const slug = textField(form, 'vacancySlug', 120);
    const { data: job, error: jobError } = await supabase.from('jobs')
      .select('id,title,application_deadline,status,published_at')
      .eq('slug', slug)
      .eq('status', 'open')
      .not('published_at', 'is', null)
      .gt('application_deadline', new Date().toISOString())
      .maybeSingle();
    if (jobError || !job) return respond({ error: 'This vacancy is closed or its application deadline has passed.' }, 410, origin);

    const { data: application, error: insertError } = await supabase.from('applications')
      .insert({ ...applicant, job_id: job.id, idempotency_key: idempotencyKey, consent: true })
      .select('id,application_reference,submitted_at')
      .single();
    if (insertError) {
      if (insertError.code === '23505') {
        const { data: retry } = await supabase.from('applications')
          .select('application_reference,submitted_at,job:jobs(title)')
          .eq('idempotency_key', idempotencyKey)
          .maybeSingle();
        if (retry) return respond({ reference: retry.application_reference, submittedAt: retry.submitted_at, position: retry.job.title }, 200, origin);
      }
      throw new Error('The application could not be saved securely. Please try again or email ATHINET.');
    }

    const storedPaths: string[] = [];
    try {
      for (const document of documents) {
        const extension = document.file.name.toLowerCase().split('.').pop()!;
        const path = `${application.id}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage.from('recruitment-documents')
          .upload(path, document.file, { contentType: document.file.type, upsert: false });
        if (uploadError) throw uploadError;
        storedPaths.push(path);
        const { error: recordError } = await supabase.from('application_documents').insert({
          application_id: application.id,
          document_type: document.type,
          storage_path: path,
          content_type: document.file.type,
          file_size: document.file.size
        });
        if (recordError) throw recordError;
      }
    } catch (error) {
      if (storedPaths.length) await supabase.storage.from('recruitment-documents').remove(storedPaths);
      await supabase.from('applications').delete().eq('id', application.id);
      console.error('Recruitment document processing failed.');
      throw new Error('The application documents could not be stored securely. Please try again or email ATHINET.');
    }

    const notificationSent = await sendNotification({
      name: applicant.full_name,
      email: applicant.email,
      title: job.title,
      reference: application.application_reference,
      submittedAt: application.submitted_at
    });

    return respond({
      reference: application.application_reference,
      submittedAt: application.submitted_at,
      position: job.title,
      notificationSent
    }, 201, origin);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'The application could not be submitted. Please try again.';
    return respond({ error: message }, 400, origin);
  }
});