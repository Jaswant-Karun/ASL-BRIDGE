import Navbar from '../components/Navbar';

export default function About({ navigate }) {
  return <><Navbar navigate={navigate} /><main><h1>About ASL Bridge</h1><p>An accessibility-focused MVP for English captions and ASL-oriented sign sequences.</p></main></>;
}
