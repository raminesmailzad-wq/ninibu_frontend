import { rm } from 'node:fs/promises';
import path from 'node:path';

const cwd = process.cwd();
const mobileRoot = cwd.endsWith(path.join('apps', 'mobile')) ? cwd : path.resolve(cwd, 'apps/mobile');
const staleTargets = [
  '.expo',
  'app-example',
  'app/(auth)/index.tsx',
  'app/index.tsx',
  'app/(app)/maternal-health.tsx',
];

await Promise.all(staleTargets.map((target) => rm(path.resolve(mobileRoot, target), { recursive: true, force: true })));
console.log(`[mobile-preflight] cleaned stale Expo/template/legacy routes from ${mobileRoot}`);
