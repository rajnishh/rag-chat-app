import React from 'react';
import { Send, Paperclip } from 'lucide-react';
import './InputArea.css';

const InputArea = ({ value, onChange, onSend, onKeyPress, disabled, placeholder }) => {
  const textareaRef = React.useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!disabled && value.trim()) {
      onSend();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [value]);

  return (
    <div className="input-area">
      <form onSubmit={handleSubmit} className="input-form">
        <div className="input-container">
          <button type="button" className="attach-button" disabled={disabled}>
            <Paperclip size={20} />
          </button>
          
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="message-input"
          />
          
          <button
            type="submit"
            disabled={disabled || !value.trim()}
            className="send-button"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
      
      <div className="input-footer">
        <span className="help-text">
          Press Enter to send, Shift+Enter for new line
        </span>
      </div>
    </div>
  );
};

export default InputArea;