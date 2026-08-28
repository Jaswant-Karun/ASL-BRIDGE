export function errorHandler(error, _request, response, _next) {
  console.error(error);
  const status = typeof error.status === 'number' ? error.status : 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error.'
      : (error.message || 'Internal server error.');
  response.status(status).json({ error: message });
}
