import { useState } from 'react';
import { HiArrowUpRight } from 'react-icons/hi2';
import { usePortfolio } from '../context/usePortfolio.js';
import { Button, Field, SectionHeading, Surface } from './ui.jsx';
import SocialLinks from './SocialLinks.jsx';

export default function ContactSection() {
  const { portfolioData: data } = usePortfolio();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');
  const handleChange = (event) => {
    setStatus('');
    setFormData((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!data.email) {
      setStatus('An email address is not available. Please use one of the social links.');
      return;
    }
    const subject = encodeURIComponent(`Message from ${formData.name}`);
    const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`);
    window.location.href = `mailto:${data.email}?subject=${subject}&body=${body}`;
    setStatus('Your email app should open with a draft. Send it there to finish. Your message is kept here.');
  };
  return <section id="contact" className="section-shell section-space">
    <SectionHeading number="05" title="Let’s make something great" />
    <div className="contact-layout">
      <div className="contact-copy">
        <h3>Have a project in mind?<br /><span className="accent-text">Let’s talk.</span></h3>
        <p className="muted">For a collaboration, an opportunity, or just a hello — my inbox is open.</p>
        {data.email && <a className="text-link contact-email" href={`mailto:${data.email}`}>{data.email}<HiArrowUpRight aria-hidden="true" /></a>}
        <SocialLinks />
        {data.cvLink && <Button href={data.cvLink} target="_blank" rel="noopener noreferrer">View résumé <HiArrowUpRight aria-hidden="true" /></Button>}
      </div>
      <Surface as="form" className="contact-form" onSubmit={handleSubmit}>
        <Field label="Your name" name="name" autoComplete="name" value={formData.name} onChange={handleChange} required />
        <Field label="Email address" name="email" type="email" autoComplete="email" value={formData.email} onChange={handleChange} required />
        <Field label="What are you working on?" name="message" multiline rows={5} value={formData.message} onChange={handleChange} required />
        <Button type="submit" variant="primary">Open email draft <HiArrowUpRight aria-hidden="true" /></Button>
        <p className="small muted">Opens your email app. Nothing is sent automatically.</p>
        <p role="status" className="form-status">{status}</p>
      </Surface>
    </div>
  </section>;
}
