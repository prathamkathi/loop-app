import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  Modal,
  StyleSheet,
  useWindowDimensions,
  Platform,
  ScrollView,
  Animated,
  Linking,
} from 'react-native';
import { X, MagnifyingGlassPlus, MagnifyingGlassMinus, ArrowSquareOut, ArrowsCounterClockwise } from 'phosphor-react-native';
import { BlurView } from 'expo-blur';
import { typography, radii } from '../theme';
import { getOptimizedImageUrl } from '../utils/cloudinary';

type Props = {
  visible: boolean;
  imageUri: string;
  title?: string;
  subtitle?: string;
  onClose: () => void;
};

export default function PosterLightboxModal({
  visible,
  imageUri,
  title,
  subtitle,
  onClose,
}: Props) {
  const { width, height } = useWindowDimensions();
  const [zoomScale, setZoomScale] = useState(1);
  const [imgError, setImgError] = useState(false);

  // Reset zoom on open
  React.useEffect(() => {
    if (visible) {
      setZoomScale(1);
      setImgError(false);
    }
  }, [visible, imageUri]);

  if (!visible || !imageUri) return null;

  const fullResolutionUrl = getOptimizedImageUrl(imageUri, 1600);

  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => Math.max(prev - 0.5, 1));
  };

  const handleResetZoom = () => {
    setZoomScale(1);
  };

  const handleOpenRawImage = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(imageUri, '_blank', 'noopener,noreferrer');
    } else {
      Linking.openURL(imageUri);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Dark blurred backdrop */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close image lightbox"
        >
          <View style={styles.backdrop} />
        </Pressable>

        {/* Top Control Bar */}
        <View style={styles.topBar}>
          <View style={styles.headerInfo}>
            {title ? (
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>

          <View style={styles.topActions}>
            {/* Open Original Full-Res Link */}
            <Pressable
              onPress={handleOpenRawImage}
              accessibilityRole="link"
              accessibilityLabel="Open original image"
              style={({ pressed }) => [
                styles.iconBtn,
                Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                pressed && { transform: [{ scale: 0.92 }] },
              ]}
            >
              <ArrowSquareOut size={20} color="#FFFFFF" weight="bold" />
            </Pressable>

            {/* Close Button */}
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close lightbox"
              style={({ pressed }) => [
                styles.closeBtn,
                Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                pressed && { transform: [{ scale: 0.92 }] },
              ]}
            >
              <X size={20} color="#FFFFFF" weight="bold" />
            </Pressable>
          </View>
        </View>

        {/* Uncropped Zoomable Image Container */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            { width: Math.max(width, width * zoomScale), height: Math.max(height * 0.8, height * 0.8 * zoomScale) },
          ]}
          maximumZoomScale={3}
          minimumZoomScale={1}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          centerContent
        >
          <Pressable
            onPress={() => setZoomScale((prev) => (prev > 1 ? 1 : 2))}
            accessibilityRole="button"
            accessibilityLabel={zoomScale > 1 ? "Zoom out image" : "Zoom in image"}
            style={[
              styles.imageWrap,
              Platform.OS === 'web' && ({
                cursor: zoomScale > 1 ? 'zoom-out' : 'zoom-in',
                transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              } as any),
            ]}
          >
            <Image
              source={{ uri: fullResolutionUrl }}
              style={[
                styles.image,
                {
                  transform: [{ scale: zoomScale }],
                },
              ]}
              resizeMode="contain"
              onError={() => setImgError(true)}
            />
          </Pressable>
        </ScrollView>

        {/* Bottom Zoom Toolbar */}
        <View style={styles.bottomToolbar}>
          <View style={styles.zoomControls}>
            <Pressable
              onPress={handleZoomOut}
              disabled={zoomScale <= 1}
              style={({ pressed }) => [
                styles.zoomBtn,
                zoomScale <= 1 && styles.btnDisabled,
                Platform.OS === 'web' && ({ cursor: zoomScale <= 1 ? 'default' : 'pointer' } as any),
                pressed && { opacity: 0.7 },
              ]}
              accessibilityLabel="Zoom out"
            >
              <MagnifyingGlassMinus size={18} color="#FFFFFF" weight="bold" />
            </Pressable>

            <Pressable
              onPress={handleResetZoom}
              style={({ pressed }) => [
                styles.zoomPill,
                Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                pressed && { opacity: 0.8 },
              ]}
              accessibilityLabel="Reset zoom"
            >
              <Text style={styles.zoomText}>{Math.round(zoomScale * 100)}%</Text>
            </Pressable>

            <Pressable
              onPress={handleZoomIn}
              disabled={zoomScale >= 3}
              style={({ pressed }) => [
                styles.zoomBtn,
                zoomScale >= 3 && styles.btnDisabled,
                Platform.OS === 'web' && ({ cursor: zoomScale >= 3 ? 'default' : 'pointer' } as any),
                pressed && { opacity: 0.7 },
              ]}
              accessibilityLabel="Zoom in"
            >
              <MagnifyingGlassPlus size={18} color="#FFFFFF" weight="bold" />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.94)',
    position: 'relative',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10, 10, 12, 0.88)',
  },
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 48 : 20,
    left: 16,
    right: 16,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(24, 24, 27, 0.75)',
    borderRadius: radii.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        } as any)
      : {}),
  },
  headerInfo: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    ...typography.labelLg,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  subtitle: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    marginTop: 2,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    flex: 1,
    marginTop: 70,
    marginBottom: 70,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrap: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '92%',
    height: '92%',
  },
  bottomToolbar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 24,
    left: 0,
    right: 0,
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(24, 24, 27, 0.85)',
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        } as any)
      : {}),
  },
  zoomBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  zoomText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.35,
  },
});
