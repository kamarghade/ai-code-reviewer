import React from 'react';

const HistorySidebar = ({ history, onSelect, isOpen, toggleSidebar }) => {
    return (
        <div className={`history-sidebar ${isOpen ? 'open' : ''}`}>
            <button className="toggle-btn" onClick={toggleSidebar}>
                {isOpen ? 'Close History' : 'History'}
            </button>
            <div className="history-content">
                <h3>Request History</h3>
                {history.length === 0 ? (
                    <p className="no-history">No history yet.</p>
                ) : (
                    <ul className="history-list">
                        {history.map((item) => (
                            <li key={item.id} className="history-item" onClick={() => onSelect(item)}>
                                <div className="history-header">
                                    <span className="lang-badge">{item.lang}</span>
                                    <span className="timestamp">{new Date(item.id).toLocaleTimeString()}</span>
                                </div>
                                <div className="code-preview">
                                    {item.input.substring(0, 50)}...
                                </div>
                                <div className="status-indicators">
                                    {item.answers['code-explainer'] && <span data-tooltip="Code Describer" className="dot explainer"></span>}
                                    {item.answers['code-optimizer'] && <span data-tooltip="Code Optimizer" className="dot optimizer"></span>}
                                    {item.answers['generate-readme'] && <span data-tooltip="Readme Generator" className="dot readme"></span>}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default HistorySidebar;
