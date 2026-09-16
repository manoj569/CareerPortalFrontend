export const isSafeProfessionalText = (value: string): boolean => {
  const text = value.trim();
  return Boolean(text) && /[\p{L}\p{N}]/u.test(text) &&
    !/[<>]/u.test(text) && !Array.from(text).some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127) &&
    !/(?:javascript:|data:text\/html)/i.test(text);
};

export const isWholeInrAmount = (value: string): boolean =>
  /^(?:0|[1-9]\d*)$/.test(value) && Number(value) <= 1_000_000_000;
