import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { TagsInput } from '../src/TagsInput';
import type { TagsInputChangeMeta } from '../src/TagsInput';
import { renderWithTheme as render } from './utils';

function getInput(): HTMLInputElement {
  return screen.getByRole('combobox') as HTMLInputElement;
}

function getTags(): string[] {
  return Array.from(document.querySelectorAll('[data-tag]')).map(
    (el) => el.getAttribute('data-tag') ?? '',
  );
}

describe('TagsInput — rendering & defaults', () => {
  it('renders the input as role="combobox"', () => {
    render(<TagsInput defaultValue={['react']} />);
    const input = getInput();
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders one Badge per tag', () => {
    render(<TagsInput defaultValue={['a', 'b', 'c']} />);
    expect(getTags()).toEqual(['a', 'b', 'c']);
  });

  it('uses the default placeholder when no override', () => {
    render(<TagsInput />);
    expect(getInput().getAttribute('placeholder')).toBe('Add a tag…');
  });

  it('honours a consumer placeholder', () => {
    render(<TagsInput placeholder="enter…" />);
    expect(getInput().getAttribute('placeholder')).toBe('enter…');
  });

  it('renders hidden inputs (one per tag) when `name` is set', () => {
    render(<TagsInput defaultValue={['a', 'b']} name="tags" />);
    const hidden = document.querySelectorAll('input[type="hidden"]');
    expect(hidden).toHaveLength(2);
    expect(hidden[0]?.getAttribute('value')).toBe('a');
    expect(hidden[1]?.getAttribute('value')).toBe('b');
  });

  it('omits hidden inputs when no `name`', () => {
    render(<TagsInput defaultValue={['a']} />);
    expect(document.querySelectorAll('input[type="hidden"]')).toHaveLength(0);
  });
});

describe('TagsInput — controlled / uncontrolled', () => {
  it('uncontrolled default value paints chips', () => {
    render(<TagsInput defaultValue={['x', 'y']} />);
    expect(getTags()).toEqual(['x', 'y']);
  });

  it('controlled value reflects parent state', () => {
    function Wrapper() {
      const [v, setV] = useState<string[]>(['one']);
      return (
        <>
          <TagsInput value={v} onChange={(n) => setV([...n])} />
          <button onClick={() => setV([...v, 'two'])}>add</button>
        </>
      );
    }
    render(<Wrapper />);
    expect(getTags()).toEqual(['one']);
    fireEvent.click(screen.getByText('add'));
    expect(getTags()).toEqual(['one', 'two']);
  });
});

describe('TagsInput — typed input + commit', () => {
  it('Enter commits the pending input as a tag', async () => {
    const onChange = vi.fn();
    render(<TagsInput onChange={onChange} />);
    await userEvent.type(getInput(), 'hello{Enter}');
    expect(getTags()).toEqual(['hello']);
    expect(onChange).toHaveBeenCalledWith(
      ['hello'],
      expect.objectContaining<TagsInputChangeMeta>({ action: 'add', tag: 'hello', source: 'enter' }),
    );
  });

  it('typing a separator commits the pending tag', async () => {
    render(<TagsInput />);
    await userEvent.type(getInput(), 'foo,');
    expect(getTags()).toEqual(['foo']);
    expect(getInput().value).toBe('');
  });

  it('separator at the end leaves no trailing token', async () => {
    render(<TagsInput />);
    await userEvent.type(getInput(), 'a,b,');
    expect(getTags()).toEqual(['a', 'b']);
  });

  it('separator without a closing one keeps the trailing token in the input', async () => {
    render(<TagsInput splitOn={[',']} />);
    await userEvent.type(getInput(), 'a,b');
    expect(getTags()).toEqual(['a']);
    expect(getInput().value).toBe('b');
  });

  it('trim is on by default', async () => {
    render(<TagsInput />);
    await userEvent.type(getInput(), '  hello  {Enter}');
    expect(getTags()).toEqual(['hello']);
  });

  it('toLowerCase folds before storing', async () => {
    render(<TagsInput toLowerCase />);
    await userEvent.type(getInput(), 'REACT{Enter}');
    expect(getTags()).toEqual(['react']);
  });
});

