import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SectionHeading, Surface } from '../src';
import { renderWithTheme as render } from './utils';

/**
 * This component replaced four hand-written copies that had drifted to three different heading
 * sizes. These tests assert the things that drift — the size, the measure, the outline — plus
 * the deliberate absence of an `onDark` axis.
 */
describe('SectionHeading', () => {
  it('renders the eyebrow, title and body', () => {
    render(<SectionHeading eyebrow="Pricing" title="Simple, honest pricing" body="One line." />);
    expect(screen.getByText('Pricing')).toBeInTheDocument();
    expect(screen.getByText('Simple, honest pricing')).toBeInTheDocument();
    expect(screen.getByText('One line.')).toBeInTheDocument();
  });

  it('defaults to an <h2> — a section opener, not a page title', () => {
    render(<SectionHeading title="The craft" />);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('separates visual size from heading level, so a big heading can still tell the truth', () => {
    render(<SectionHeading size="hero" level={3} title="Loud but nested" />);
    // Visually the hero scale; semantically an h3. Forcing these together means either the page
    // looks wrong or the outline lies to a screen reader.
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('renders each eyebrow treatment — the only real difference between the four copies', () => {
    const { unmount } = render(<SectionHeading eyebrow="New" eyebrowVariant="rule" title="T" />);
    // The rule variant contributes a decorative hairline that ties eyebrow to heading.
    expect(document.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0);
    unmount();

    render(<SectionHeading eyebrow="New" eyebrowVariant="plain" title="T" />);
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(document.querySelectorAll('[aria-hidden="true"]').length).toBe(0);
  });

  it('has no onDark axis — the Surface tone says what colour the text is', () => {
    // Regression guard on a deliberate API decision. Two of the four copies had this prop and
    // each faked it differently, one of them with `opacity-80`, which fails contrast on a
    // saturated brand fill.
    const props = ['eyebrow', 'eyebrowVariant', 'title', 'body', 'align', 'size', 'level'];
    expect(props).not.toContain('onDark');
    expect(props).not.toContain('inverted');
  });

  it('caps the body measure and centres it only when the block is centred', () => {
    const { unmount } = render(<SectionHeading title="T" body="Body copy" />);
    let body = screen.getByText('Body copy');
    expect(body.className).toContain('max-w-2xl');
    expect(body.className).not.toContain('mx-auto');
    unmount();

    render(<SectionHeading title="T" body="Body copy" align="center" />);
    body = screen.getByText('Body copy');
    expect(body.className).toContain('max-w-2xl');
    expect(body.className).toContain('mx-auto');
  });

  it('does not push the title down when there is no eyebrow', () => {
    render(<SectionHeading title="Bare" />);
    expect(screen.getByText('Bare').className).not.toContain('mt-5');
  });
});

describe('SectionHeading — the eyebrow follows the ground', () => {
  it('uses the brand role on a default surface', () => {
    render(<SectionHeading eyebrow="Pricing" title="T" />);
    // No surface has established a ground, so the brand chip is correct and stays.
    expect(screen.getByText('Pricing').className).toMatch(/primary/);
  });

  it('switches off the brand role inside a brand band, without being asked', () => {
    render(
      <Surface tone="primary">
        <SectionHeading eyebrow="Ready" title="T" />
      </Surface>,
    );
    // A `primary` chip on a `primary` ground is the brand painted on itself — invisible, on
    // exactly the band the tone exists to make easy. `neutral` is the role every tone map
    // re-points at its own ground.
    const chip = screen.getByText('Ready').className;
    expect(chip).toMatch(/neutral/);
    expect(chip).not.toMatch(/primary/);
  });

  it('does the same inside an inverted band', () => {
    render(
      <Surface tone="inverted">
        <SectionHeading eyebrow="Craft" title="T" />
      </Surface>,
    );
    expect(screen.getByText('Craft').className).toMatch(/neutral/);
  });

  it('still lets art direction override it explicitly', () => {
    render(
      <Surface tone="primary">
        <SectionHeading eyebrow="Loud" eyebrowColor="secondary" title="T" />
      </Surface>,
    );
    // The prop remains the escape hatch — for a deliberate choice, or a ground whose tone vars
    // were set by hand rather than by `Surface`.
    expect(screen.getByText('Loud').className).toMatch(/secondary/);
  });

  // The rule's label takes its colour through a CSS custom property rather than a class, so the
  // hairline is what these assert on — same resolved role, and it is the visible half anyway.
  const hairline = () => document.querySelector('[aria-hidden="true"]')!.className;

  it('keeps the rule eyebrow its own colour on a plain surface', () => {
    render(<SectionHeading eyebrow="The craft" eyebrowVariant="rule" title="T" />);
    // The brass hairline is that variant's whole identity in the template that uses it — moving
    // it to the badge's role would be a silent visual change to a shipped page.
    expect(hairline()).toContain('bg-secondary');
  });

  it('moves the rule eyebrow when the ground changes under it', () => {
    render(
      <Surface tone="primary">
        <SectionHeading eyebrow="The craft" eyebrowVariant="rule" title="T" />
      </Surface>,
    );
    // `secondary` is a brand role and brand roles do not remap per tone — so on a brand band the
    // hairline would be drawn in a colour with no relationship to the ground it sits on.
    expect(hairline()).toContain('bg-neutral');
  });
});

describe('SectionHeading — treatment is a template decision, not a call-site one', () => {
  it('takes a whole intro object, the shape a content file already holds', () => {
    render(<SectionHeading intro={{ eyebrow: 'Shop', title: 'Made to last', body: 'One line.' }} />);
    expect(screen.getByText('Shop')).toBeInTheDocument();
    expect(screen.getByText('Made to last')).toBeInTheDocument();
    expect(screen.getByText('One line.')).toBeInTheDocument();
  });

  it('lets an individual prop override one field of the intro', () => {
    render(<SectionHeading intro={{ title: 'From content' }} title="Overridden" />);
    expect(screen.getByText('Overridden')).toBeInTheDocument();
    expect(screen.queryByText('From content')).toBeNull();
  });

  it('carries a lighter display weight when the brand asks for one', () => {
    // Three of eight templates run a lighter display weight as their identity, and a hardcoded
    // bold heading is why they each kept a hand-written copy of this component.
    render(<SectionHeading title="Quiet" titleWeight="medium" />);
    // `weight` resolves through a token custom property rather than a utility class, so the
    // assertion has to look at the style the way the browser does.
    expect(screen.getByText('Quiet').getAttribute('style')).toContain('font-weight-medium');
  });

  it('caps the heading measure when asked, and centres the cap with the block', () => {
    const { unmount } = render(<SectionHeading title="Long heading" titleMeasure="md" />);
    expect(screen.getByText('Long heading').className).toContain('max-w-3xl');
    unmount();

    render(<SectionHeading title="Long heading" titleMeasure="lg" align="center" />);
    const cls = screen.getByText('Long heading').className;
    expect(cls).toContain('max-w-4xl');
    // A capped block that is not centred sits left of a centred page — the cap and the alignment
    // have to agree.
    expect(cls).toContain('mx-auto');
  });

  it('leaves the heading uncapped by default', () => {
    render(<SectionHeading title="Wide" />);
    expect(screen.getByText('Wide').className).not.toMatch(/max-w-/);
  });
});

describe('SectionHeading — the eyebrow is content, not a string', () => {
  it('accepts a composed eyebrow', () => {
    // A number baseline-aligned with a label is a real eyebrow, and typing this as `string` was
    // enough on its own to make a template keep a whole hand-written copy of this component.
    render(
      <SectionHeading
        eyebrow={
          <>
            <span>01</span>
            <span>Selected work</span>
          </>
        }
        eyebrowVariant="plain"
        title="Case studies"
      />,
    );
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('Selected work')).toBeInTheDocument();
  });

  it('still takes a plain string', () => {
    render(<SectionHeading eyebrow="Pricing" title="T" />);
    expect(screen.getByText('Pricing')).toBeInTheDocument();
  });
});
