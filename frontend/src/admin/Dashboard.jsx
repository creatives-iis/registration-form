import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function Dashboard() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]); // <- Track selected checkboxes

  useEffect(() => {
    fetch('http://localhost:3000/form/submissions')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setForms(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Fetch error:', error);
        setLoading(false);
      });
  }, []);

  const handleExport = async () => {
    try {
      const res = await fetch('http://localhost:3000/form/export-excel');
      if (!res.ok) throw new Error('Failed to fetch Excel file');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'form-submissions.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export Excel file');
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDownloadPDFs = async () => {
  try {
    const response = await fetch('http://localhost:3000/form/pdf-zip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedIds }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate ZIP file.');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'selected-forms.zip';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('PDF ZIP error:', error);
    alert('Failed to download selected PDFs.');
  }
};

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Form Submissions</h2>
      <button onClick={handleExport}>Export to Excel</button>
      <button
        onClick={handleDownloadPDFs}
        disabled={selectedIds.length === 0}
        style={{ marginLeft: '10px' }}
      >
        Save Selected as PDFs
      </button>

      {forms.length === 0 ? (
        <p>No form submissions found.</p>
      ) : (
        <ul>
          {forms.map(form => (
            <li key={form._id}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(form._id)}
                  onChange={() => toggleSelect(form._id)}
                  style={{ marginRight: '8px' }}
                />
                {form.firstName} {form.lastName} - {form.email}
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
