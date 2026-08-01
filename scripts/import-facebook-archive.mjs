import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const workspaceRoot = path.resolve(import.meta.dirname, '..');
const envPath = path.join(workspaceRoot, '.env');
const sourceDirectory =
  process.env.FACEBOOK_ASSETS_DIR ??
  'C:\\Users\\gkaka\\Downloads\\Rekhta Academy Pakistan _ Facebook';
const bucketId = 'rekhta-facebook-archive';

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

const headers = {
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
};

const files = (await readdir(sourceDirectory, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && /\.(?:jpe?g|png|svg)$/i.test(entry.name))
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

async function ensurePrivateBucket() {
  const response = await fetch(`${baseUrl}/storage/v1/bucket`, { headers });
  if (!response.ok) throw new Error(`Could not list storage buckets: ${response.status}`);
  const buckets = await response.json();
  if (buckets.some((bucket) => bucket.id === bucketId)) return;

  const create = await fetch(`${baseUrl}/storage/v1/bucket`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: bucketId, name: bucketId, public: false }),
  });
  if (!create.ok && create.status !== 409) {
    throw new Error(`Could not create storage bucket: ${create.status} ${await create.text()}`);
  }
}

function contentType(filename) {
  const extension = path.extname(filename).toLowerCase();
  if (extension === '.png') return 'image/png';
  if (extension === '.svg') return 'image/svg+xml';
  return 'image/jpeg';
}

await ensurePrivateBucket();
let uploaded = 0;
for (const [index, filename] of files.entries()) {
  const body = await readFile(path.join(sourceDirectory, filename));
  const target = `facebook/${encodeURIComponent(filename)}`;
  const response = await fetch(`${baseUrl}/storage/v1/object/${bucketId}/${target}`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': contentType(filename), 'x-upsert': 'true' },
    body,
  });
  if (!response.ok) throw new Error(`Upload failed for ${filename}: ${response.status} ${await response.text()}`);
  uploaded += 1;
  if (uploaded % 25 === 0 || uploaded === files.length) {
    console.log(`Uploaded ${uploaded}/${files.length}`);
  }
}

console.log(`Complete: ${uploaded} files uploaded to private bucket ${bucketId}.`);
