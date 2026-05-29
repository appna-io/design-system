import { describe, expect, it } from 'vitest';

import { parseEventValue } from '../src/Form/parseEventValue';

function makeEvent(target: Partial<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> & { value?: string; checked?: boolean }, ctor: typeof HTMLInputElement | typeof HTMLTextAreaElement | typeof HTMLSelectElement) {
  const el = document.createElement(ctor === HTMLInputElement ? 'input' : ctor === HTMLTextAreaElement ? 'textarea' : 'select');
  if (target.value !== undefined) (el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value = target.value;
  if (target.checked !== undefined) (el as HTMLInputElement).checked = target.checked;
  if ((target as HTMLInputElement).type) (el as HTMLInputElement).type = (target as HTMLInputElement).type;
  return { target: el } as unknown as React.ChangeEvent<typeof el>;
}

describe('parseEventValue', () => {
  it('returns string value for text input', () => {
    const e = makeEvent({ value: 'hello', type: 'text' } as never, HTMLInputElement);
    expect(parseEventValue(e)).toBe('hello');
  });

  it('returns boolean checked for checkbox', () => {
    const e = makeEvent({ value: 'on', checked: true, type: 'checkbox' } as never, HTMLInputElement);
    expect(parseEventValue(e)).toBe(true);
  });

  it('coerces number inputs to Number', () => {
    const e = makeEvent({ value: '42', type: 'number' } as never, HTMLInputElement);
    expect(parseEventValue(e)).toBe(42);
  });

  it('returns empty string for empty number input', () => {
    const e = makeEvent({ value: '', type: 'number' } as never, HTMLInputElement);
    expect(parseEventValue(e)).toBe('');
  });

  it('keeps the raw string when number coercion produces NaN', () => {
    // jsdom strips non-numeric values from `<input type="number">`, so we have to construct
    // the call manually with a fake target instead of relying on the DOM element to retain the
    // bad value.
    const fakeInput = Object.assign(document.createElement('input'), { type: 'number' });
    Object.defineProperty(fakeInput, 'value', { get: () => 'abc' });
    const e = { target: fakeInput } as unknown as React.ChangeEvent<HTMLInputElement>;
    expect(parseEventValue(e)).toBe('abc');
  });

  it('returns value for textarea', () => {
    const e = makeEvent({ value: 'multiline' } as never, HTMLTextAreaElement);
    expect(parseEventValue(e)).toBe('multiline');
  });

  it('returns selectedOptions array for multi-select', () => {
    const select = document.createElement('select');
    select.multiple = true;
    const o1 = document.createElement('option');
    o1.value = 'a';
    o1.selected = true;
    const o2 = document.createElement('option');
    o2.value = 'b';
    o2.selected = true;
    const o3 = document.createElement('option');
    o3.value = 'c';
    select.append(o1, o2, o3);
    const e = { target: select } as unknown as React.ChangeEvent<HTMLSelectElement>;
    expect(parseEventValue(e)).toEqual(['a', 'b']);
  });
});
