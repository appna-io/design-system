import { Combobox, Div } from '@apx-ui/ds';

const ALL_LANGUAGES = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Rust',
  'Go',
  'Ruby',
  'Java',
  'Kotlin',
  'Swift',
  'C++',
  'C#',
  'PHP',
  'Elixir',
  'Haskell',
  'OCaml',
  'Scala',
  'Clojure',
  'Erlang',
  'Lua',
  'R',
  'Julia',
  'Dart',
  'Zig',
];

function fakeFetchLanguages(query: string, signal: AbortSignal): Promise<{ value: string; label: string }[]> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      if (signal.aborted) {
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }
      const filtered = ALL_LANGUAGES.filter((name) =>
        name.toLowerCase().includes(query.toLowerCase()),
      )
        .slice(0, 8)
        .map((name) => ({ value: name.toLowerCase(), label: name }));
      resolve(filtered);
    }, 400);
    signal.addEventListener('abort', () => {
      clearTimeout(t);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

export default function Async() {
  return (
    <Div className="max-w-sm">
      <Combobox
        aria-label="Language"
        placeholder="Start typing a language…"
        loadOptions={(query, { signal }) => fakeFetchLanguages(query, signal)}
        debounceMs={250}
      />
    </Div>
  );
}