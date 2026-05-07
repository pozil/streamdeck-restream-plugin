import { readFileSync, writeFileSync } from 'fs';

const MANIFEST_PATH = './org.pozil.restream.sdPlugin/manifest.json';

// Read manifest
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));

// Parse version
const versionParts = manifest.Version.split('.');
if (versionParts.length !== 4) {
    console.error(`Invalid version format: ${manifest.Version}`);
    process.exit(1);
}

// Increment build number
const buildNumber = parseInt(versionParts[3], 10) + 1;
versionParts[3] = buildNumber.toString();
const newVersion = versionParts.join('.');

// Update manifest
manifest.Version = newVersion;
writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, '\t') + '\n', 'utf8');

console.log(`Build number incremented: ${manifest.Version}`);
