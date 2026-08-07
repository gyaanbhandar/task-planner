'use client';
import React, { useRef, useEffect, useCallback } from 'react';
import { VISUAL_THEME } from '../constants/taskConstants';

export default function RichTextEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null);
  const isInternalChange = useRef(false);

  // Set initial content
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const handleInput = useCallback(() => {
    isInternalChange.current = true;
    onChange(editorRef.current.innerHTML);
    setTimeout(() => { isInternalChange.current = false; }, 0);
  }, [onChange]);

  const execCmd = useCallback((cmd, val = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    handleInput();
  }, [handleInput]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    // Try HTML first to preserve formatting (bold, italic, bullets, etc.)
    const html = e.clipboardData.getData('text/html');
    const plain = e.clipboardData.getData('text/plain');

    if (html) {
      // Clean the HTML - remove unwanted tags but keep formatting
      const temp = document.createElement('div');
      temp.innerHTML = html;

      // Remove style tags, meta, comments
      temp.querySelectorAll('style, meta, link, script, title').forEach(el => el.remove());

      // Remove class/id/style from elements but keep structural tags
      const allowedTags = ['B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'DEL', 'A', 'BR', 'P', 'DIV', 'UL', 'OL', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'SUB', 'SUP', 'BLOCKQUOTE', 'PRE', 'CODE', 'TABLE', 'TR', 'TD', 'TH', 'THEAD', 'TBODY'];

      const cleanNode = (node) => {
        if (node.nodeType === 3) return; // text node
        if (node.nodeType !== 1) { node.remove(); return; }

        // Remove Google Docs wrapper artifacts
        if (node.tagName === 'GOOGLE-SHEETS-HTML-ORIGIN' || node.tagName === 'META') {
          node.remove();
          return;
        }

        // Keep the tag but strip most attributes
        const tag = node.tagName;
        const attrs = Array.from(node.attributes);
        attrs.forEach(attr => {
          // Keep href on links, keep colspan/rowspan on table cells
          if (attr.name === 'href' || attr.name === 'colspan' || attr.name === 'rowspan') return;
          node.removeAttribute(attr.name);
        });

        // Make links open in new tab
        if (tag === 'A') {
          node.setAttribute('target', '_blank');
          node.setAttribute('rel', 'noopener noreferrer');
        }

        Array.from(node.children).forEach(cleanNode);
      };

      cleanNode(temp);

      // Auto-detect URLs in text
      let cleanHtml = temp.innerHTML;
      document.execCommand('insertHTML', false, cleanHtml);
    } else if (plain) {
      // Fallback: plain text with auto URL detection
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const htmlText = plain
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/\n/g, '<br>');
      document.execCommand('insertHTML', false, htmlText);
    }

    handleInput();
  }, [handleInput]);

  const handleInsertLink = useCallback(() => {
    const sel = window.getSelection();
    const selectedText = sel?.toString();
    const url = prompt('Enter URL:', 'https://');
    if (url) {
      editorRef.current?.focus();
      if (selectedText) {
        document.execCommand('createLink', false, url);
        setTimeout(() => {
          editorRef.current?.querySelectorAll('a').forEach(a => {
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener noreferrer');
          });
        }, 0);
      } else {
        const linkText = prompt('Link text:', url);
        document.execCommand('insertHTML', false, `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText || url}</a>`);
      }
      handleInput();
    }
  }, [handleInput]);

  const toolbarBtns = [
    { cmd: 'bold', icon: 'B', title: 'Bold (Ctrl+B)', style: { fontWeight: 700 } },
    { cmd: 'italic', icon: 'I', title: 'Italic (Ctrl+I)', style: { fontStyle: 'italic' } },
    { cmd: 'underline', icon: 'U', title: 'Underline (Ctrl+U)', style: { textDecoration: 'underline' } },
    { cmd: 'strikeThrough', icon: 'S', title: 'Strikethrough', style: { textDecoration: 'line-through' } },
  ];

  return (
    <div>
      {/* Toolbar */}
      <div style={{
        display: 'flex', gap: '1px', padding: '8px 10px', background: '#F1F5F9',
        borderRadius: '12px 12px 0 0', border: `1px solid ${VISUAL_THEME.border}`, borderBottom: 'none',
        flexWrap: 'wrap', alignItems: 'center'
      }}>
        {toolbarBtns.map(btn => (
          <button
            key={btn.cmd}
            type="button"
            title={btn.title}
            onMouseDown={(e) => { e.preventDefault(); execCmd(btn.cmd); }}
            style={{
              width: '32px', height: '30px', border: 'none', background: 'transparent',
              cursor: 'pointer', borderRadius: '6px', fontSize: '13px', color: '#475569',
              display: 'flex', alignItems: 'center', justifyContent: 'center', ...btn.style,
              transition: 'background 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {btn.icon}
          </button>
        ))}

        <div style={{ width: '1px', height: '20px', background: '#CBD5E1', margin: '0 6px' }} />

        {/* Heading dropdown */}
        <select
          onChange={(e) => {
            if (e.target.value === 'p') execCmd('formatBlock', 'p');
            else execCmd('formatBlock', e.target.value);
            e.target.value = '';
          }}
          defaultValue=""
          style={{
            height: '30px', border: 'none', background: 'transparent', cursor: 'pointer',
            borderRadius: '6px', fontSize: '12px', color: '#475569', padding: '0 6px',
            fontWeight: 500
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <option value="" disabled>Heading</option>
          <option value="p">Normal</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
        </select>

        <div style={{ width: '1px', height: '20px', background: '#CBD5E1', margin: '0 6px' }} />

        {/* Link */}
        <button
          type="button" title="Insert Link"
          onMouseDown={(e) => { e.preventDefault(); handleInsertLink(); }}
          style={{
            width: '32px', height: '30px', border: 'none', background: 'transparent',
            cursor: 'pointer', borderRadius: '6px', fontSize: '14px', color: '#475569',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >🔗</button>

        {/* Remove Link */}
        <button
          type="button" title="Remove Link"
          onMouseDown={(e) => { e.preventDefault(); execCmd('unlink'); }}
          style={{
            width: '32px', height: '30px', border: 'none', background: 'transparent',
            cursor: 'pointer', borderRadius: '6px', fontSize: '12px', color: '#94A3B8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'line-through', transition: 'background 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >🔗</button>

        <div style={{ width: '1px', height: '20px', background: '#CBD5E1', margin: '0 6px' }} />

        {/* Bullet List */}
        <button
          type="button" title="Bullet List"
          onMouseDown={(e) => { e.preventDefault(); execCmd('insertUnorderedList'); }}
          style={{
            width: '32px', height: '30px', border: 'none', background: 'transparent',
            cursor: 'pointer', borderRadius: '6px', fontSize: '13px', color: '#475569',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >•≡</button>

        {/* Numbered List */}
        <button
          type="button" title="Numbered List"
          onMouseDown={(e) => { e.preventDefault(); execCmd('insertOrderedList'); }}
          style={{
            width: '32px', height: '30px', border: 'none', background: 'transparent',
            cursor: 'pointer', borderRadius: '6px', fontSize: '13px', color: '#475569',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >1.</button>

        <div style={{ width: '1px', height: '20px', background: '#CBD5E1', margin: '0 6px' }} />

        {/* Indent / Outdent */}
        <button
          type="button" title="Decrease Indent"
          onMouseDown={(e) => { e.preventDefault(); execCmd('outdent'); }}
          style={{
            width: '32px', height: '30px', border: 'none', background: 'transparent',
            cursor: 'pointer', borderRadius: '6px', fontSize: '13px', color: '#475569',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >⇤</button>
        <button
          type="button" title="Increase Indent"
          onMouseDown={(e) => { e.preventDefault(); execCmd('indent'); }}
          style={{
            width: '32px', height: '30px', border: 'none', background: 'transparent',
            cursor: 'pointer', borderRadius: '6px', fontSize: '13px', color: '#475569',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >⇥</button>

        <div style={{ width: '1px', height: '20px', background: '#CBD5E1', margin: '0 6px' }} />

        {/* Clear Formatting */}
        <button
          type="button" title="Clear Formatting"
          onMouseDown={(e) => { e.preventDefault(); execCmd('removeFormat'); }}
          style={{
            width: '32px', height: '30px', border: 'none', background: 'transparent',
            cursor: 'pointer', borderRadius: '6px', fontSize: '12px', color: '#94A3B8',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s',
            fontWeight: 500
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >T̸</button>
      </div>

      {/* Editor Area - auto-expanding */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        data-placeholder={placeholder || 'Add details, links, notes...'}
        style={{
          width: '100%',
          minHeight: '140px',
          maxHeight: '50vh',
          overflowY: 'auto',
          padding: '16px 18px',
          borderRadius: '0 0 12px 12px',
          border: `1px solid ${VISUAL_THEME.border}`,
          fontSize: '14px',
          background: '#FFFFFF',
          boxSizing: 'border-box',
          lineHeight: 1.7,
          outline: 'none',
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
          fontFamily: "'Inter', sans-serif",
          color: VISUAL_THEME.text,
        }}
      />

      <style dangerouslySetInnerHTML={{__html: `
        [data-placeholder]:empty::before {
          content: attr(data-placeholder);
          color: #94A3B8;
          pointer-events: none;
          display: block;
        }
        [contenteditable] a { color: ${VISUAL_THEME.accent}; text-decoration: underline; cursor: pointer; word-break: break-all; }
        [contenteditable] ul, [contenteditable] ol { margin: 6px 0; padding-left: 24px; }
        [contenteditable] li { margin: 3px 0; }
        [contenteditable] h2 { font-size: 18px; font-weight: 700; margin: 8px 0 4px; }
        [contenteditable] h3 { font-size: 16px; font-weight: 600; margin: 6px 0 3px; }
        [contenteditable] h4 { font-size: 14px; font-weight: 600; margin: 4px 0 2px; }
        [contenteditable] blockquote { border-left: 3px solid ${VISUAL_THEME.accent}; margin: 8px 0; padding: 4px 12px; color: #64748B; }
        [contenteditable] table { border-collapse: collapse; margin: 8px 0; width: 100%; }
        [contenteditable] td, [contenteditable] th { border: 1px solid #E2E8F0; padding: 6px 10px; font-size: 13px; }
        [contenteditable] th { background: #F1F5F9; font-weight: 600; }
        [contenteditable]::-webkit-scrollbar { width: 5px; }
        [contenteditable]::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
      `}} />
    </div>
  );
}
