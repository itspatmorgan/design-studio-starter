import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Report only signal names, never environment values (which may contain secrets).
const SIGNALS = {
  SSH_CONNECTION: 'ssh', SSH_CLIENT: 'ssh', SSH_TTY: 'ssh',
  CODESPACES: 'codespaces', GITPOD_WORKSPACE_ID: 'gitpod',
  REMOTE_CONTAINERS: 'container', CODESPACE_NAME: 'codespaces',
  WSL_DISTRO_NAME: 'wsl', WSL_INTEROP: 'wsl',
};

export function inspectEnvironment({ env = process.env, platform = process.platform,
  architecture = process.arch, home = os.homedir(), hostname = os.hostname(),
  username = os.userInfo().username, exists = fs.existsSync, read = file => fs.readFileSync(file, 'utf8'),
} = {}) {
  const signals = Object.entries(SIGNALS).filter(([key]) => env[key]).map(([, value]) => value);
  if (platform === 'linux') {
    if (exists('/.dockerenv') || exists('/run/.containerenv')) signals.push('container');
    try {
      const release = read('/proc/sys/kernel/osrelease');
      if (/microsoft/i.test(release)) signals.push('wsl');
    } catch { /* A missing proc filesystem is not proof of local execution. */ }
  }
  const observations = { platform, architecture, home, hostname, username,
    signals: [...new Set(signals)].sort() };
  return { ...observations, localAccess: 'unverified',
    pilot: platform === 'darwin' ? 'macOS' : 'unverified platform',
    suggestedParent: platform === 'darwin' ? path.join(home, 'Developer') : null,
  };
}

export function validateLocalAccess(environment, access) {
  if (!['darwin', 'linux', 'win32'].includes(environment.platform)) throw new Error('Unsupported execution OS. Use a supported local desktop session.');
  if (environment.signals.length) throw new Error(`Execution signals (${environment.signals.join(', ')}) require a native local session before setup. No studio was created.`);
  if (!access || !['host', 'person'].includes(access.basis) || typeof access.evidence !== 'string' || !access.evidence.trim()) {
    throw new Error('Local access is unverified. Record explicit host evidence or the person\'s confirmation before setup.');
  }
  if (access.expectedPlatform !== environment.platform) throw new Error('Execution OS differs from the confirmed computer OS. Switch to the correct local session before setup.');
}

export function environmentIdentity(environment) {
  return Object.fromEntries(['platform', 'architecture', 'home', 'hostname', 'username', 'signals'].map(key => [key, environment[key]]));
}

export function validateSetupPlan(plan, environment = inspectEnvironment()) {
  if (!plan || plan.schema !== 1 || plan.kind !== 'design-studio-setup' || typeof plan.name !== 'string' || !plan.name.trim() || plan.name.length > 120 || !path.isAbsolute(plan.destination ?? '')) {
    throw new Error('A valid setup plan is required. Run preflight, resolve local access, then run plan.');
  }
  validateLocalAccess(environment, plan.localAccess);
  if (JSON.stringify(environmentIdentity(plan.environment ?? {})) !== JSON.stringify(environmentIdentity(environment))) {
    throw new Error('The setup environment changed. Recheck local access and create a new plan for the same destination.');
  }
  return plan;
}

export function readSetupPlan(file) {
  if (!file || !path.isAbsolute(file)) throw new Error('Provide --plan with an absolute setup-plan file path.');
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('The setup plan must be an ordinary JSON file.');
  return validateSetupPlan(JSON.parse(fs.readFileSync(file, 'utf8')));
}
