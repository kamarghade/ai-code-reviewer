import React, { useState, Suspense, lazy, useMemo, useEffect } from 'react';
import flourite from 'flourite';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import GlobalContext from '../context/globalContext.context';
import { API_BASE_URL, TABS as tabs, CODE_LANGUAGES } from '../consts';
import '../styles/container.css';
import HistorySidebar from './HistorySidebar';

const UserInput = lazy(() => import('./UserInput'));
const InputPreview = lazy(() => import('./InputPreview'));
const CodeExplainer = lazy(() => import('./CodeExplainer'));
const CodeOptimizer = lazy(() => import('./CodeOptimizer'));
const ReadMeGenerator = lazy(() => import('./ReadmeGenerator'));
const ResultOfInput = lazy(() => import('./Result'));

const MainContainer = () => {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [answers, setAnswer] = useState({});
  const [selectedTab, setSelectedTab] = useState('code-explainer');
  const [selectedLang, setSelectedLang] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // GitHub Readme State
  const [repoUrl, setRepoUrl] = useState('');
  const [repoReadme, setRepoReadme] = useState('');
  const [isRepoLoading, setIsRepoLoading] = useState(false);

  useEffect(() => {
    const storedHistory = localStorage.getItem('ai_reviewer_history');
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  const saveToHistory = (newInput, newLang, newAnswers) => {
    const newItem = {
      id: Date.now(),
      input: newInput,
      lang: newLang,
      answers: newAnswers,
    };

    setHistory((prevHistory) => {
      // Deduplicate: Remove existing item with same input
      const filteredHistory = prevHistory.filter(item => item.input !== newInput);

      const updatedHistory = [newItem, ...filteredHistory].slice(0, 10);
      localStorage.setItem('ai_reviewer_history', JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  };

  const loadFromHistory = (item) => {
    setUserInput(item.input);
    setSelectedLang(item.lang);
    setAnswer(item.answers || {});

    // Determine active tab based on what's available
    const availableTabs = Object.keys(item.answers || {});
    if (availableTabs.length > 0) {
      setSelectedTab(availableTabs[0]); // Default to first available
    }

    setIsHistoryOpen(false);
  };

  const onLangaugeChange = (event) => {
    setSelectedLang(event.target.value);
  };

  const detectLanguage = (code) => {
    if (!code) return '';
    const detection = flourite(code, { noUnknown: true });
    const detectedLang = detection.language?.toLowerCase();

    // Map detected language to our supported languages
    const supported = CODE_LANGUAGES.find(l => l.value === detectedLang);
    if (supported) return supported.value;

    // Common mappings if flourite returns something slightly different
    const mappings = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'cs': 'csharp',
      'rb': 'ruby',
    };

    return mappings[detectedLang] || '';
  };

  const onInputField = (event) => {
    const data = event.target.value;
    setUserInput(data);

    // Auto-detect language
    const detected = detectLanguage(data);
    if (detected) {
      setSelectedLang(detected);
    }

    // Reset answers on input change
    setAnswer({});
    setError('');
  };

  const onSubmit = async (currentTab) => {
    const lines = userInput.split('\n').length;
    if (lines > 1000) {
      alert('Maximum 1000 lines allowed.');
      return;
    }

    const apiType = currentTab.split('-')[1];

    if (!userInput) {
      alert('Please provide the script to execute.');
    }

    try {
      setLoading(true);

      const resp = await fetch(`${API_BASE_URL}/api/${apiType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userInput,
          lang: selectedLang,
        }),
      });

      if (!resp.ok) {
        throw new Error(`API request failed with status ${resp.status}`);
      }

      const data = await resp.json();

      const newAnswers = { ...answers, [currentTab]: data?.answer };
      setAnswer(newAnswers);

      // Save to history whenever a new answer is generated
      saveToHistory(userInput, selectedLang, newAnswers);

      setError('');

    } catch (error) {
      setError('Unable to fetch response');
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const downloadRepoReadme = () => {
    const blob = new Blob([repoReadme], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README_GITHUB.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateRepoReadme = async () => {
    if (!repoUrl) {
      alert('Please enter a GitHub Repo URL');
      return;
    }

    try {
      setIsRepoLoading(true);
      setError('');
      setRepoReadme('');

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
      setRepoReadme(data.answer);

    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsRepoLoading(false);
    }
  };

  const tabComponents = {
    'code-explainer': <CodeExplainer />,
    'code-optimizer': <CodeOptimizer />,
    'generate-readme': <ReadMeGenerator />,
  };

  const onTabHeaderClick = (data) => {
    setSelectedTab(data?.tab);
    setError('');
  };

  const onNavigation = (nextTab) => {
    setSelectedTab(nextTab);
  };

  const storeValue = useMemo(() => ({
    onInputField,
    userInput,
    onSubmit,
    onNavigation,
    selectedTab,
    setSelectedTab,
    isLoading,
    onLangaugeChange,
    selectedLang,
    answers,
    error,
    repoUrl,
    repoReadme
  }), [
    userInput,
    selectedTab,
    isLoading,
    selectedLang,
    answers,
    error,
    repoUrl,
    repoReadme
  ]);

  return (
    <GlobalContext.Provider value={storeValue}>
      <Suspense fallback='loading...'>
        <section className='main'>
          <HistorySidebar
            history={history}
            onSelect={loadFromHistory}
            isOpen={isHistoryOpen}
            toggleSidebar={() => setIsHistoryOpen(!isHistoryOpen)}
          />
          <div className='tabs-wrapper'>
            <div className='tab-buttons'>
              {tabs?.map((eachTab) => {
                const isCompleted = !!answers[eachTab.tab];
                const isActive = selectedTab === eachTab.tab;

                let statusClass = 'inactive';
                if (isCompleted) {
                  statusClass = 'completed';
                } else if (isActive) {
                  statusClass = 'active';
                }

                return (
                  <div className={`tab ${statusClass}`} aria-label={eachTab?.tab} key={eachTab?.tab} onClick={(e) => onTabHeaderClick(eachTab, e)}>
                    <span>{eachTab?.label}</span>
                    <div className='indicator' />
                  </div>
                );
              })}
            </div>
            <div className='tab-container'>
              <div className='userInput'>
                <UserInput
                  onInputField={onInputField}
                  userInput={userInput}
                />
              </div>
              <div className='input-preview'>
                <InputPreview />
              </div>
              <div className='output-preview'>
                <ResultOfInput />
              </div>
            </div>

            <div className="repo-readme-section">
              <div className="section-title">Generat Readme from GitHub</div>
              <div className="repo-input-container">
                <input
                  type="text"
                  className="user-input-field repo-url-input"
                  placeholder="Enter GitHub Repo URL (e.g., https://github.com/facebook/react)"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                />
                <button className="generate-btn" onClick={generateRepoReadme} disabled={isRepoLoading}>
                  {isRepoLoading ? 'Generating...' : 'Generate Readme'}
                </button>
              </div>
              {error && <div className="error">{error}</div>}
              {repoReadme && (
                <div className="repo-result">
                  <div className="repo-result-header">
                    <h3>Generated README</h3>
                    <button className="download-btn" onClick={downloadRepoReadme}>
                      Download MD
                    </button>
                  </div>
                  <div className="repo-result-content">
                    <SyntaxHighlighter
                      language="markdown"
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
                      {repoReadme}
                    </SyntaxHighlighter>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </Suspense>
    </GlobalContext.Provider>
  );
};

export default MainContainer;