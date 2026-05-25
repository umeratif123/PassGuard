'use strict';

const input       = document.getElementById('password-input');
const toggleBtn   = document.getElementById('toggle-visibility');
const eyeOpen     = document.getElementById('eye-open');
const eyeClosed   = document.getElementById('eye-closed');
const strengthBar = document.getElementById('strength-bar');
const strengthTxt = document.getElementById('strength-text');
const barTrack    = document.querySelector('.bar-track');
const generateBtn = document.getElementById('generate-btn');
const copyBtn     = document.getElementById('copy-btn');
const copyIcon    = document.getElementById('copy-icon');
const checkIcon   = document.getElementById('check-icon');
const copyText    = document.getElementById('copy-text');

const ruleLength  = document.getElementById('rule-length');
const ruleNumber  = document.getElementById('rule-number');
const ruleUpper   = document.getElementById('rule-upper');
const ruleSpecial = document.getElementById('rule-special');

const segments = [
  document.getElementById('seg-1'),
  document.getElementById('seg-2'),
  document.getElementById('seg-3'),
  document.getElementById('seg-4'),
];

const STRENGTH_LEVELS = [
  { label: '—',          cls: '',       pct: 0   },
  { label: 'Weak',       cls: 'weak',   pct: 25  },
  { label: 'Medium',     cls: 'medium', pct: 50  },
  { label: 'Strong',     cls: 'good',   pct: 75  },
  { label: 'Very strong',cls: 'strong', pct: 100 },
];

const CHARSET_LOWER   = 'abcdefghijklmnopqrstuvwxyz';
const CHARSET_UPPER   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const CHARSET_NUMBERS = '0123456789';
const CHARSET_SPECIAL = '!@#$%^&*()-_=+[]{}|;:,.<>?';

function getRules(password) {
  return {
    length:  password.length >= 8,
    number:  /\d/.test(password),
    upper:   /[A-Z]/.test(password),
    special: /[^a-zA-Z0-9]/.test(password),
  };
}

function calcScore(password, rules) {
  if (!password.length) return 0;
  const met = Object.values(rules).filter(Boolean).length;
  if (met <= 1) return 1;
  if (met === 2) return 2;
  if (met === 3) return 3;
  return password.length >= 12 ? 4 : 3;
}

function updateUI(password) {
  const rules = getRules(password);
  const score = calcScore(password, rules);
  const level = STRENGTH_LEVELS[score];

  setRule(ruleLength,  rules.length);
  setRule(ruleNumber,  rules.number);
  setRule(ruleUpper,   rules.upper);
  setRule(ruleSpecial, rules.special);

  const prevCls = ['weak','medium','good','strong'];
  strengthBar.classList.remove(...prevCls);
  strengthTxt.classList.remove(...prevCls);
  segments.forEach(s => s.classList.remove(...prevCls));

  strengthBar.style.width = level.pct + '%';
  barTrack.setAttribute('aria-valuenow', score);

  if (level.cls) {
    strengthBar.classList.add(level.cls);
    strengthTxt.classList.add(level.cls);
    for (let i = 0; i < score; i++) {
      segments[i].classList.add(level.cls);
    }
  }

  strengthTxt.textContent = level.label;
}

function setRule(el, met) {
  if (met) {
    el.classList.add('met');
  } else {
    el.classList.remove('met');
  }
}

input.addEventListener('input', () => updateUI(input.value));

toggleBtn.addEventListener('click', () => {
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  eyeOpen.classList.toggle('hidden', isPassword);
  eyeClosed.classList.toggle('hidden', !isPassword);
  toggleBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
});

function generatePassword(length = 16) {
  const all = CHARSET_LOWER + CHARSET_UPPER + CHARSET_NUMBERS + CHARSET_SPECIAL;
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += all[arr[i] % all.length];
  }
  const hasUpper   = /[A-Z]/.test(result);
  const hasNumber  = /\d/.test(result);
  const hasSpecial = /[^a-zA-Z0-9]/.test(result);
  if (!hasUpper || !hasNumber || !hasSpecial) {
    return generatePassword(length);
  }
  return result;
}

generateBtn.addEventListener('click', () => {
  generateBtn.classList.add('spinning');
  setTimeout(() => generateBtn.classList.remove('spinning'), 500);

  const password = generatePassword(16);
  input.value = password;
  input.type = 'password';
  eyeOpen.classList.remove('hidden');
  eyeClosed.classList.add('hidden');
  toggleBtn.setAttribute('aria-label', 'Show password');
  updateUI(password);
});

let copyTimeout;
copyBtn.addEventListener('click', async () => {
  const value = input.value;
  if (!value) return;

  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = value;
    ta.style.position = 'fixed';
    ta.style.opacity  = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }

  copyBtn.classList.add('copied');
  copyIcon.classList.add('hidden');
  checkIcon.classList.remove('hidden');
  copyText.textContent = 'Copied!';

  clearTimeout(copyTimeout);
  copyTimeout = setTimeout(() => {
    copyBtn.classList.remove('copied');
    copyIcon.classList.remove('hidden');
    checkIcon.classList.add('hidden');
    copyText.textContent = 'Copy';
  }, 2000);
});

updateUI('');
