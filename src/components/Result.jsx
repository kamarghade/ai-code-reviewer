import React, { useContext } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import GlobalContext from '../context/globalContext.context';

const ResultOfInput = () => {
    const { userInput, selectedTab, onSubmit, selectedLang } = useContext(GlobalContext);

    const onCodeOptimizerClicked = () => {
        onSubmit('code-optimizer');
    };

    return (
        <>
            <h4 className='section-title'>AI Response</h4>
            <div className='section-buttons'>
                <button onClick={onCodeOptimizerClicked}>Optimize Code</button>
            </div>
            <div>
                <SyntaxHighlighter
                    language={selectedLang}
                    style={oneLight}
                    customStyle={{
                        margin: 0,
                        padding: '12px',
                        background: 'transparent',
                        fontSize: '14px'
                    }}
                    showLineNumbers={true}
                    >
                    {userInput}
                </SyntaxHighlighter>
            </div>
        </>
    );
};

export default ResultOfInput;
