import React, {useCallback, useState, useRef, useEffect} from 'react';
import clsx from 'clsx';
import {translate} from '@docusaurus/Translate';
import {useCodeBlockContext} from '@docusaurus/theme-common/internal';
import Button from '@theme/CodeBlock/Buttons/Button';
import IconCopy from '@theme/Icon/Copy';
import IconSuccess from '@theme/Icon/Success';

import styles from './styles.module.css';

function title() {
  return translate({
    id: 'theme.CodeBlock.copy',
    message: 'Copy',
    description: 'The copy button label on code blocks',
  });
}

function ariaLabel(isCopied) {
  return isCopied
    ? translate({
        id: 'theme.CodeBlock.copied',
        message: 'Copied',
        description: 'The copied button label on code blocks',
      })
    : translate({
        id: 'theme.CodeBlock.copyButtonAriaLabel',
        message: 'Copy code to clipboard',
        description: 'The ARIA label for copy code blocks button',
      });
}

/**
 * Reads code from the DOM, skipping lines marked as diff-remove.
 * Falls back to metadata.code if no diff lines are present.
 */
function getCodeToCopy(buttonEl, fallbackCode) {
  if (!buttonEl) return fallbackCode;

  const codeBlock = buttonEl.closest('.theme-code-block');
  if (!codeBlock) return fallbackCode;

  // Only do DOM-based filtering if there are diff-remove lines
  if (!codeBlock.querySelector('.code-block-diff-remove-line')) {
    return fallbackCode;
  }

  const codeEl = codeBlock.querySelector('pre code');
  if (!codeEl) return fallbackCode;

  const lineSpans = codeEl.querySelectorAll(':scope > span');
  const lines = [];

  for (const span of lineSpans) {
    if (span.classList.contains('code-block-diff-remove-line')) continue;
    lines.push(span.textContent.replace(/\n$/, ''));
  }

  return lines.join('\n');
}

export default function CopyButton({className}) {
  const {metadata: {code}} = useCodeBlockContext();
  const [isCopied, setIsCopied] = useState(false);
  const copyTimeout = useRef(undefined);

  const handleCopy = useCallback(
    (e) => {
      const textToCopy = getCodeToCopy(e.currentTarget, code);

      navigator.clipboard.writeText(textToCopy).then(() => {
        setIsCopied(true);
        copyTimeout.current = window.setTimeout(() => {
          setIsCopied(false);
        }, 1000);
      });
    },
    [code],
  );

  useEffect(() => () => window.clearTimeout(copyTimeout.current), []);

  return (
    <Button
      aria-label={ariaLabel(isCopied)}
      title={title()}
      className={clsx(
        className,
        styles.copyButton,
        isCopied && styles.copyButtonCopied,
      )}
      onClick={handleCopy}>
      <span className={styles.copyButtonIcons} aria-hidden="true">
        <IconCopy className={styles.copyButtonIcon} />
        <IconSuccess className={styles.copyButtonSuccessIcon} />
      </span>
    </Button>
  );
}
