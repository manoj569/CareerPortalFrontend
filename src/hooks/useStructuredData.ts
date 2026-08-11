import { useEffect } from 'react';

export const useStructuredData = (id: string, value: object): void => {
  const serializedValue = JSON.stringify(value).replace(/</g, '\\u003c');

  useEffect(() => {
    const existing = document.getElementById(id);
    const script = existing instanceof HTMLScriptElement ? existing : document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.text = serializedValue;
    if (!existing) document.head.appendChild(script);

    return () => script.remove();
  }, [id, serializedValue]);
};
