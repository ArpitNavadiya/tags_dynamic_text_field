// tags.jsx
import React, { useState, useRef } from 'react';
import './tags.css';

const SUGGESTIONS = [
  { id: 'ask-ai', label: 'Ask AI', icon: '🤖' },
  { id: 'input', label: 'Input', icon: '📝' },
  { id: 'perplexity', label: 'Perplexity', icon: '🔄' }
];

export function Tags() {
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const handleTagDelete = (tagToDelete) => {
    setTags(tags.filter((tag) => tag !== tagToDelete));
    // Also remove the tag element from the contentEditable div
    const tagElement = containerRef.current.querySelector(`[data-tag-id="${tagToDelete}"]`);
    if (tagElement) {
      tagElement.parentElement.remove();
    }
  };

  const handleDragStart = (event, suggestion) => {
    // Remove preventDefault to allow dragging
    event.dataTransfer.setData('text/plain', JSON.stringify(suggestion));
  };

  const handleTagDragStart = (e, tagId) => {
      e.stopPropagation();
      e.dataTransfer.setData('text/plain', JSON.stringify({ id: tagId, isInternalDrag: true }));
    };
  
  const handleDrop = (event) => {
    event.preventDefault();
    const data = JSON.parse(event.dataTransfer.getData('text/plain'));
    
    // Handle internal tag drag
    if (data.isInternalDrag) {
      const tagElement = containerRef.current.querySelector(`[data-tag-id="${data.id}"]`);
      if (tagElement) {
        const dropPoint = document.caretRangeFromPoint(event.clientX, event.clientY);
        if (dropPoint) {
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(dropPoint);
          const range = selection.getRangeAt(0);
          
          // Remove the original tag
          tagElement.remove();
          
          // Insert at new position
          range.insertNode(tagElement);
          const space = document.createTextNode('\u00A0');
          range.insertNode(space);
          range.setStartAfter(space);
          range.setEndAfter(space);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
      return;
    }

    // Handle external tag drop
    const tagData = data;
    if (tagData) {
      setTags((prev) => [...prev, tagData.id]);
      const tagElement = document.createElement('span');
      tagElement.className = 'tag';
      tagElement.setAttribute('data-tag-id', tagData.id);
      tagElement.setAttribute('contenteditable', 'false');
      tagElement.style.color = '#ffffff';
      tagElement.innerHTML = `
        <span class="tag-icon">${tagData.icon}</span>
        <span class="tag-label">${tagData.label}</span>
      `;
      tagElement.draggable = true;
      tagElement.onmousedown = (e) => e.stopPropagation();
      tagElement.ondragstart = (e) => handleTagDragStart(e, tagData.id);

      if (hoverLine.show) {
        // Insert at line break position
        const container = containerRef.current;
        const range = document.createRange();
        const selection = window.getSelection();
        
        // Find the node closest to the hover line
        const nodes = Array.from(container.childNodes);
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          const rect = node.getBoundingClientRect();
          if (rect.top > hoverLine.top) {
            range.setStartBefore(node);
            const br = document.createElement('br');
            range.insertNode(br);
            range.insertNode(tagElement);
            const space = document.createTextNode('\u00A0');
            range.insertNode(space);
            range.insertNode(document.createElement('br'));
            break;
          }
        }
      } else {
        // Normal drop at cursor position
        const dropPoint = document.caretRangeFromPoint(event.clientX, event.clientY);
        if (dropPoint) {
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(dropPoint);
          
          const range = selection.getRangeAt(0);
          range.insertNode(tagElement);
          const space = document.createTextNode('\u00A0');
          range.insertNode(space);
          
          range.setStartAfter(space);
          range.setEndAfter(space);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }
    setHoverLine({ show: false, top: 0 });
    setShowSuggestions(false);
  };

  const [hoverLine, setHoverLine] = useState({ show: false, top: 0 });

    const handleDragOver = (e) => {
      e.preventDefault();
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;
      
      // Get all text nodes and calculate line positions
      const textNodes = Array.from(container.childNodes);
      let lineFound = false;
      
      for (let i = 0; i < textNodes.length; i++) {
        const node = textNodes[i];
        const nodeRect = node.getBoundingClientRect();
        const nextNode = textNodes[i + 1];
        
        if (nextNode) {
          const nextRect = nextNode.getBoundingClientRect();
          const gapMiddle = nodeRect.bottom + (nextRect.top - nodeRect.bottom) / 2;
          
          if (Math.abs(mouseY - (gapMiddle - rect.top)) < 5) {
            setHoverLine({ 
              show: true, 
              top: gapMiddle - rect.top 
            });
            lineFound = true;
            break;
          }
        }
      }
      
      if (!lineFound) {
        setHoverLine({ show: false, top: 0 });
      }
    };
  
    return (
      <div style={{ display: 'flex', flexDirection: 'row-reverse', gap: '8px', alignItems: 'flex-start' }}>
        <div
          className="tag-container"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setHoverLine({ show: false, top: 0 })}
          contentEditable
          suppressContentEditableWarning
          ref={containerRef}
          onMouseEnter={() => setShowSuggestions(true)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={(e) => {
            // Don't hide suggestions during drag
            if (e.currentTarget.contains(e.relatedTarget)) {
              return;
            }
            // Add delay to allow for drag operation
            setTimeout(() => {
              if (!document.querySelector('.tag-container:hover')) {
                setShowSuggestions(false);
              }
            }, 200);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const selection = window.getSelection();
              const range = selection.getRangeAt(0);
              
              // Insert two line breaks to ensure new line creation
              const br1 = document.createElement('br');
              const br2 = document.createElement('br');
              range.insertNode(br1);
              range.insertNode(br2);
              
              // Move cursor after the second break
              range.setStartAfter(br2);
              range.setEndAfter(br2);
              selection.removeAllRanges();
              selection.addRange(range);
              return false;
            }
            // ... rest of the keyDown handler
          }}
          style={{ 
            color: '#ffffff', 
            flex: 1,
            position: 'relative',
            minHeight: '100px' // Added to ensure enough space for content
          }}
        >
          {hoverLine.show && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: hoverLine.top,
                borderTop: '2px solid #666',
                pointerEvents: 'none'
              }}
            />
          )}
          <span style={{ color: '#666' }}>Type or drag tags here...</span>
        </div>
        {showSuggestions && (
          <div className="suggestion-popover">
            {SUGGESTIONS.map(  // Removed the filter
              (suggestion) => (
                <div
                  key={suggestion.id}
                  className="suggestion-item"
                  draggable
                  onDragStart={(e) => handleDragStart(e, suggestion)}
                >
                  <span className="suggestion-icon">{suggestion.icon}</span>
                  {suggestion.label}
                </div>
              )
            )}
          </div>
        )}
      </div>
    );
}
