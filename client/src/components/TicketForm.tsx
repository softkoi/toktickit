import React, { useState, useEffect } from 'react';
import { AlertCircle, UploadCloud } from 'lucide-react';
import { useRequester } from '../context/RequesterContext';

interface Category {
  id: number;
  name: string;
}

interface RelatedSystem {
  id: number;
  name: string;
}

interface TicketFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const TicketForm: React.FC<TicketFormProps> = ({ onSuccess, onCancel }) => {
  const { activeRequester } = useRequester();
  const [categories, setCategories] = useState<Category[]>([]);
  const [relatedSystems, setRelatedSystems] = useState<RelatedSystem[]>([]);

  const [categoryId, setCategoryId] = useState<string>('');
  const [relatedSystemId, setRelatedSystemId] = useState<string>('');
  const [requestedPriority, setRequestedPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [summary, setSummary] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingRefData, setFetchingRefData] = useState<boolean>(true);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReferenceData() {
      try {
        setFetchingRefData(true);
        const [catRes, sysRes] = await Promise.all([
          fetch('http://localhost:3000/api/categories'),
          fetch('http://localhost:3000/api/related-systems'),
        ]);

        const catData = await catRes.json();
        const sysData = await sysRes.json();

        if (catData.success) setCategories(catData.data);
        if (sysData.success) setRelatedSystems(sysData.data);
      } catch (err) {
        console.error('Failed to load reference data:', err);
      } finally {
        setFetchingRefData(false);
      }
    }

