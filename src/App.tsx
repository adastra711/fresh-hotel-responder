import { useState } from 'react';
import './App.css';

function App() {
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
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gray-700 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-white text-2xl font-bold">Hotel Review Responder</h1>
          <p className="text-white/80 italic mt-2">
            A professional review response generator
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white rounded shadow-sm p-8">
          <h2 className="text-gray-800 text-2xl font-light mb-8">
            Response Generator
          </h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm text-gray-700 mb-2" htmlFor="userName">
                  Your Name *
                </label>
                <input
                  id="userName"
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-gray-400"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2" htmlFor="userTitle">
                  Your Title *
                </label>
                <input
                  id="userTitle"
                  type="text"
                  name="userTitle"
                  value={formData.userTitle}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-gray-400"
                  placeholder="Enter your title"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2" htmlFor="propertyName">
                Property Name *
              </label>
              <input
                id="propertyName"
                type="text"
                name="propertyName"
                value={formData.propertyName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-gray-400"
                placeholder="Enter property name"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2" htmlFor="reviewText">
                Guest Review *
              </label>
              <textarea
                id="reviewText"
                name="reviewText"
                value={formData.reviewText}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-gray-400 resize-none"
                placeholder="Paste the guest review here"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gray-700 text-white rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded">
              <h3 className="text-lg text-gray-800 mb-4 font-medium">
                Generated Response
              </h3>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {response}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App; 