describe('TagsInput — removal', () => {
  it('Backspace at empty input removes the last tag', async () => {
    render(<TagsInput defaultValue={['a', 'b', 'c']} />);
    const input = getInput();
    input.focus();
    await userEvent.keyboard('{Backspace}');
    expect(getTags()).toEqual(['a', 'b']);
  });

  it('Backspace with non-empty input keeps tags', async () => {
    render(<TagsInput defaultValue={['a']} />);
    await userEvent.type(getInput(), 'xyz{Backspace}');
    expect(getTags()).toEqual(['a']);
  });

  it('clicking the Badge remove button removes that tag', async () => {
    render(<TagsInput defaultValue={['alpha', 'beta', 'gamma']} />);
    const removeBeta = screen.getByLabelText('Remove beta');
    await userEvent.click(removeBeta);
    expect(getTags()).toEqual(['alpha', 'gamma']);
  });
});

describe('TagsInput — tag cursor', () => {
  it('ArrowLeft at input start activates cursor on last tag', async () => {
    render(<TagsInput defaultValue={['a', 'b', 'c']} />);
    const input = getInput();
    input.focus();
    await userEvent.keyboard('{ArrowLeft}');
    const selected = document.querySelector('[data-tag-selected]');
    expect(selected?.getAttribute('data-tag')).toBe('c');
  });

  it('ArrowLeft again moves cursor backwards', async () => {
    render(<TagsInput defaultValue={['a', 'b', 'c']} />);
    getInput().focus();
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(document.querySelector('[data-tag-selected]')?.getAttribute('data-tag')).toBe('b');
  });

  it('Delete with cursor removes the selected tag', async () => {
    render(<TagsInput defaultValue={['a', 'b', 'c']} />);
    getInput().focus();
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}{Delete}');
    expect(getTags()).toEqual(['a', 'c']);
  });

  it('Escape clears the cursor', async () => {
    render(<TagsInput defaultValue={['a', 'b']} />);
    getInput().focus();
    await userEvent.keyboard('{ArrowLeft}{Escape}');
    expect(document.querySelector('[data-tag-selected]')).toBeNull();
  });
});

describe('TagsInput — paste', () => {
  it('pasting a CSV produces multiple tags', () => {
    render(<TagsInput splitOn={/[,\s]+/} />);
    const input = getInput();
    fireEvent.paste(input, {
      clipboardData: {
        getData: (type: string) => (type === 'text' ? 'foo, bar,  baz' : ''),
      },
    });
    expect(getTags()).toEqual(['foo', 'bar', 'baz']);
  });

  it('paste without any separator is treated as normal text', () => {
    render(<TagsInput />);
    const input = getInput();
    fireEvent.paste(input, {
      clipboardData: {
        getData: (type: string) => (type === 'text' ? 'hello' : ''),
      },
    });
    expect(getTags()).toEqual([]);
  });
});

describe('TagsInput — duplicates', () => {
  it('rejects duplicates by default', async () => {
    const onChange = vi.fn();
    render(<TagsInput defaultValue={['a']} onChange={onChange} />);
    await userEvent.type(getInput(), 'a{Enter}');
    expect(getTags()).toEqual(['a']);
    expect(onChange).toHaveBeenCalledWith(
      ['a'],
      expect.objectContaining<TagsInputChangeMeta>({ action: 'reject-duplicate', tag: 'a' }),
    );
  });

  it('allowDuplicates accepts the second copy', async () => {
    render(<TagsInput defaultValue={['a']} allowDuplicates />);
    await userEvent.type(getInput(), 'a{Enter}');
    expect(getTags()).toEqual(['a', 'a']);
  });
});

