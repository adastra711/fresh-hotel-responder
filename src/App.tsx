import React, { useState } from 'react';
import './App.css';

const App: React.FC = () => {
  const [review, setReview] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await fetch('/api/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ review }),
      });
      const data = await result.json();
      setResponse(data.response);
    } catch (error) {
      console.error('Error:', error);
      setResponse('Error generating response. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Fresh Hotel Responder</h1>
      </header>
      <main className="App-main">
        <form onSubmit={handleSubmit} className="review-form">
          <div className="form-group">
            <label htmlFor="review">Hotel Review:</label>
            <textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Paste the hotel review here..."
              rows={5}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Response'}
          </button>
        </form>
        {response && (
          <div className="response-section">
            <h2>Generated Response:</h2>
            <div className="response-content">
              {response}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;