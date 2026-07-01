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

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 1,
    allowsEditing: false,
  });
  if (result.canceled || !result.assets?.[0]) return null;

  const a = result.assets[0];
  return {
    uri: a.uri,
    name: a.fileName ?? nameFromUri(a.uri, 'jpg'),
    mimeType: a.mimeType ?? 'image/jpeg',
    size: a.fileSize ?? null,
  };
}
