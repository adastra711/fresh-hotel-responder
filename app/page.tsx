'use client';

import { useState } from 'react';
import Logo from './components/Logo';

export default function Home() {
  const [formData, setFormData] = useState({
    userName: '',
    userTitle: '',
    propertyName: '',
    reviewText: '',
  });
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponse('');
    
    try {
      const res = await fetch('/api/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate response');
      }

      if (!data.response) {
        throw new Error('No response generated');
      }

      setResponse(data.response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(`An error occurred while generating the response: ${errorMessage}`);
      console.error('Error details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
      <style jsx global>{`
        body {
          background-color: #f5f6f8;
        }
        .form-input {
          background-color: #f5f6f8;
          border: 1px solid #e2e8f0;
          padding: 0.75rem 1rem;
          width: 100%;
          border-radius: 4px;
          color: #2d3748;
          transition: border-color 0.2s ease;
        }
        .form-input:focus {
          outline: none;
          border-color: #4a5568;
        }
        .form-label {
          display: block;
          font-size: 0.875rem;
          color: #4a5568;
          margin-bottom: 0.5rem;
        }
        .form-label.required::after {
          content: " *";
          color: #e53e3e;
        }
        .submit-button {
          background-color: #4a5568;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background-color 0.2s ease;
        }
        .submit-button:hover {
          background-color: #2d3748;
        }
        .submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      <main>
        <header className="bg-[#4a5568] shadow-md">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="h-[60px] w-[240px] relative">
              <Logo />
            </div>
            <p className="text-white/80 italic mt-4 text-lg">
              A professional review response generator
            </p>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="bg-white rounded shadow-sm p-8">
            <h2 className="text-[#2d3748] text-2xl font-light mb-8">
              Response Generator
            </h2>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="form-label required" htmlFor="userName">
                    Your Name
                  </label>
                  <input
                    id="userName"
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="form-label required" htmlFor="userTitle">
                    Your Title
                  </label>
                  <input
                    id="userTitle"
                    type="text"
                    name="userTitle"
                    value={formData.userTitle}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="Enter your title"
                  />
                </div>
              </div>

              <div>
                <label className="form-label required" htmlFor="propertyName">
                  Property Name
                </label>
                <input
                  id="propertyName"
                  type="text"
                  name="propertyName"
                  value={formData.propertyName}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="Enter property name"
                />
              </div>

              <div>
                <label className="form-label required" htmlFor="reviewText">
                  Guest Review
                </label>
                <textarea
                  id="reviewText"
                  name="reviewText"
                  value={formData.reviewText}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="form-input resize-none"
                  placeholder="Paste the guest review here"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="submit-button"
                >
                  {loading ? 'Generating Response...' : 'Generate Response'}
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded text-sm">
                {error}
              </div>
            )}

            {response && (
              <div className="mt-8 p-6 bg-[#f5f6f8] border border-[#e2e8f0] rounded">
                <h3 className="text-lg text-[#2d3748] mb-4 font-medium">
                  Generated Response
                </h3>
                <div className="text-[#4a5568] leading-relaxed whitespace-pre-wrap">
                  {response}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
} 