import { mkdir, rm, cp, access } from 'fs/promises';
import { constants } from 'fs';
import path from 'path';

const root = path.resolve('.');
const dist = path.join(root, 'dist');
const out = path.join(root, 'site');

async function exists(p) {
  try {
    await access(p, constants.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}

async function main() {
  if (!(await exists(dist))) {
    console.error('dist folder not found. Run `vite build` first.');
    process.exit(1);
  }

  // remove existing site folder
  if (await exists(out)) {
    await rm(out, { recursive: true, force: true });
  }

  await mkdir(out, { recursive: true });

  // copy dist/* -> site/
  await cp(dist, out, { recursive: true });

  console.log('Copied dist -> site');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
