import { useCallback, useEffect, useState } from 'react';

export type UploadPendingChange = (delta: 1 | -1) => void;

export function useEditorSafety(close: () => void, { draftKept = false } = {}) {
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingUploads, setPendingUploads] = useState(0);

  useEffect(() => {
    if (!isDirty || isSaving) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty, isSaving]);

  const requestClose = () => {
    if (isSaving || pendingUploads > 0) return;
    const warning = draftKept
      ? '작성 중인 내용은 임시 보관되어 다시 열 때 이어서 쓸 수 있습니다. 닫을까요?'
      : '작성 중인 내용이 사라집니다. 닫을까요?';
    if (!isDirty || window.confirm(warning)) close();
  };

  const onUploadPendingChange = useCallback<UploadPendingChange>((delta) => {
    setPendingUploads((count) => Math.max(0, count + delta));
  }, []);

  return {
    isSaving,
    setIsSaving,
    setIsDirty,
    pendingUploads,
    onUploadPendingChange,
    requestClose,
  };
}
