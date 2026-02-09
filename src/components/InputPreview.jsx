import { useEffect, useContext, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import GlobalContext from '../context/globalContext.context';
import { BUTTON_LABELS } from '../consts';

const InputPreview = () => {
    const { userInput, isLoading, onSubmit, selectedLang } = useContext(GlobalContext);
    const [oldValue, setOldValue] = useState('');
    const [isSaveAndNextEnabled, setIsSaveAndNextEnabled] = useState(false);

    useEffect(() => {
        if (userInput !== oldValue) {
            setIsSaveAndNextEnabled(true);
        }
    }, [userInput]);

    const onBtnClick = () => {
        onSubmit('code-explainer');
        setOldValue(userInput);
    };

    return (
        <>
            <h4 className='section-title'>Input Preview</h4>
            <div className='section-buttons'>
                <button onClick={onBtnClick} disabled={!userInput || !isSaveAndNextEnabled}>{BUTTON_LABELS?.['code-explainer']}</button>
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

export default InputPreview;
