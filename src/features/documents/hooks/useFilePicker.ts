// src/features/documents/hooks/useFilePicker.ts
// Wraps expo-document-picker (Files) and expo-image-picker (Photos) into a
// single "pick a file" flow, returning a normalised PickedFile.

import { Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import type { PickedFile } from '../types/documents.types';

function nameFromUri(uri: string, fallbackExt = 'jpg'): string {
  const last = uri.split('/').pop() ?? '';
  const clean = last.split('?')[0] ?? '';
  return clean || `photo-${Date.now()}.${fallbackExt}`;
}

// Files app / iCloud Drive / third-party providers.
export async function pickFromFiles(): Promise<PickedFile | null> {
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
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert(
      'Photos access needed',
      'Enable photo library access in Settings to add photos.',
    );
    return null;
  }

  // iOS hands back HEIC by default. Nothing outside Apple reads it — it cannot be
  // embedded in a PDF, previewed reliably, or opened by a clinic. `Compatible` tells
  // iOS to transcode to JPEG on export, so HEIC never enters storage.
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.9,
    allowsEditing: false,
    preferredAssetRepresentationMode:
      ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
  });
  if (result.canceled || !result.assets?.[0]) return null;
  const a = result.assets[0];

  // Never trust the picker's mimeType — it has reported image/jpeg for HEIC files.
  // Derive it from the filename, and normalise any .heic name to .jpg.
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
