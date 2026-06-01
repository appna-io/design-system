import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { FileUpload } from '../src/FileUpload/FileUpload';
import { renderWithTheme as render } from './utils';

function makeFile(name: string, type: string, size = 512): File {
  return new File([new Uint8Array(size)], name, { type });
}

describe('FileUpload', () => {
  it('renders browse control and dropzone label', () => {
    render(<FileUpload label="Attachments" />);
    expect(screen.getByText('Attachments')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Browse…' })).toBeInTheDocument();
  });

  it('adds files from native input change', async () => {
    const onFilesChange = vi.fn();
    const { container } = render(<FileUpload onFilesChange={onFilesChange} multiple />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile('photo.png', 'image/png');

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    expect(onFilesChange).toHaveBeenCalled();
    expect(screen.getByText('photo.png')).toBeInTheDocument();
  });

  it('rejects files over maxSize', async () => {
    const onReject = vi.fn();
    const { container } = render(
      <FileUpload maxSize={100} onReject={onReject} />,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await act(async () => {
      fireEvent.change(input, {
        target: { files: [makeFile('large.bin', 'application/octet-stream', 500)] },
      });
    });

    expect(onReject).toHaveBeenCalled();
    expect(screen.queryByText('large.bin')).not.toBeInTheDocument();
  });

  it('uploads with progress when upload fn is provided', async () => {
    const upload = vi.fn(
      async (_file: File, ctx: { onProgress: (n: number) => void }) => {
        ctx.onProgress(0.5);
        await Promise.resolve();
        ctx.onProgress(1);
      },
    );

    const { container } = render(<FileUpload upload={upload} autoUpload />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await act(async () => {
      fireEvent.change(input, { target: { files: [makeFile('a.txt', 'text/plain')] } });
    });

    await waitFor(() => expect(upload).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(screen.getByText('a.txt')).toBeInTheDocument(),
    );
  });

  it('removes a file row', async () => {
    const user = userEvent.setup();
    const { container } = render(<FileUpload />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await act(async () => {
      fireEvent.change(input, { target: { files: [makeFile('remove-me.txt', 'text/plain')] } });
    });

    expect(screen.getByText('remove-me.txt')).toBeInTheDocument();
    const removeButtons = screen.getAllByRole('button', { name: 'Remove' });
    await user.click(removeButtons[0]!);
    expect(screen.queryByText('remove-me.txt')).not.toBeInTheDocument();
  });
});