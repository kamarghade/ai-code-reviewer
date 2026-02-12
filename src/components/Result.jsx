import React, { useContext } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import GlobalContext from '../context/globalContext.context';

const ResultOfInput = () => {
    const { selectedTab, onSubmit, selectedLang, answers, isLoading, error } = useContext(GlobalContext);

    const onExplainCodeClicked = () => {
        onSubmit('code-explainer');
    };

    const onOptimizeCodeClicked = () => {
        onSubmit('code-optimizer');
    };

    const onGenerateReadmeClicked = () => {
        onSubmit('generate-readme');
    };

    const downloadReadme = () => {
        const content = answers[selectedTab] || '';
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'README.md';
        a.click();
        URL.revokeObjectURL(url);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(currentAnswer).then(() => {
            alert('Copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            alert('Failed to copy to clipboard.');
        });
    };

    const getButtonLabel = () => {
        switch (selectedTab) {
            case 'code-explainer':
                return 'Explain Code';
            case 'code-optimizer':
                return 'Optimize Code';
            case 'generate-readme':
                return 'Generate Readme';
            default:
                return 'Submit';
        }
    };

    const getButtonAction = () => {
        switch (selectedTab) {
            case 'code-explainer':
                return onExplainCodeClicked;
            case 'code-optimizer':
                return onOptimizeCodeClicked;
            case 'generate-readme':
                return onGenerateReadmeClicked;
            default:
                return () => { };
        }
    };

    const currentAnswer = answers[selectedTab] || '';

    return (
        <>
            <h4 className='section-title'>AI Response</h4>
            <div className='section-buttons'>
                <button onClick={getButtonAction()} disabled={isLoading}>
                    {isLoading ? 'Processing...' : getButtonLabel()}
                </button>
                {selectedTab === 'generate-readme' && currentAnswer && (
                    <button onClick={downloadReadme}>Download README.md</button>
                )}
                {selectedTab === 'code-optimizer' && currentAnswer && (
                    <button onClick={copyToClipboard}>Copy Code</button>
                )}
            </div>
            <div>
                {error ? (
                    <p className='error'>Error: {error?.message || error}</p>
                ) : currentAnswer ? (
                    <SyntaxHighlighter
                        language={selectedTab === 'generate-readme' ? 'markdown' : selectedLang}
                        style={oneLight}
                        customStyle={{
                            margin: 0,
                            padding: '12px',
                            background: 'transparent',
                            fontSize: '14px'
                        }}
                        showLineNumbers={true}
                    >
                        {currentAnswer}
                    </SyntaxHighlighter>
                ) : (
                    <p>No response yet. Click the button to generate.</p>
                )}
            </div>
        </>
    );
};

export default ResultOfInput;
