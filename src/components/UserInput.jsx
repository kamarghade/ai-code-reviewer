import React, { useContext } from 'react';
import GlobalContext from '../context/globalContext.context';
import { CODE_LANGUAGES as langauges } from '../consts';

const UserInput = () => {
    const {
        onInputField,
        userInput,
        isLoading,
        onLangaugeChange,
        selectedLang,
    } = useContext(GlobalContext);


    return (
        <>
            <h4 className='section-title'>User Input</h4>
            <div>
                <select name="code-langauge" id="code-lang" value={selectedLang} onChange={onLangaugeChange}>
                    <option value="">Select</option>
                    {langauges?.map((option) => <option value={option?.value}>{option?.label}</option>)}
                </select>
                <textarea
                    className='user-input-field w-full h-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors
                     resize-none overflow-auto'
                    onChange={onInputField}
                    value={userInput}
                    cols={50}
                    rows={10}
                    placeholder='Provide snippet that you want to process...'
                    style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
                />
                <p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>Note: Maximum 1000 lines of code allowed.</p>
            </div>
        </>
    );
};

export default UserInput;