import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Building2,
  Check,
  Copy,
  Cpu,
  Fingerprint,
  FolderTree,
  Globe2,
  Hash,
  IdCard,
  KeyRound,
  Landmark,
  Layers,
  Server,
  ShieldCheck,
  Users,
} from 'lucide-react';
import styles from './styles.module.css';

const fieldIcons = {
  account: Landmark,
  arn: Server,
  compartment: FolderTree,
  group: Users,
  id: Fingerprint,
  key: KeyRound,
  model: Cpu,
  project: Layers,
  region: Globe2,
  role: ShieldCheck,
  tenancy: Building2,
  user: IdCard,
};

async function copyToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Clipboard API can reject on an unfocused document - fall back below.
  }

  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

export default function CopyField({
  label,
  value,
  icon = 'id',
  hint,
  badge,
  tone = 'quilr',
}) {
  const Icon = fieldIcons[icon] ?? Hash;
  const [copied, setCopied] = useState(false);
  const timeout = useRef(undefined);

  const handleCopy = useCallback(async () => {
    if (!(await copyToClipboard(value))) return;
    setCopied(true);
    window.clearTimeout(timeout.current);
    timeout.current = window.setTimeout(() => setCopied(false), 1400);
  }, [value]);

  useEffect(() => () => window.clearTimeout(timeout.current), []);

  return (
    <div className={`${styles.field} ${styles[tone] ?? ''} not-prose`}>
      <div className={styles.fieldHead}>
        <span className={styles.iconWrap}>
          <Icon size={15} strokeWidth={1.9} aria-hidden="true" />
        </span>
        <span className={styles.label}>{label}</span>
        {badge && <span className={styles.badge}>{badge}</span>}
      </div>

      <div className={styles.valueRow}>
        <code className={styles.value}>{value}</code>
        <button
          type="button"
          className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
          onClick={handleCopy}
          aria-label={copied ? `${label} copied` : `Copy ${label}`}
          title={copied ? 'Copied' : 'Copy'}>
          {copied ? (
            <Check size={15} strokeWidth={2.4} aria-hidden="true" />
          ) : (
            <Copy size={15} strokeWidth={2} aria-hidden="true" />
          )}
          <span className={styles.copyLabel}>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {hint && <p className={styles.hint}>{hint}</p>}
    </div>
  );
}

export function CopyFieldGroup({title, note, fields = [], tone = 'quilr'}) {
  return (
    <section className={`${styles.group} not-prose`} aria-label={title || 'Copyable values'}>
      {title && <h4 className={styles.groupTitle}>{title}</h4>}
      <div className={styles.groupGrid}>
        {fields.map((field) => (
          <CopyField key={field.label} tone={tone} {...field} />
        ))}
      </div>
      {note && <p className={styles.groupNote}>{note}</p>}
    </section>
  );
}
