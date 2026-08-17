// src/features/documents/hooks/useFilePicker.ts
// Wraps expo-document-picker (Files) and expo-image-picker (Photos) into a
// single "pick a file" flow, returning a normalised PickedFile.
// On web, both paths use a hidden <input type="file"> instead of the native pickers.
import { Alert, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import type { PickedFile } from '../types/documents.types';

function nameFromUri(uri: string, fallbackExt = 'jpg'): string {
  const last = uri.split('/').pop() ?? '';
  const clean = last.split('?')[0] ?? '';
  return clean || `photo-${Date.now()}.${fallbackExt}`;
}

// Web: open a file input, return the selection as a blob: URI the repository can fetch().
function pickFromWeb(accept: string): Promise<PickedFile | null> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve(null);
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.style.display = 'none';
    let settled = false;
    const done = (v: PickedFile | null) => {
      if (settled) return;
      settled = true;
      input.remove();
      resolve(v);
    };
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        done(null);
        return;
      }
      done({
        uri: URL.createObjectURL(file),
        name: file.name || `file-${Date.now()}`,
        mimeType: file.type || null,
        size: file.size ?? null,
      });
    };
    // Fires when the dialog is dismissed without a pick on most browsers.
    input.oncancel = () => done(null);
    document.body.appendChild(input);
    input.click();
  });
}

// Files app / iCloud Drive / third-party providers.
export async function pickFromFiles(): Promise<PickedFile | null> {
  if (Platform.OS === 'web') return pickFromWeb('*/*');
  const result = await DocumentPicker.getDocumentAsync({
    type: '*/*',
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled || !result.assets?.[0]) return null;
  const a = result.assets[0];
  return {
    uri: a.uri,
    name: a.name ?? nameFromUri(a.uri, 'dat'),
    mimeType: a.mimeType ?? null,
    size: a.size ?? null,
  };
}

// Photo library — requires NSPhotoLibraryUsageDescription (set via plugin).
export async function pickFromPhotos(): Promise<PickedFile | null> {
  if (Platform.OS === 'web') return pickFromWeb('image/*');
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert(
      'Photos access needed',
      'Enable photo library access in Settings to add photos.',
    );
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.9,
    allowsEditing: false,
    preferredAssetRepresentationMode:
      ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
  });
  if (result.canceled || !result.assets?.[0]) return null;
  const a = result.assets[0];
  const rawName = a.fileName ?? nameFromUri(a.uri, 'jpg');
  const name = rawName.replace(/\.(heic|heif)$/i, '.jpg');
  const isPng = /\.png$/i.test(name);
  return {
    uri: a.uri,
    name,
    mimeType: isPng ? 'image/png' : 'image/jpeg',
    size: a.fileSize ?? null,
  };
}
