import Navbar from '../components/Navbar';

export default function PresentationMode({ navigate }) {
  return <><Navbar navigate={navigate} /><main><h1>Presentation Mode</h1><p>Upload processing is ready for the presentation extraction provider configuration.</p></main></>;
}
