export function mapGlossToAnimations(signs, gloss = []) {
  const animations = [];
  const unsupported = [];

  for (const token of gloss) {
    const sign = signs[token.toUpperCase()];
    if (sign) animations.push({ token, ...sign });
    else unsupported.push(token);
  }

  return { animations, unsupported };
}
