import { useCallback, useEffect, useRef } from 'react';

// Extend Window to include the Cloudinary widget global
declare global {
  interface Window {
    cloudinary?: {
      createUploadWidget: (
        options: Record<string, unknown>,
        callback: (error: unknown, result: CloudinaryWidgetResult) => void
      ) => CloudinaryWidget;
    };
  }
}

interface CloudinaryWidgetResult {
  event: string;
  info: {
    secure_url: string;
    public_id: string;
    resource_type: string;
    format: string;
  };
}

interface CloudinaryWidget {
  open: () => void;
  close: () => void;
  destroy: () => void;
}

const WIDGET_SCRIPT_URL =
  'https://upload-widget.cloudinary.com/latest/global/all.js';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;

let scriptLoaded = false;
let scriptLoading = false;
const callbacks: Array<() => void> = [];

function loadWidgetScript(onReady: () => void) {
  if (scriptLoaded) { onReady(); return; }
  callbacks.push(onReady);
  if (scriptLoading) return;
  scriptLoading = true;
  const script = document.createElement('script');
  script.src = WIDGET_SCRIPT_URL;
  script.async = true;
  script.onload = () => {
    scriptLoaded = true;
    scriptLoading = false;
    callbacks.forEach((cb) => cb());
    callbacks.length = 0;
  };
  document.head.appendChild(script);
}

/**
 * useCloudinaryWidget
 *
 * Opens the Cloudinary Upload Widget with cloud storage sources enabled.
 * Calls onSuccess(secureUrl) when the user selects/uploads an image.
 */
export function useCloudinaryWidget(onSuccess: (url: string) => void) {
  const widgetRef   = useRef<CloudinaryWidget | null>(null);
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  // Load widget script on mount
  useEffect(() => {
    loadWidgetScript(() => {});
    return () => {
      widgetRef.current?.destroy();
      widgetRef.current = null;
    };
  }, []);

  const openWidget = useCallback(() => {
    loadWidgetScript(() => {
      if (!window.cloudinary) return;

      // Destroy previous instance
      widgetRef.current?.destroy();

      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: CLOUD_NAME,
          uploadPreset: 'portfolio_unsigned', // unsigned preset — see note below
          folder: 'portfolio/card-images',
          maxFiles: 1,
          resourceType: 'image',
          maxFileSize: 10_000_000, // 10 MB
          clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
          // ── Cloud storage sources ──────────────────────────────────────
          sources: [
            'local',          // device file picker
            'url',            // direct URL
            'camera',         // webcam
            'google_drive',   // Google Drive
            'dropbox',        // Dropbox
            'onedrive',       // Microsoft OneDrive
            'unsplash',       // Unsplash free photos
            'shutterstock',   // Shutterstock (browse only)
          ],
          // ── UI options ─────────────────────────────────────────────────
          styles: {
            palette: {
              window:      '#1a1d27',
              windowBorder: '#2e3250',
              tabIcon:     '#6366f1',
              menuIcons:   '#94a3b8',
              textDark:    '#e2e8f0',
              textLight:   '#94a3b8',
              link:        '#6366f1',
              action:      '#6366f1',
              inactiveTabIcon: '#555a7a',
              error:       '#ef4444',
              inProgress:  '#6366f1',
              complete:    '#22c55e',
              sourceBg:    '#0f1117',
            },
            fonts: {
              default: null,
              "'Inter', sans-serif": {
                url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
                active: true,
              },
            },
          },
          showAdvancedOptions: false,
          cropping: false,
          multiple: false,
          defaultSource: 'local',
          showSkipCropButton: false,
        },
        (error: unknown, result: CloudinaryWidgetResult) => {
          if (error) return;
          if (result.event === 'success') {
            onSuccessRef.current(result.info.secure_url);
            widgetRef.current?.close();
          }
        }
      );

      widgetRef.current.open();
    });
  }, []);

  return openWidget;
}
