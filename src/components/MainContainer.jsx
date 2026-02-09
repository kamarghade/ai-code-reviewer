import React, { useState, Suspense, lazy, useMemo } from 'react';
import GlobalContext from '../context/globalContext.context';
import { API_BASE_URL, TABS as tabs } from '../consts';
import '../styles/container.css';

const UserInput = lazy(() => import('./UserInput'));
const CodeExplainer = lazy(() => import('./CodeExplainer'));
const CodeOptimizer = lazy(() => import('./CodeOptimizer'));
const ReadMeGenerator = lazy(() => import('./ReadmeGenerator'));
const InputPreview = lazy(() => import('./InputPreview'));
const ResultOfInput = lazy(() => import('./Result'));

const MainContainer = () => {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [answers, setAnswer] = useState('');
  const [selectedTab, setSelectedTab] = useState('code-explainer');
  const [selectedLang, setSelectedLang] = useState('');

  const onLangaugeChange = (event) => {
    setSelectedLang(event.target.value);
  };

  const onInputField = (event) => {
    const data = event.target.value;
    setUserInput(data);
  };

  const onSubmit = async (currentTab) => {
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

      const data = await resp.json();
      setAnswer({ [currentTab]: data?.answer });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const tabComponents = {
    'code-explainer': <CodeExplainer />,
    'code-optimizer': <CodeOptimizer />,
    'generate-readme': <ReadMeGenerator />,
  };

  const onTabHeaderClick = (data) => {
    setSelectedTab(data?.tab);
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
        isLoading,
        onLangaugeChange,
        selectedLang,
    }), [
        userInput,
        selectedTab,
        isLoading,
        selectedLang,
    ]);

    return (
        <GlobalContext.Provider value={storeValue}>
            <Suspense fallback='loading...'>
                <section className='main'>
                    <div className='tabs-wrapper'>
                        <div className='tab-buttons'>
                            {tabs?.map((eachTab) => {
                                return (
                                    <div className='tab' aria-label={eachTab?.tab} key={eachTab?.tab} onClick={(e) => onTabHeaderClick(eachTab, e)}>
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
                    </div>
                </section>
            </Suspense>
        </GlobalContext.Provider>
    );
};

export default MainContainer;