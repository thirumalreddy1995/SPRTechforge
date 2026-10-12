import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Button, Card, Input, Modal, SearchInput, Select } from './Components';

// The automation contract: every shared control exposes a data-testid derived
// from its label / placeholder / text, and an explicit one always wins.
describe('shared components expose automation hooks', () => {
  it('Input derives input-<label>, falls back to the placeholder, honours an explicit id', () => {
    render(<Input label="Full Name" value="" onChange={() => {}} />);
    expect(screen.getByTestId('input-full-name')).toBeTruthy();
    render(<Input placeholder="Search events..." value="" onChange={() => {}} />);
    expect(screen.getByTestId('input-search-events')).toBeTruthy();
    render(<Input label="Email" data-testid="custom-email" value="" onChange={() => {}} />);
    expect(screen.getByTestId('custom-email')).toBeTruthy();
    expect(screen.queryByTestId('input-email')).toBeNull();
  });

  it('Select derives select-<label>', () => {
    render(<Select label="Role" value="staff" onChange={() => {}}><option value="staff">Staff</option></Select>);
    expect(screen.getByTestId('select-role').tagName).toBe('SELECT');
  });

  it('Button derives btn-<text>, including emoji-prefixed labels, and keeps its text', () => {
    render(<Button>🚀 Publish Event</Button>);
    const b = screen.getByTestId('btn-publish-event');
    expect(b.textContent).toContain('Publish Event');
    render(<Button variant="secondary">Export CSV</Button>);
    expect(screen.getByTestId('btn-export-csv')).toBeTruthy();
  });

  it('Button with only an icon child gets no derived id (so no bogus "btn")', () => {
    const { container } = render(<Button><svg /></Button>);
    expect(container.querySelector('button')?.getAttribute('data-testid')).toBeNull();
  });

  it('Modal is a dialog with modal-<title> and a close button', () => {
    render(<Modal isOpen title="Candidate Profile" onClose={() => {}}><p>body</p></Modal>);
    const dialog = screen.getByTestId('modal-candidate-profile');
    expect(dialog.getAttribute('role')).toBe('dialog');
    expect(screen.getByTestId('modal-close')).toBeTruthy();
  });

  it('Card and SearchInput derive from title and placeholder', () => {
    render(<Card title="Registrations by source">x</Card>);
    expect(screen.getByTestId('card-registrations-by-source')).toBeTruthy();
    render(<SearchInput placeholder="Type code, name, or mobile…" value="" onChange={() => {}} onClear={() => {}} />);
    expect(screen.getByTestId('search-type-code-name-or-mobile')).toBeTruthy();
  });
});
