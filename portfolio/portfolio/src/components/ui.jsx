import { useState } from 'react';

export function Surface({ as: Component = 'div', className = '', children, ...props }) {
  return <Component className={`surface ${className}`} {...props}>{children}</Component>;
}

export function Button({ href, variant = 'secondary', className = '', children, ...props }) {
  const Component = href ? 'a' : 'button';
  return <Component {...(!href ? { type: 'button' } : { href })}
    className={`button button--${variant} ${className}`} {...props}>{children}</Component>;
}

export function Badge({ children }) {
  return <span className="badge">{children}</span>;
}

export function Field({ label, name, multiline = false, ...props }) {
  const Component = multiline ? 'textarea' : 'input';
  return <label className="field"><span>{label}</span>
    <Component className="input" name={name} {...props} /></label>;
}

export function SectionHeading({ number, title, description }) {
  return <header className="section-heading">
    <p className="eyebrow"><span>{number}</span> / {title}</p>
    <h2>{title}</h2>
    {description && <p className="muted">{description}</p>}
  </header>;
}

export function PortfolioImage({ src, alt, className = '', ...props }) {
  const [failedSource, setFailedSource] = useState(null);
  if (!src || failedSource === src) {
    return <div className={`image-placeholder ${className}`} role="img" aria-label={alt}>
      <span aria-hidden="true">{alt?.trim().charAt(0) || 'P'}</span>
    </div>;
  }
  return <img src={src} alt={alt} className={className} onError={() => setFailedSource(src)} {...props} />;
}