describe('TagsInput — maxTags', () => {
  it('blocks add when the cap is reached', async () => {
    const onChange = vi.fn();
    render(<TagsInput defaultValue={['a', 'b']} maxTags={2} onChange={onChange} />);
    // When `maxTags` is hit the input switches to read-only so the user can't even type a new
    // candidate (the placeholder explains why). The chip count stays at the cap.
    expect(getInput()).toHaveAttribute('readonly');
    await userEvent.type(getInput(), 'c{Enter}');
    expect(getTags()).toEqual(['a', 'b']);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('fires reject-max when paste tries to overflow the cap', () => {
    const onChange = vi.fn();
    render(
      <TagsInput
        defaultValue={['a']}
        maxTags={2}
        onChange={onChange}
        splitOn={[',']}
      />,
    );
    // Paste two tokens onto a cap-of-2 field that already has one — first one fits, second
    // trips the reject-max guard.
    fireEvent.paste(getInput(), {
      clipboardData: {
        getData: (type: string) => (type === 'text' ? 'b,c' : ''),
      },
    });
    expect(getTags()).toEqual(['a', 'b']);
    expect(onChange).toHaveBeenCalledWith(
      ['a', 'b'],
      expect.objectContaining<TagsInputChangeMeta>({ action: 'reject-max' }),
    );
  });

  it('swaps the placeholder when reached', () => {
    render(<TagsInput defaultValue={['a', 'b']} maxTags={2} />);
    expect(getInput().getAttribute('placeholder')).toBe('Maximum 2 tags reached');
    expect(getInput()).toHaveAttribute('readonly');
  });
});

describe('TagsInput — validate', () => {
  it('marks invalid tags via data-tag-invalid', async () => {
    render(
      <TagsInput
        validate={(tag) => tag.includes('@') || 'must be email'}
      />,
    );
    await userEvent.type(getInput(), 'nope{Enter}');
    const tagEl = document.querySelector('[data-tag="nope"]')!;
    expect(tagEl.getAttribute('data-tag-invalid')).toBe('true');
    expect(tagEl.getAttribute('title')).toBe('must be email');
  });

  it('valid tags omit the invalid attribute', async () => {
    render(<TagsInput validate={() => true} />);
    await userEvent.type(getInput(), 'ok{Enter}');
    const tagEl = document.querySelector('[data-tag="ok"]')!;
    expect(tagEl.getAttribute('data-tag-invalid')).toBeNull();
  });
});

describe('TagsInput — suggestions (static)', () => {
  it('opens listbox when typing matches', async () => {
    render(<TagsInput suggestions={['React', 'Vue', 'Svelte']} />);
    await userEvent.type(getInput(), 'V');
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
    expect(screen.getByRole('option', { name: 'Vue' })).toBeInTheDocument();
  });

  it('Enter on highlighted suggestion commits it', async () => {
    render(<TagsInput suggestions={['React', 'Vue', 'Svelte']} />);
    await userEvent.type(getInput(), 'V{Enter}');
    expect(getTags()).toEqual(['Vue']);
  });

  it('ArrowDown moves the active descendant', async () => {
    render(<TagsInput suggestions={['Alpha', 'Apple', 'Apricot']} />);
    await userEvent.type(getInput(), 'A');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(getTags()).toEqual(['Apple']);
  });

  it('omits already-committed tags from suggestions by default', async () => {
    render(<TagsInput defaultValue={['React']} suggestions={['React', 'Vue']} />);
    await userEvent.type(getInput(), 'R');
    expect(screen.queryByRole('option', { name: 'React' })).toBeNull();
  });

  it('clicking a suggestion row commits it', async () => {
    render(<TagsInput suggestions={['React', 'Vue', 'Svelte']} />);
    await userEvent.type(getInput(), 'Sv');
    await userEvent.click(screen.getByRole('option', { name: 'Svelte' }));
    expect(getTags()).toEqual(['Svelte']);
  });
});

describe('TagsInput — label / description / helper / error wiring', () => {
  it('label is associated to the combobox input via htmlFor', () => {
    render(<TagsInput label="Tags" defaultValue={['a']} />);
    const input = getInput();
    const label = document.querySelector('label')!;
    expect(label.getAttribute('for')).toBe(input.getAttribute('id'));
    expect(label.textContent).toContain('Tags');
  });

  it('error sets aria-invalid and renders role=alert', () => {
    render(<TagsInput label="Tags" error="Required" />);
    expect(getInput()).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
  });

  it('required marks the input with aria-required and renders an asterisk', () => {
    render(<TagsInput label="Tags" required />);
    expect(getInput()).toHaveAttribute('aria-required', 'true');
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('helperText renders when no error', () => {
    render(<TagsInput label="Tags" helperText="optional" />);
    expect(screen.getByText('optional')).toBeInTheDocument();
  });

  it('helperText is hidden when error is set', () => {
    render(<TagsInput label="Tags" helperText="optional" error="bad" />);
    expect(screen.queryByText('optional')).not.toBeInTheDocument();
  });
});

describe('TagsInput — disabled / readOnly', () => {
  it('disabled blocks keyboard add', async () => {
    const onChange = vi.fn();
    render(<TagsInput disabled defaultValue={['a']} onChange={onChange} />);
    await userEvent.type(getInput(), 'b{Enter}');
    expect(getTags()).toEqual(['a']);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('readOnly blocks remove', async () => {
    const onChange = vi.fn();
    render(<TagsInput readOnly defaultValue={['a']} onChange={onChange} />);
    getInput().focus();
    await userEvent.keyboard('{Backspace}');
    expect(getTags()).toEqual(['a']);
    expect(onChange).not.toHaveBeenCalled();
  });
});
