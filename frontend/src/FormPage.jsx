import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

export default function FormPage() {
  const sigPad = useRef(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfApplication: '',
    signature: null,
    photo: null,
  });

  const [imagePreview, setImagePreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setFormData((prev) => ({
        ...prev,
        photo: file,
      }));
    }
  };

  const clearSignature = () => {
    if (sigPad.current) {
      sigPad.current.clear();
      setFormData((prev) => ({ ...prev, signature: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!sigPad.current || sigPad.current.isEmpty()) {
      alert('Please provide your signature.');
      return;
    }

    const signatureDataUrl = sigPad.current.getCanvas().toDataURL('image/png');
    const signatureBase64 = signatureDataUrl.split(',')[1]; // Remove prefix

    // Convert photo to base64 helper
    const getBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });

    const photoBase64 = formData.photo ? await getBase64(formData.photo) : null;

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      dateOfApplication: formData.dateOfApplication,
      signature: signatureBase64,
      photo: photoBase64,
    };

    try {
      const response = await fetch('http://localhost:3000/form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      alert('Form successfully submitted!');
      console.log('Server response:', result);

      // Optionally clear form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        dateOfApplication: '',
        signature: null,
        photo: null,
      });
      setImagePreview(null);
      sigPad.current.clear();
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit form. Check console for errors.');
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '20px auto', fontFamily: 'Arial, sans-serif' }}>
      <h2>Application Form</h2>
      <form onSubmit={handleSubmit}>
        <label>
          First Name:<br />
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />
        </label>
        <br /><br />

        <label>
          Last Name:<br />
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
          />
        </label>
        <br /><br />

        <label>
          Email:<br />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </label>
        <br /><br />

        <label>
          Date of Application:<br />
          <input
            type="date"
            name="dateOfApplication"
            value={formData.dateOfApplication}
            onChange={handleInputChange}
            required
          />
        </label>
        <br /><br />

        <label>
          Signature:<br />
          <SignatureCanvas
            penColor="black"
            minWidth={1}
            maxWidth={3}
            velocityFilterWeight={0.85}
            throttle={32}
            canvasProps={{ width: 600, height: 200, style: { border: '1px solid black', backgroundColor: 'white' } }}
            ref={sigPad}
          />
        </label>
        <br />
        <button type="button" onClick={clearSignature}>
          Clear Signature
        </button>
        <br /><br />

        <label>
          Upload or Take a Selfie:<br />
          <input
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleImageChange}
          />
        </label>

        {imagePreview && (
          <div style={{ marginTop: 10 }}>
            <p>Preview:</p>
            <img
              src={imagePreview}
              alt="Preview"
              style={{ maxWidth: '100%', height: 'auto', border: '1px solid #ccc' }}
            />
          </div>
        )}
        <br />

        <button type="submit">Submit Form</button>
      </form>
    </div>
  );
}
