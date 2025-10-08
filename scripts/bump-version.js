import fs from 'fs';
import path from 'path';

const packageJsonPath = path.resolve('package.json');
const packageLockPath = path.resolve('package-lock.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function incrementPatch(version) {
  const parts = version.split('.').map((part) => Number.parseInt(part, 10));
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part) || part < 0)) {
    throw new Error(`Unsupported version format: ${version}`);
  }

  parts[2] += 1;
  return parts.join('.');
}

const packageJson = readJson(packageJsonPath);
const currentVersion = packageJson.version ?? '0.0.0';
const nextVersion = incrementPatch(currentVersion);

packageJson.version = nextVersion;
writeJson(packageJsonPath, packageJson);

if (fs.existsSync(packageLockPath)) {
  const packageLockJson = readJson(packageLockPath);
  if (packageLockJson.version) {
    packageLockJson.version = nextVersion;
  }
  if (
    packageLockJson.packages &&
    packageLockJson.packages[''] &&
    packageLockJson.packages[''].version
  ) {
    packageLockJson.packages[''].version = nextVersion;
  }
  writeJson(packageLockPath, packageLockJson);
}

console.log(`Version bumped from ${currentVersion} to ${nextVersion}`);
