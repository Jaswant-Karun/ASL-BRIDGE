export function processPresentation(_request, response) {
  response.status(501).json({ error: 'Presentation processing is not configured yet.' });
}
