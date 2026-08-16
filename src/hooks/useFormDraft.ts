import { useCallback, useEffect, useRef } from 'react';

type Draft = Record<string, string>;

const readDraft = (key: string): Draft | null => {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? 'null') as unknown;
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Draft : null;
  } catch {
    return null;
  }
};

type Field = { name: string; type?: string; value: string; checked?: boolean };

// An unchecked box is simply absent from FormData, so presence of the key is the restored state.
export const applyDraft = (fields: Iterable<Field>, draft: Draft) => {
  for (const field of fields) {
    if (!field.name) continue;
    if (field.type === 'checkbox' || field.type === 'radio') field.checked = field.name in draft;
    else if (field.name in draft) field.value = draft[field.name];
  }
};

/**
 * Keeps a half-written editor form in the browser so closing the dialog does not lose it.
 * ponytail: form values only. Files already live in storage by the time their URL lands in the form.
 */
export function useFormDraft(key: string) {
  const formRef = useRef<HTMLFormElement>(null);

  const clearDraft = useCallback(() => {
    try { localStorage.removeItem(key); } catch { /* storage blocked, nothing to clear */ }
  }, [key]);

  const saveDraft = useCallback((form: HTMLFormElement) => {
    try {
      localStorage.setItem(key, JSON.stringify(Object.fromEntries(new FormData(form)) as Draft));
    } catch {
      // Browsing and editing must continue when storage is blocked or full.
    }
  }, [key]);

  useEffect(() => {
    const form = formRef.current;
    const draft = readDraft(key);
    if (!form || !draft) return;
    if (window.confirm('저장하지 않고 작성 중이던 내용이 있습니다. 이어서 쓸까요?')) {
      applyDraft(Array.from(form.elements) as unknown as Field[], draft);
    }
    else clearDraft();
  }, [key, clearDraft]);

  return { formRef, saveDraft, clearDraft };
}
