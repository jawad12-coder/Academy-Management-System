import { readFile } from 'node:fs/promises';
import path from 'node:path';

const workspaceRoot = path.resolve(import.meta.dirname, '..');
const envPath = path.join(workspaceRoot, '.env');
const bucketId = 'rekhta-facebook-archive';
const objectPrefix = 'facebook';

function parseEnv(contents) {
  return Object.fromEntries(
    contents
      .split(/\r?\n/)
      .map((line) => line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/))
      .filter(Boolean)
      .map(([, key, value]) => [key, value]),
  );
}

const env = { ...parseEnv(await readFile(envPath, 'utf8')), ...process.env };
const baseUrl = env.VITE_SUPABASE_URL?.replace(/\/$/, '');
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!baseUrl || !serviceRoleKey) {
  throw new Error('VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.');
}

const storageHeaders = {
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
};

const postgrestHeaders = {
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
  'Content-Type': 'application/json',
};

async function makeBucketPublic() {
  const response = await fetch(`${baseUrl}/storage/v1/bucket/${bucketId}`, {
    method: 'PUT',
    headers: { ...storageHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ public: true }),
  });
  if (!response.ok) {
    throw new Error(`Could not make bucket public: ${response.status} ${await response.text()}`);
  }
  const body = await response.json().catch(() => null);
  console.log(`Bucket ${bucketId} public: ${body?.public ?? 'updated'}`);
}

// The list API returns names RELATIVE to the prefix, so the stored object path is
// `${objectPrefix}/${name}` and the public URL must include the prefix too.
async function listBucketObjects() {
  const objects = [];
  let offset = 0;
  const limit = 100;
  for (;;) {
    const response = await fetch(`${baseUrl}/storage/v1/object/list/${bucketId}`, {
      method: 'POST',
      headers: { ...storageHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix: `${objectPrefix}/`, limit, offset, sortBy: { column: 'name', order: 'asc' } }),
    });
    if (!response.ok) throw new Error(`Could not list objects: ${response.status} ${await response.text()}`);
    const batch = await response.json();
    objects.push(...batch);
    if (batch.length < limit) break;
    offset += limit;
  }
  return objects;
}

function titleFromName(name) {
  const base = name.replace(/\.(?:jpe?g|png)$/i, '');
  const match = base.match(/imgi_(\d+)/i);
  return match ? `Facebook Photo ${match[1]}` : base.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

async function clearBucketRows() {
  const response = await fetch(`${baseUrl}/rest/v1/gallery?image_url=like.*rekhta-facebook-archive*`, {
    method: 'DELETE',
    headers: postgrestHeaders,
  });
  if (!response.ok && response.status !== 204) {
    throw new Error(`Could not clear existing gallery rows: ${response.status} ${await response.text()}`);
  }
}

await makeBucketPublic();
const objects = await listBucketObjects();
await clearBucketRows();

const publicBase = `${baseUrl}/storage/v1/object/public/${bucketId}/`;
const rows = [];
for (const object of objects) {
  const relative = object.name;
  if (/\.svg$/i.test(relative)) continue;
  const url = `${publicBase}${encodeURIComponent(objectPrefix)}/${encodeURIComponent(relative)}`;
  rows.push({
    title: titleFromName(relative),
    image_url: url,
    category: 'Events',
    is_public: true,
  });
}

if (rows.length === 0) {
  console.log(`No gallery rows to seed (${objects.length} objects in bucket).`);
  process.exit(0);
}

let inserted = 0;
for (let i = 0; i < rows.length; i += 100) {
  const chunk = rows.slice(i, i + 100);
  const response = await fetch(`${baseUrl}/rest/v1/gallery`, {
    method: 'POST',
    headers: postgrestHeaders,
    body: JSON.stringify(chunk),
  });
  if (!response.ok) throw new Error(`Insert failed: ${response.status} ${await response.text()}`);
  inserted += chunk.length;
  console.log(`Inserted ${inserted}/${rows.length} gallery rows`);
}

console.log(`Complete: ${inserted} gallery rows created from ${objects.length} bucket objects.`);
