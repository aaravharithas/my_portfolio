import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { HiMoon, HiSun, HiCog6Tooth, HiXMark, HiCheck } from 'react-icons/hi2';
import { useTheme } from '../context/useTheme.js';
import { appearanceCategories } from '../config/appearance.js';

const icons = { sun: HiSun, moon: HiMoon };

export default function ThemeControls() {
  const theme = useTheme();
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const showSettings = () => {
    dialogRef.current.showModal();
    setOpen(true);
  };
  const closeSettings = () => dialogRef.current.close();
  const keepFocusInPanel = (event) => {
    if (event.key !== 'Tab') return;
    const controls = event.currentTarget.querySelectorAll('button:not(:disabled), input:checked:not(:disabled)');
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  const handleBackdropClick = (event) => {
    if (event.target !== event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeSettings();
  };

  return <>
    <button type="button" className="settings-trigger" ref={triggerRef} onClick={showSettings}
      aria-label="Settings" title="Settings" aria-haspopup="dialog" aria-expanded={open} aria-controls="appearance-settings">
      <HiCog6Tooth aria-hidden="true" />
    </button>
    {createPortal(<dialog id="appearance-settings" className="settings-panel" ref={dialogRef}
      aria-labelledby="settings-title" aria-describedby="settings-description" onClick={handleBackdropClick} onKeyDown={keepFocusInPanel}
      onClose={() => { setOpen(false); triggerRef.current?.focus(); }}>
      <div className="settings-top"><header className="settings-heading">
        <div><p className="eyebrow">Make it yours</p><h2 id="settings-title">Appearance</h2></div>
        <button type="button" className="icon-button settings-close" onClick={closeSettings} aria-label="Close settings"><HiXMark aria-hidden="true" /></button>
      </header>
      <p id="settings-description" className="muted small">Your space. Your style. Saved as you choose.</p></div>
      <div className="settings-categories">
        {appearanceCategories.map((category) => {
          const selected = theme[category.key];
          return <fieldset className={`settings-category settings-category--${category.key}`} key={category.key}
            aria-describedby={`setting-description-${category.key}`}>
            <legend>{category.label}</legend>
            <p className="muted small" id={`setting-description-${category.key}`}>
              {category.description}
            </p>
            <div className="setting-options">
              {category.options.map((option) => {
                const Icon = icons[option.icon];
                return <label className="setting-option" key={option.value}>
                  <input type="radio" name={category.key} value={option.value} checked={selected === option.value}
                    onChange={() => theme.setPreference(category.key, option.value)} />
                  <span className="option-content">
                    {option.preview ? <span className={`material-preview material-preview--${option.preview}`} aria-hidden="true">
                      <span className="preview-pane"><span /><span /><span /></span>
                    </span> : Icon && <Icon className="option-icon" aria-hidden="true" />}
                    <span className="option-label">{option.label}</span>
                    <span className="option-description">{option.description}</span>
                    <HiCheck className="option-check" aria-hidden="true" />
                  </span>
                </label>;
              })}
            </div>
          </fieldset>;
        })}
      </div>
      <div className="settings-bottom"><button type="button" className="button button--primary settings-done" onClick={closeSettings}>Done</button></div>
    </dialog>, document.body)}
  </>;
}
