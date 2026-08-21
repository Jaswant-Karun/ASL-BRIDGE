export default function SignSequence({ gloss = [], unsupported = [] }) {
  return (
    <section aria-label="ASL sign sequence">
      <p>{gloss.join(' -> ')}</p>
      {unsupported.length > 0 && <p>Unsupported signs: {unsupported.join(', ')}</p>}
    </section>
  );
}
