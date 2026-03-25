/**
 * HelpPanel - In-plugin documentation panel
 * Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 17.4
 * 
 * Displays:
 * - Usage instructions (1.2)
 * - SVG-to-Frame conversion explanation (1.3)
 * - Troubleshooting section (1.4)
 * - Tooltip about native Framer frames (1.5)
 * - Keyboard shortcuts documentation (17.4)
 * 
 * Closes on:
 * - Click outside (1.6)
 * - Escape key press (1.6)
 */

import React, { useEffect, useRef } from 'react';
import { themes, type Theme } from '../theme';

export interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
}

export const HelpPanel: React.FC<HelpPanelProps> = ({ isOpen, onClose, theme }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const colors = themes[theme];

  // Handle click outside to close (Requirement 1.6)
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Add listener with a small delay to prevent immediate close on open click
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle Escape key to close (Requirement 1.6)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap and initial focus
  useEffect(() => {
    if (isOpen && panelRef.current) {
      panelRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          zIndex: 999,
        }}
        aria-hidden="true"
      />
      
      {/* Help Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-panel-title"
        tabIndex={-1}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 520, // 520px = 130 * 4px
          maxHeight: '85vh',
          background: colors.background,
          borderRadius: 8, // 8px = 2 * 4px
          boxShadow: colors.shadowElevated,
          zIndex: 1000,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'scaleIn 200ms ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px', // 16px = 4 * 4px, 20px = 5 * 4px
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <h2
            id="help-panel-title"
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 600,
              color: colors.textPrimary,
            }}
          >
            Help & Documentation
          </h2>
          <button
            onClick={onClose}
            aria-label="Close help panel"
            style={{
              background: 'none',
              border: 'none',
              padding: 8, // 8px = 2 * 4px
              cursor: 'pointer',
              borderRadius: 4, // 4px = 1 * 4px
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.textSecondary,
              transition: 'background-color 200ms ease, color 200ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.bgHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: 20, // 20px = 5 * 4px
          }}
        >
          {/* Usage Instructions Section (Requirement 1.2) */}
          <Section title="Getting Started" theme={theme}>
            <p style={{ margin: '0 0 12px 0', lineHeight: 1.6, color: colors.textSecondary }}>
              UI Vault provides skeletal UI layouts that you can insert directly onto your Framer canvas.
            </p>
            <ol style={{ margin: 0, paddingLeft: 20, color: colors.textSecondary, lineHeight: 1.8 }}>
              <li>Browse components by category using the sidebar</li>
              <li>Use the search bar to find specific components</li>
              <li>Click on any component card to insert it onto your canvas</li>
              <li>Customize the inserted frames using Framer's design tools</li>
            </ol>
          </Section>

          {/* SVG-to-Frame Conversion Section (Requirement 1.3) */}
          <Section title="SVG-to-Frame Conversion" theme={theme}>
            <InfoBox theme={theme}>
              <strong>Native Framer Frames:</strong> Components are inserted as native Framer frames, not SVG images. This means you can fully customize colors, sizes, and content.
            </InfoBox>
            <p style={{ margin: '12px 0 0 0', lineHeight: 1.6, color: colors.textSecondary }}>
              When you insert a component, the plugin converts the SVG structure into Framer's native frame hierarchy. Each shape becomes an editable frame that you can:
            </p>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: 20, color: colors.textSecondary, lineHeight: 1.8 }}>
              <li>Resize and reposition freely</li>
              <li>Change colors and backgrounds</li>
              <li>Add your own content and text</li>
              <li>Apply effects and animations</li>
            </ul>
          </Section>

          {/* Keyboard Shortcuts Section (Requirement 17.4) */}
          <Section title="Keyboard Shortcuts" theme={theme}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <ShortcutRow
                keys={['⌘', 'F']}
                description="Focus search input"
                theme={theme}
              />
              <ShortcutRow
                keys={['Esc']}
                description="Clear search / Close panels"
                theme={theme}
              />
              <ShortcutRow
                keys={['Enter']}
                description="Insert focused component"
                theme={theme}
              />
              <ShortcutRow
                keys={['↑', '↓', '←', '→']}
                description="Navigate component grid"
                theme={theme}
              />
              <ShortcutRow
                keys={['Tab']}
                description="Navigate between elements"
                theme={theme}
              />
            </div>
          </Section>

          {/* Troubleshooting Section (Requirement 1.4) */}
          <Section title="Troubleshooting" theme={theme}>
            <TroubleshootItem
              question="Component not inserting?"
              answer="Make sure you have a frame or the canvas selected in Framer. The component will be inserted as a child of your current selection."
              theme={theme}
            />
            <TroubleshootItem
              question="Colors look different?"
              answer="The preview shows a simplified version. After insertion, you can customize all colors using Framer's design panel."
              theme={theme}
            />
            <TroubleshootItem
              question="Component appears too large/small?"
              answer="Components are inserted at their original size. Use Framer's resize handles or the properties panel to adjust dimensions."
              theme={theme}
            />
            <TroubleshootItem
              question="Plugin not responding?"
              answer="Try closing and reopening the plugin. If issues persist, refresh the Framer page."
              theme={theme}
            />
          </Section>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px', // 12px = 3 * 4px, 20px = 5 * 4px
            borderTop: `1px solid ${colors.border}`,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px', // 8px = 2 * 4px, 16px = 4 * 4px
              background: colors.bgActive,
              color: colors.textActive,
              border: 'none',
              borderRadius: 4, // 4px = 1 * 4px
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'opacity 200ms ease, background-color 200ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </>
  );
};

