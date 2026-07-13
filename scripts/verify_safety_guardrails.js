import * as fs from 'fs';
import * as path from 'path';

// Directories and files to scan
const SCAN_DIRS = [
  'apps/web/src',
  'apps/api/src',
  'workers',
  'packages',
  'infra',
  'scripts'
];

const SCAN_FILES = [
  '.env.example',
  '.env.demo.example',
  '.env.live.example',
  '.env.staging.example'
];

// Ignored extensions/files/folders
const IGNORED_EXTS = ['.md', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.jsonl', '.db'];
const IGNORED_PATHS = [
  'node_modules',
  'dist',
  'build',
  'package-lock.json',
  '.git',
  'verify_safety_guardrails.js' // exclude this script itself
];

// Safety rules with description and regular expressions
const FRONTEND_RULES = [
  {
    pattern: /stream_url/i,
    description: 'Avoid exposure of raw "stream_url" in frontend code.'
  },
  {
    pattern: /verification_hash/i,
    description: 'Avoid exposure of camera cryptographic "verification_hash" in frontend code.'
  },
  {
    pattern: /<video/i,
    description: 'Forbidden HTML <video> tag usage in frontend.'
  },
  {
    pattern: /webrtc|RTCPeerConnection|getUserMedia|peerConnection/i,
    description: 'Forbidden WebRTC/video streaming APIs in frontend.'
  },
  {
    pattern: /['"]camera\.(stream|feed|video)['"]/i,
    description: 'Forbidden WebSocket subscription to camera channels.'
  }
];

const GLOBAL_RULES = [
  {
    pattern: /biometric|facial_recognition|face_recognition|person_tracking|predictive_policing|social_profiling/i,
    description: 'Forbidden biometric, face recognition, person tracking, or profiling terminology.'
  }
];

const ENV_RULES = [
  {
    pattern: /^(AIRCRAFT_SOURCE_PASSWORD|OPENSKY_PASSWORD|JWT_SECRET|POSTGRES_PASSWORD)\s*=\s*['"]?(?!(postgres|your_|""|$|postgres_password_here|your_secure_jwt_secret_here|your_opensky_password_here))[^\s'"]+['"]?$/im,
    description: 'Detected likely hardcoded sensitive production credentials in env templates.'
  }
];

let violationsCount = 0;

function scanFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const lines = fileContent.split('\n');

  // Determine rules to apply based on file path
  const rulesToApply = [];
  
  if (filePath.includes('apps/web/src')) {
    rulesToApply.push(...FRONTEND_RULES);
  }
  
  rulesToApply.push(...GLOBAL_RULES);

  if (SCAN_FILES.some(f => filePath.endsWith(f))) {
    rulesToApply.push(...ENV_RULES);
  }

  // Scan lines
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;

    // 1. Skip comment lines
    if (line.startsWith('//') || line.startsWith('*') || line.startsWith('/*') || line.startsWith('--') || line.startsWith('#')) {
      continue;
    }

    // 2. Skip inline comments by stripping them for match checks
    let codeOnly = line;
    if (line.includes('//')) {
      codeOnly = line.substring(0, line.indexOf('//')).trim();
    }
    if (line.includes('--')) {
      codeOnly = line.substring(0, line.indexOf('--')).trim();
    }

    // 3. Skip lines that are defining lists of filtered keywords or testing/asserting safety
    if (
      codeOnly.includes('keysToFilter') ||
      codeOnly.includes('sensitiveWords') ||
      codeOnly.includes('sensitiveKeys') ||
      codeOnly.includes('blacklist') ||
      codeOnly.includes('whitelist') ||
      codeOnly.includes('filter') ||
      codeOnly.includes('exclude') ||
      codeOnly.includes('EXCLUDED') ||
      codeOnly.includes('PROHIBITED') ||
      codeOnly.includes('allow')
    ) {
      continue;
    }

    for (const rule of rulesToApply) {
      if (rule.pattern.test(codeOnly)) {
        console.error(`❌ VIOLATION [${rule.description}]`);
        console.error(`   File: ${filePath}:${i + 1}`);
        console.error(`   Line: ${line}`);
        violationsCount++;
      }
    }
  }
}

function traverseAndScan(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const stats = fs.statSync(dirPath);

  if (stats.isFile()) {
    const ext = path.extname(dirPath);
    if (IGNORED_EXTS.includes(ext)) return;
    if (IGNORED_PATHS.some(p => dirPath.includes(p))) return;
    scanFile(dirPath);
    return;
  }

  if (stats.isDirectory()) {
    if (IGNORED_PATHS.some(p => dirPath.includes(p))) return;
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      traverseAndScan(path.join(dirPath, file));
    }
  }
}

console.log('🛡️ Starting Safety Guardrails Verification Scanner...');

// Scan directories
for (const dir of SCAN_DIRS) {
  const fullPath = path.resolve(dir);
  console.log(`   Scanning directory: ${dir}`);
  traverseAndScan(fullPath);
}

// Scan separate files
for (const file of SCAN_FILES) {
  const fullPath = path.resolve(file);
  if (fs.existsSync(fullPath)) {
    console.log(`   Scanning config file: ${file}`);
    scanFile(fullPath);
  }
}

console.log('\n==================================================');
if (violationsCount > 0) {
  console.error(`❌ Safety Verification FAILED with ${violationsCount} violations.`);
  process.exit(1);
} else {
  console.log('✅ Safety Verification PASSED. No forbidden patterns detected in code/configs.');
  process.exit(0);
}
