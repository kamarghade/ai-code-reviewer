import React from 'react';

const HistorySidebar = ({ history, onSelect, isOpen, toggleSidebar }) => {
    return (
        <div className={`history-sidebar ${isOpen ? 'open' : ''}`}>
            <button className="toggle-btn" onClick={toggleSidebar}>
                {isOpen ? 'Close' : 'History'}
            </button>
            <div className="history-content">
                <h3>Request History</h3>
                {history.length === 0 ? (
                    <p className="no-history">No history yet.</p>
                ) : (
                    <ul className="history-list">
                        {history.map((item) => (
                            <li key={item.id} className={`history-item ${item.type}`} onClick={() => onSelect(item)}>
                                <div className="history-header">
                                    <span className="type-badge">{item.type === 'optimizer' ? 'Code' : 'Repo'}</span>
                                    <span className="timestamp">{new Date(item.id).toLocaleTimeString()}</span>
                                </div>
                                <div className="history-input-preview">
                                    {item.input}
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
