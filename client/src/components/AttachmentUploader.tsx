import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, X, AlertCircle } from 'lucide-react';

export interface SelectedFile {
  id: string;
  file: File;
  previewUrl?: string;
  sizeFormatted: string;
}

interface AttachmentUploaderProps {
  files: SelectedFile[];
  onFilesChange: (files: SelectedFile[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({
  files,
  onFilesChange,
  maxFiles = 5,
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndAddFiles = (incomingFiles: File[]) => {
    setErrorMessage(null);
    const newSelectedFiles: SelectedFile[] = [...files];
    let hasTypeError = false;
    let hasSizeError = false;
    let hasQuotaError = false;

    for (const file of incomingFiles) {
      if (newSelectedFiles.length >= maxFiles) {
        hasQuotaError = true;
        break;
      }

      // Check mime type and extension
      const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
      const isMimeValid = ALLOWED_MIME_TYPES.includes(file.type);
      const isExtValid = ALLOWED_EXTENSIONS.includes(ext);

      if (!isMimeValid && !isExtValid) {
        hasTypeError = true;
        continue;
      }

      // Check size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        hasSizeError = true;
        continue;
      }

      const previewUrl = file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : undefined;

      newSelectedFiles.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        previewUrl,
        sizeFormatted: formatFileSize(file.size),
      });
    }

    if (hasTypeError) {
      setErrorMessage('Some files were rejected. Only JPG, PNG, WEBP, and PDF files are allowed.');
    } else if (hasSizeError) {
      setErrorMessage('Some files were rejected because they exceed the 5MB size limit.');
    } else if (hasQuotaError) {
      setErrorMessage(`Maximum limit of ${maxFiles} attachments per ticket reached.`);
    }

    onFilesChange(newSelectedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      validateAndAddFiles(droppedFiles);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      validateAndAddFiles(selected);
      // Reset input value so re-selecting same file triggers onChange
      e.target.value = '';
    }
  };

  const handleRemoveFile = (idToRemove: string) => {
    const updated = files.filter((f) => f.id !== idToRemove);
    // Revoke object URL to avoid memory leaks
    const removedFile = files.find((f) => f.id === idToRemove);
    if (removedFile?.previewUrl) {
      URL.revokeObjectURL(removedFile.previewUrl);
    }
    onFilesChange(updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
        Attachments ({files.length}/{maxFiles})
      </label>

      {/* Error Feedback Banner */}
      {errorMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 12px',
            backgroundColor: 'var(--color-error-bg)',
            border: '1px solid var(--color-error-base)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-error-text)',
            fontSize: '0.85rem',
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Dropzone area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && files.length < maxFiles && fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${
            isDragOver
              ? 'var(--color-primary-600)'
              : files.length >= maxFiles
              ? '#CBD5E1'
              : 'var(--color-primary-200)'
          }`,
          backgroundColor: isDragOver
            ? 'var(--color-primary-50)'
            : files.length >= maxFiles || disabled
            ? '#F8FAFC'
            : 'var(--color-surface-hover)',
          borderRadius: 'var(--radius-md)',
          padding: '24px 16px',
          textAlign: 'center',
          cursor: disabled || files.length >= maxFiles ? 'not-allowed' : 'pointer',
          transition: 'all 150ms ease-in-out',
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
          style={{ display: 'none' }}
          disabled={disabled || files.length >= maxFiles}
        />

        <UploadCloud
          size={36}
          style={{
            color: isDragOver ? 'var(--color-primary-700)' : 'var(--color-primary-600)',
            marginBottom: '8px',
          }}
        />

        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {files.length >= maxFiles
            ? 'Attachment quota reached (Max 5 files)'
            : 'Click to upload or drag & drop files here'}
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
          Allowed: JPG, PNG, WEBP, PDF (Max 5MB each)
        </div>
      </div>

      {/* List of selected attachments */}
      {files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
          {files.map((fileItem) => {
            const isImage = fileItem.file.type.startsWith('image/');
            return (
              <div
                key={fileItem.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--color-divider)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                  {isImage && fileItem.previewUrl ? (
                    <img
                      src={fileItem.previewUrl}
                      alt={fileItem.file.name}
                      style={{
                        width: '36px',
                        height: '36px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        border: '1px solid #E2E8F0',
                      }}
                    />
                  ) : isImage ? (
                    <ImageIcon size={24} style={{ color: 'var(--color-primary-600)' }} />
                  ) : (
                    <FileText size={24} style={{ color: '#D97706' }} />
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <span
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        color: 'var(--color-text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '220px',
                      }}
                      title={fileItem.file.name}
                    >
                      {fileItem.file.name}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {fileItem.sizeFormatted}
                    </span>
                  </div>
                </div>

                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(fileItem.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-text-muted)',
                      padding: '4px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Remove file"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
