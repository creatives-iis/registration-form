import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function Dashboard() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

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
      const res = await fetch('http://localhost:3000/form/export-excel');  // Your Next.js API route
      if (!res.ok) throw new Error('Failed to fetch Excel file');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      // Create temporary <a> link and trigger download
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

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Form Submissions</h2>
      <button onClick={handleExport}>Export to Excel</button>
      {forms.length === 0 ? (
        <p>No form submissions found.</p>
      ) : (
        <ul>
          {forms.map(form => (
            <li key={form._id}>
              {form.firstName} {form.lastName} - {form.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
