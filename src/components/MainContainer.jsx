import React, { useState, useRef, useEffect } from 'react';
import flourite from 'flourite';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { API_BASE_URL, CODE_LANGUAGES } from '../consts';
import '../styles/container.css';

const MainContainer = () => {
  const [selectedMode, setSelectedMode] = useState('optimizer'); // 'optimizer' or 'readme'

  // Code Optimizer State
  const [codeInput, setCodeInput] = useState('');
  const [selectedLang, setSelectedLang] = useState('');
  const [optimizerResult, setOptimizerResult] = useState('');
  const [isOptimizerLoading, setIsOptimizerLoading] = useState(false);

  // README Generator State
  const [repoUrl, setRepoUrl] = useState('');
  const [readmeResult, setReadmeResult] = useState('');
  const [isReadmeLoading, setIsReadmeLoading] = useState(false);

  const [error, setError] = useState('');

  // Ref for AI Response section
  const aiResponseRef = useRef(null);

  // Auto-scroll to AI response when result is received
  useEffect(() => {
    if (optimizerResult && aiResponseRef.current) {
      aiResponseRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [optimizerResult]);

  // Detect programming language
  const detectLanguage = (code) => {
    if (!code) return '';
    const detection = flourite(code, { noUnknown: true });
    const detectedLang = detection.language?.toLowerCase();

    const supported = CODE_LANGUAGES.find(l => l.value === detectedLang);
    if (supported) return supported.value;

    const mappings = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'cs': 'csharp',
      'rb': 'ruby',
    };

    return mappings[detectedLang] || '';
  };

  // Handle code input change
  const handleCodeInput = (event) => {
    const data = event.target.value;
    setCodeInput(data);

    // Auto-detect language
    const detected = detectLanguage(data);
    if (detected) {
      setSelectedLang(detected);
    }

    setOptimizerResult('');
    setError('');
  };

  // Handle language change
  const handleLanguageChange = (event) => {
    setSelectedLang(event.target.value);
  };

  // Submit code for optimization
  const submitCodeOptimization = async () => {
    if (!codeInput.trim()) {
      alert('Please provide code to optimize.');
      return;
    }

    if (!selectedLang) {
      alert('Please select a programming language.');
      return;
    }

    const lines = codeInput.split('\n').length;
    if (lines > 1000) {
      alert('Maximum 1000 lines allowed.');
      return;
    }

    try {
      setIsOptimizerLoading(true);
      setError('');

      const resp = await fetch(`${API_BASE_URL}/api/optimizer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: codeInput,
          lang: selectedLang,
        }),
      });

      if (!resp.ok) {
        throw new Error(`API request failed with status ${resp.status}`);
      }

      const data = await resp.json();
      setOptimizerResult(data?.answer || 'No response received');
    } catch (error) {
      setError('Unable to fetch optimization response');
      console.error(error);
    } finally {
      setIsOptimizerLoading(false);
    }
  };

  // Submit GitHub URL for README generation
  const submitReadmeGeneration = async () => {
    if (!repoUrl.trim()) {
      alert('Please enter a GitHub repository URL.');
      return;
    }

    try {
      setIsReadmeLoading(true);
      setError('');
      setReadmeResult('');

      const resp = await fetch(`${API_BASE_URL}/api/github-readme`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: repoUrl }),
      });

      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.error || 'Failed to generate README');
      }

      const data = await resp.json();
      setReadmeResult(data.answer);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsReadmeLoading(false);
    }
  };

  // Download README
  const downloadReadme = () => {
    const blob = new Blob([readmeResult], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className='main'>
      <div className='app-container'>
        <h1 className='app-title'>AI Code Assistant</h1>

        {/* Radio Button Selection */}
        <div className='mode-selection'>
          <label className='radio-option'>
            <input
              type='radio'
              name='mode'
              value='optimizer'
              checked={selectedMode === 'optimizer'}
              onChange={(e) => setSelectedMode(e.target.value)}
            />
            <span className='radio-label'>Code Optimizer</span>
          </label>

          <label className='radio-option'>
            <input
              type='radio'
              name='mode'
              value='readme'
              checked={selectedMode === 'readme'}
              onChange={(e) => setSelectedMode(e.target.value)}
            />
            <span className='radio-label'>README Generator</span>
          </label>
        </div>

        {/* Code Optimizer Section */}
        {selectedMode === 'optimizer' && (
          <div className='optimizer-section'>
            <div className='disclaimer'>
              <strong>⚠️ Disclaimer:</strong> AI-generated optimizations are suggestions.
              Always review and test code before using in production.
            </div>

            {/* Input and Preview Side by Side */}
            <div className='top-row'>
              {/* Input Code Section */}
              <div className='section-block input-block'>
                <h3>Input Code</h3>
                <select
                  id='code-lang'
                  value={selectedLang}
                  onChange={handleLanguageChange}
                  className='language-dropdown'
                >
                  <option value=''>Select Language</option>
                  {CODE_LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>

                <textarea
                  className='code-textarea'
                  placeholder='Paste your code here...'
                  value={codeInput}
                  onChange={handleCodeInput}
                />

                <button
                  className='submit-btn'
                  onClick={submitCodeOptimization}
                  disabled={isOptimizerLoading}
                >
                  {isOptimizerLoading ? 'Optimizing...' : 'Submit for Optimization'}
                </button>
              </div>

              {/* Input Preview Section */}
              <div className='section-block preview-block'>
                <h3>Input Preview</h3>
                <div className='preview-box'>
                  {codeInput ? (
                    <SyntaxHighlighter
                      language={selectedLang || 'text'}
                      style={oneLight}
                      customStyle={{
                        margin: 0,
                        padding: '12px',
                        background: '#f6f8fa',
                        fontSize: '14px',
                        borderRadius: '4px',
                        height: '100%',
                        overflow: 'auto'
                      }}
                      showLineNumbers={true}
                    >
                      {codeInput}
                    </SyntaxHighlighter>
                  ) : (
                    <p className='placeholder-text'>Your code preview will appear here...</p>
                  )}
                </div>
              </div>
            </div>

            {/* AI Response Section - Full Width Below */}
            <div className='section-block response-block' ref={aiResponseRef}>
              <h3>AI Response</h3>
              <div className='result-box'>
                {isOptimizerLoading ? (
                  <div className='loading'>Generating optimization...</div>
                ) : optimizerResult ? (
                  <div className='result-content'>
                    <SyntaxHighlighter
                      language='markdown'
                      style={oneLight}
                      customStyle={{
                        margin: 0,
                        padding: '12px',
                        background: '#f6f8fa',
                        fontSize: '14px',
                        borderRadius: '4px'
                      }}
                    >
                      {optimizerResult}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <p className='placeholder-text'>AI optimization will appear here...</p>
                )}
              </div>
            </div>

            {error && <div className='error-message'>{error}</div>}
          </div>
        )}

        {/* README Generator Section */}
        {selectedMode === 'readme' && (
          <div className='readme-section'>
            <h3>Generate README from GitHub Repository</h3>
            <p className='section-description'>
              Enter a public GitHub repository URL to generate a comprehensive README file.
            </p>

            <div className='readme-input-container'>
              <input
                type='text'
                className='repo-url-input'
                placeholder='https://github.com/username/repository'
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
              />
              <button
                className='submit-btn'
                onClick={submitReadmeGeneration}
                disabled={isReadmeLoading}
              >
                {isReadmeLoading ? 'Generating...' : 'Generate README'}
              </button>
            </div>

            {error && <div className='error-message'>{error}</div>}

            {readmeResult && (
              <div className='readme-result'>
                <div className='result-header'>
                  <h3>Generated README</h3>
                  <button className='download-btn' onClick={downloadReadme}>
                    Download README.md
                  </button>
                </div>
                <div className='result-content'>
                  <SyntaxHighlighter
                    language='markdown'
                    style={oneLight}
                    customStyle={{
                      margin: 0,
                      padding: '12px',
                      background: '#f6f8fa',
                      fontSize: '14px',
                      borderRadius: '4px',
                      border: '1px solid #ddd'
                    }}
                    showLineNumbers={true}
                  >
                    {readmeResult}
                  </SyntaxHighlighter>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default MainContainer;