/**
 * Helper Components with 4px-based spacing
 * Requirement 11.2: Use consistent 4px-based spacing throughout the interface
 */

interface SectionProps {
  title: string;
  theme: Theme;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, theme, children }) => {
  const colors = themes[theme];
  
  return (
    <div style={{ marginBottom: 24 }}> {/* 24px = 6 * 4px */}
      <h3
        style={{
          margin: '0 0 12px 0', // 12px = 3 * 4px
          fontSize: 15,
          fontWeight: 600,
          color: colors.textPrimary,
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
};

interface InfoBoxProps {
  theme: Theme;
  children: React.ReactNode;
}

const InfoBox: React.FC<InfoBoxProps> = ({ theme, children }) => {
  const colors = themes[theme];
  
  return (
    <div
      style={{
        padding: '12px 16px', // 12px = 3 * 4px, 16px = 4 * 4px
        background: colors.infoBg,
        borderRadius: 8, // 8px = 2 * 4px
        fontSize: 13,
        lineHeight: 1.6,
        color: colors.infoText,
        border: `1px solid ${colors.infoBorder}`,
      }}
    >
      {children}
    </div>
  );
};

interface ShortcutRowProps {
  keys: string[];
  description: string;
  theme: Theme;
}

const ShortcutRow: React.FC<ShortcutRowProps> = ({ keys, description, theme }) => {
  const colors = themes[theme];
  
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 0', // 8px = 2 * 4px
      }}
    >
      <span style={{ color: colors.textSecondary, fontSize: 13 }}>{description}</span>
      <div style={{ display: 'flex', gap: 4 }}> {/* 4px = 1 * 4px */}
        {keys.map((key, index) => (
          <kbd
            key={index}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 24, // 24px = 6 * 4px
              height: 24, // 24px = 6 * 4px
              padding: '0 8px', // 8px = 2 * 4px
              background: colors.bgHover,
              border: `1px solid ${colors.border}`,
              borderRadius: 4, // 4px = 1 * 4px
              fontSize: 12,
              fontFamily: 'inherit',
              color: colors.textPrimary,
            }}
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
};

interface TroubleshootItemProps {
  question: string;
  answer: string;
  theme: Theme;
}

const TroubleshootItem: React.FC<TroubleshootItemProps> = ({ question, answer, theme }) => {
  const colors = themes[theme];
  
  return (
    <div style={{ marginBottom: 16 }}> {/* 16px = 4 * 4px */}
      <p
        style={{
          margin: '0 0 4px 0', // 4px = 1 * 4px
          fontSize: 13,
          fontWeight: 600,
          color: colors.textPrimary,
        }}
      >
        {question}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: 13,
          lineHeight: 1.5,
          color: colors.textSecondary,
        }}
      >
        {answer}
      </p>
    </div>
  );
};

export default HelpPanel;
