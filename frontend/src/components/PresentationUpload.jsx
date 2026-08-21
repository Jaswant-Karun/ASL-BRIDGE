export default function PresentationUpload({ onResult, onError }) {
	async function uploadFile(event) {
		const file = event.target.files?.[0];
		if (!file) return;
		const data = new FormData(); data.append('presentation', file);
		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/presentation/process`, { method: 'POST', body: data });
			const result = await response.json();
			if (!response.ok) throw new Error(result.error || 'Presentation processing failed.');
			onResult?.(result);
		} catch (error) { onError?.(error.message); }
	}

	return <section className="upload-box"><label htmlFor="presentation-file">Upload a PowerPoint presentation</label><input id="presentation-file" type="file" accept=".pptx" onChange={uploadFile} /><small>Slide text is extracted, converted into an ASL-oriented sequence, and shown with captions.</small></section>;
}
