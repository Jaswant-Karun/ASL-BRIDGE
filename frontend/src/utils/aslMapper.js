export function mapWordToSign(word) {
  return `/asl/${word.toLowerCase().replaceAll(' ', '_')}.mp4`;
}
