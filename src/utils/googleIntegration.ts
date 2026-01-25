// Configuration for Google Integration
// Now handled dynamically via user input stored in LocalStorage

const SCOPES = 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/photospicker.mediaitems.readonly';
const STORAGE_KEY = 'google_api_credentials';

interface GoogleCredentials {
  clientId: string;
  apiKey: string;
}

let tokenClient: any;
let accessToken: string | null = null;
let pickerApiLoaded = false;
let gapiLoaded = false;

export const saveCredentials = (clientId: string, apiKey: string) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ clientId, apiKey }));
};

export const getCredentials = (): GoogleCredentials | null => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (e) {
    return null;
  }
};

export const clearCredentials = () => {
  localStorage.removeItem(STORAGE_KEY);
  tokenClient = null;
  accessToken = null;
};

/**
 * Loads the necessary Google API scripts (gapi and gsi)
 * @param onLoaded Callback when API is ready
 * @param maxRetries Maximum retry attempts (default: 20 = 10 seconds)
 */
export const loadGoogleApi = (onLoaded?: () => void, maxRetries: number = 20) => {
  const gapi = (window as any).gapi;
  const google = (window as any).google;

  // Ensure both the basic gapi object AND the google.accounts (from GSI) are available
  if (!gapi || !google || !google.accounts) {
    if (maxRetries <= 0) {
      console.warn('[GoogleIntegration] Google API scripts not loaded after max retries. Google Drive integration will be unavailable.');
      return;
    }
    // Retry if scripts aren't fully loaded yet
    setTimeout(() => loadGoogleApi(onLoaded, maxRetries - 1), 500);
    return;
  }

  // Load Picker API via gapi
  gapi.load('client:picker', async () => {
    pickerApiLoaded = true;
    gapiLoaded = true;
    if (onLoaded) onLoaded();
  });
};

/**
 * Initialize the Token Client with a specific Client ID
 */
export const initializeTokenClient = (clientId: string) => {
  const google = (window as any).google;
  if (!google || !google.accounts) {
    console.warn("Google Identity Services not loaded yet.");
    return;
  }

  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPES,
    callback: '', // Defined at request time
  });
};

/**
 * Request Access Token
 */
export const getAccessToken = (clientId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (accessToken) {
      resolve(accessToken);
      return;
    }

    if (!tokenClient) {
      initializeTokenClient(clientId);
    }

    if (!tokenClient) {
      reject(new Error('Google Identity Services not initialized. Please try again in a moment.'));
      return;
    }

    tokenClient.callback = (response: any) => {
      if (response.error !== undefined) {
        reject(response);
      }
      accessToken = response.access_token;
      resolve(accessToken!);
    };

    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
};

/**
 * Open the Google Picker
 */
export const openPicker = async (onPick: (files: File[]) => void) => {
  const creds = getCredentials();
  if (!creds) {
    throw new Error("Missing Credentials");
  }

  if (!pickerApiLoaded) {
    console.error("Picker API not loaded");
    throw new Error("Google Picker API is not ready. Please refresh.");
  }

  try {
    const token = await getAccessToken(creds.clientId);
    const google = (window as any).google;

    const pickerCallback = async (data: any) => {
      if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
        const documents = data[google.picker.Response.DOCUMENTS];
        const files: File[] = [];

        for (const doc of documents) {
          const fileId = doc[google.picker.Document.ID];
          const name = doc[google.picker.Document.NAME];
          const mimeType = doc[google.picker.Document.MIME_TYPE];
          
          try {
             // Construct download URL for Drive files
             const driveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
             
             const response = await fetch(driveUrl, {
               headers: {
                 'Authorization': `Bearer ${token}`
               }
             });
             
             if (response.ok) {
               const blob = await response.blob();
               const file = new File([blob], name, { type: mimeType });
               files.push(file);
             } else {
               console.error("Failed to download file", name);
             }
          } catch (err) {
            console.error("Error processing file", name, err);
          }
        }
        
        onPick(files);
      }
    };

    const view = new google.picker.DocsView(google.picker.ViewId.DOCS_IMAGES);
    view.setMimeTypes("image/png,image/jpeg,image/jpg");

    // TEMP: Photos view disabled for testing - may have API restrictions
    // const photosView = new google.picker.View(google.picker.ViewId.PHOTOS);

    const picker = new google.picker.PickerBuilder()
      .setTitle('Selecione suas fotos')
      .setLocale('pt-BR')
      .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
      .setAppId(creds.clientId.split('-')[0])
      .setOAuthToken(token)
      .addView(view)
      .setDeveloperKey(creds.apiKey)
      .setCallback(pickerCallback)
      .setSize(900, 600)
      .build();

    picker.setVisible(true);
  } catch (err) {
    console.error("Error opening picker:", err);
    throw err;
  }
};