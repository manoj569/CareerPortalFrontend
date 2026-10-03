import { useCallback, useEffect, useRef, useState } from 'react';

import { apiClient } from '@/api/apiClient';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';

const PROFILE_PHOTO_CHANGED_EVENT = 'careerharbor:profile-photo-changed';

export function useAuthenticatedProfilePhoto() {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const mountedRef = useRef(false);
  const requestRef = useRef(0);

  const clearPhoto = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (mountedRef.current) {
      setPhotoUrl(null);
    }
  }, []);

  const loadPhoto = useCallback(async () => {
    const requestId = ++requestRef.current;

    try {
      const response = await apiClient.request<Blob>({
        method: 'GET',
        responseType: 'blob',
        url: API_ENDPOINTS.CANDIDATE.PROFILE_PHOTO,
      });

      if (!mountedRef.current || requestId !== requestRef.current) return;

      const nextUrl = URL.createObjectURL(response.data);

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }

      objectUrlRef.current = nextUrl;
      setPhotoUrl(nextUrl);
    } catch {
      if (!mountedRef.current || requestId !== requestRef.current) return;
      clearPhoto();
    }
  }, [clearPhoto]);

  useEffect(() => {
    mountedRef.current = true;
    void loadPhoto();

    const handlePhotoChanged = () => {
      void loadPhoto();
    };

    window.addEventListener(PROFILE_PHOTO_CHANGED_EVENT, handlePhotoChanged);

    return () => {
      mountedRef.current = false;
      requestRef.current += 1;
      window.removeEventListener(PROFILE_PHOTO_CHANGED_EVENT, handlePhotoChanged);

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [loadPhoto]);

  return {
    photoUrl,
    reloadPhoto: loadPhoto,
  };
}