    fetchReferenceData();
  }, []);

  const validateForm = (): boolean => {
    const errs: { [key: string]: string } = {};

    if (!categoryId) {
      errs.categoryId = 'Please select a category.';
    }

    if (!relatedSystemId) {
      errs.relatedSystemId = 'Please select a related system.';
    }

    const trimmedSummary = summary.trim();
    if (trimmedSummary.length < 5 || trimmedSummary.length > 200) {
      errs.summary = 'Summary must be between 5 and 200 characters.';
    }

    const trimmedDesc = description.trim();
    if (trimmedDesc.length < 5 || trimmedDesc.length > 2000) {
      errs.description = 'Description must be between 5 and 2000 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validateForm()) {
      return;
    }

    if (!activeRequester) {
      setGeneralError('Please select a Requester identity first.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requester-Id': String(activeRequester.id),
        },
        body: JSON.stringify({
          categoryId: parseInt(categoryId, 10),
          relatedSystemId: parseInt(relatedSystemId, 10),
          requestedPriority,
          summary: summary.trim(),
          description: description.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.error && result.error.fields) {
          const fieldErrs: { [key: string]: string } = {};
          result.error.fields.forEach((f: { field: string; message: string }) => {
            fieldErrs[f.field] = f.message;
          });
          setErrors(fieldErrs);
        } else {
          setGeneralError(result.error?.message || 'Failed to create ticket.');
        }
        return;
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setGeneralError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card ticket-form-card" style={{ maxWidth: '850px', margin: '0 auto', padding: '32px', background: '#FFF', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1A2D23', marginBottom: '8px' }}>Create Support Ticket</h2>
      <p style={{ color: '#5C6B73', marginBottom: '24px', fontSize: '14px' }}>
        Please fill in the details below to submit a new IT issue ticket.
      </p>

      {generalError && (
        <div style={{ background: '#FFF8F8', border: '1px solid #D32F2F', color: '#D32F2F', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} />
          <span>{generalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          {/* Category Dropdown */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '6px', color: '#1A2D23' }}>
              Category <span style={{ color: '#D32F2F' }}>*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={errors.categoryId ? 'form-control invalid' : 'form-control'}
              disabled={fetchingRefData || loading}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: errors.categoryId ? '1px solid #D32F2F' : '1px solid #C4D3CB', fontSize: '14px' }}
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <span style={{ color: '#D32F2F', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.categoryId}</span>}
          </div>

          {/* Related System Dropdown */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '6px', color: '#1A2D23' }}>
              Related System <span style={{ color: '#D32F2F' }}>*</span>
            </label>
            <select
              value={relatedSystemId}
              onChange={(e) => setRelatedSystemId(e.target.value)}
              className={errors.relatedSystemId ? 'form-control invalid' : 'form-control'}
              disabled={fetchingRefData || loading}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: errors.relatedSystemId ? '1px solid #D32F2F' : '1px solid #C4D3CB', fontSize: '14px' }}
            >
              <option value="">-- Select Related System --</option>
              {relatedSystems.map((sys) => (
                <option key={sys.id} value={sys.id}>
                  {sys.name}
                </option>
              ))}
            </select>
            {errors.relatedSystemId && <span style={{ color: '#D32F2F', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.relatedSystemId}</span>}
          </div>
        </div>

        {/* Priority Selector */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '8px', color: '#1A2D23' }}>
            Priority Level <span style={{ color: '#D32F2F' }}>*</span>
          </label>
          <div style={{ display: 'flex', gap: '16px' }}>
            {(['LOW', 'MEDIUM', 'HIGH'] as const).map((p) => (
              <label
                key={p}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: requestedPriority === p ? '2px solid #006B3C' : '1px solid #C4D3CB',
                  background: requestedPriority === p ? '#EAF6EF' : '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: requestedPriority === p ? 600 : 400,
                  fontSize: '14px',
                  color: '#1A2D23',
                }}
              >
                <input
                  type="radio"
                  name="requestedPriority"
                  value={p}
                  checked={requestedPriority === p}
                  onChange={() => setRequestedPriority(p)}
                  disabled={loading}
                />
                <span>{p}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Summary Input with Char Counter */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ fontWeight: 600, fontSize: '14px', color: '#1A2D23' }}>
              Summary <span style={{ color: '#D32F2F' }}>*</span>
            </label>
            <span style={{ fontSize: '12px', color: summary.length > 200 ? '#D32F2F' : '#5C6B73' }}>
              {summary.length} / 200
            </span>
          </div>
          <input
            type="text"
            placeholder="Brief summary of the issue (5-200 chars)"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            disabled={loading}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: errors.summary ? '1px solid #D32F2F' : '1px solid #C4D3CB', fontSize: '14px' }}
          />
          {errors.summary && <span style={{ color: '#D32F2F', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.summary}</span>}
        </div>

        {/* Description Textarea with Char Counter */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ fontWeight: 600, fontSize: '14px', color: '#1A2D23' }}>
              Description <span style={{ color: '#D32F2F' }}>*</span>
            </label>
            <span style={{ fontSize: '12px', color: description.length > 2000 ? '#D32F2F' : '#5C6B73' }}>
              {description.length} / 2000
            </span>
          </div>
          <textarea
            rows={5}
            placeholder="Detailed description of the problem (5-2000 chars)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: errors.description ? '1px solid #D32F2F' : '1px solid #C4D3CB', fontSize: '14px', fontFamily: 'inherit' }}
          />
          {errors.description && <span style={{ color: '#D32F2F', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.description}</span>}
        </div>

        {/* Attachment Dropzone Placeholder */}
        <div style={{ marginBottom: '32px', border: '2px dashed #C4D3CB', borderRadius: '12px', padding: '24px', textAlign: 'center', background: '#F8FBF9' }}>
          <UploadCloud size={32} color="#006B3C" style={{ marginBottom: '8px' }} />
          <p style={{ fontWeight: 600, fontSize: '14px', color: '#1A2D23' }}>Drag & Drop file attachments here, or click to browse</p>
          <p style={{ fontSize: '12px', color: '#5C6B73', marginTop: '4px' }}>Supports JPG, PNG, WEBP, PDF (Max 5MB per file, up to 5 files)</p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
            style={{ padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', background: '#F4F9F6', border: '1px solid #C4D3CB', color: '#1A2D23' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ padding: '10px 24px', borderRadius: '8px', backgroundColor: '#006B3C', color: '#FFF', border: 'none', fontWeight: 600, cursor: 'pointer' }}
          >
            {loading ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
};
