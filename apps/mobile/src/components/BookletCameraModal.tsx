import { useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, typography } from '@/theme';

type CapturedBookletPhoto = {
  uri: string;
  width?: number;
  height?: number;
};

export function BookletCameraModal({
  visible,
  pageTitle,
  onClose,
  onCaptured,
}: {
  visible: boolean;
  pageTitle: string;
  onClose: () => void;
  onCaptured: (photo: CapturedBookletPhoto) => void;
}) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [taking, setTaking] = useState(false);

  async function capture() {
    if (!cameraRef.current || taking) return;
    setTaking(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.95, skipProcessing: false });
      if (photo?.uri) onCaptured({ uri: photo.uri, width: photo.width, height: photo.height });
    } finally {
      setTaking(false);
    }
  }

  return <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
    <View style={s.root}>
      {permission?.granted ? <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" mode="picture" /> : <View style={s.permissionPane}>
        <Ionicons name="camera-outline" size={42} color={colors.primary} />
        <Text style={s.permissionTitle}>اجازه دوربین لازم است</Text>
        <Text style={s.permissionText}>برای گرفتن عکس از دفترچه سلامت، دسترسی دوربین را فعال کنید.</Text>
        <Pressable style={s.permissionButton} onPress={() => void requestPermission()}><Text style={s.permissionButtonText}>فعال کردن دوربین</Text></Pressable>
      </View>}

      {permission?.granted ? <>
        <View style={s.topShade} pointerEvents="none" />
        <View style={s.bottomShade} pointerEvents="none" />
        <View style={s.leftShade} pointerEvents="none" />
        <View style={s.rightShade} pointerEvents="none" />

        <View style={s.header}>
          <Pressable style={s.close} onPress={onClose} disabled={taking}><Ionicons name="close" size={27} color="#fff" /></Pressable>
          <View style={s.headerCopy}>
            <Text style={s.headerTitle}>صفحه نمودار را افقی بگیرید</Text>
            <Text style={s.headerText}>نوشته‌های چاپی صفحه در جهت خواندن باشند</Text>
          </View>
        </View>

        <View style={s.guideArea} pointerEvents="none">
          <View style={s.pageFrame}>
            <View style={[s.corner, s.cornerTL]} /><View style={[s.corner, s.cornerTR]} />
            <View style={[s.corner, s.cornerBL]} /><View style={[s.corner, s.cornerBR]} />
            <View style={s.frameLabel}><Text style={s.frameLabelText}>{pageTitle}</Text></View>
          </View>
          <View style={s.guideCopy}>
            <Text style={s.guideTitle}>فقط همین صفحه افقی را داخل کادر قرار دهید</Text>
            <Text style={s.guideText}>چهار گوشه صفحه کامل دیده شود · عنوان نمودار خوانا باشد · دوربین موازی صفحه · بدون سایه و بازتاب نور</Text>
          </View>
        </View>

        <View style={s.controls}>
          <View style={s.orientationPill}><Ionicons name="phone-landscape-outline" size={18} color="#fff" /><Text style={s.orientationText}>صفحه افقی</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel="گرفتن عکس" style={[s.shutterOuter, taking && s.disabled]} onPress={() => void capture()} disabled={taking}>
            {taking ? <ActivityIndicator color="#fff" /> : <View style={s.shutterInner} />}
          </Pressable>
          <View style={s.spacer} />
        </View>
      </> : null}
    </View>
  </Modal>;
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#111' },
  permissionPane: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 12, backgroundColor: colors.mutedBackground },
  permissionTitle: { fontFamily: typography.bold, fontSize: 18, fontWeight: '900', color: colors.foreground, writingDirection: 'rtl' },
  permissionText: { fontFamily: typography.regular, fontSize: 12, color: colors.muted, textAlign: 'center', lineHeight: 22, writingDirection: 'rtl' },
  permissionButton: { minHeight: 48, paddingHorizontal: 20, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 5 },
  permissionButtonText: { fontFamily: typography.bold, color: '#fff', fontSize: 13, fontWeight: '900', writingDirection: 'rtl' },
  topShade: { position: 'absolute', top: 0, left: 0, right: 0, height: '15%', backgroundColor: 'rgba(0,0,0,.50)' },
  bottomShade: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '22%', backgroundColor: 'rgba(0,0,0,.58)' },
  leftShade: { position: 'absolute', top: '15%', bottom: '22%', left: 0, width: '7%', backgroundColor: 'rgba(0,0,0,.46)' },
  rightShade: { position: 'absolute', top: '15%', bottom: '22%', right: 0, width: '7%', backgroundColor: 'rgba(0,0,0,.46)' },
  header: { position: 'absolute', left: 16, right: 16, top: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 },
  close: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(0,0,0,.42)', alignItems: 'center', justifyContent: 'center' },
  headerCopy: { flex: 1, alignItems: 'flex-end' },
  headerTitle: { fontFamily: typography.bold, color: '#fff', fontWeight: '900', fontSize: 16, writingDirection: 'rtl', textAlign: 'right' },
  headerText: { fontFamily: typography.regular, color: 'rgba(255,255,255,.82)', fontSize: 11, marginTop: 2, writingDirection: 'rtl', textAlign: 'right' },
  guideArea: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', paddingTop: 30, paddingBottom: 80 },
  pageFrame: { width: '90%', aspectRatio: 1.42, borderWidth: 1, borderColor: 'rgba(255,255,255,.50)', borderRadius: 8, position: 'relative' },
  corner: { position: 'absolute', width: 34, height: 34, borderColor: '#fff' },
  cornerTL: { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 7 },
  cornerTR: { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 7 },
  cornerBL: { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 7 },
  cornerBR: { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 7 },
  frameLabel: { position: 'absolute', top: 10, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,.48)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  frameLabelText: { fontFamily: typography.bold, color: '#fff', fontSize: 10, fontWeight: '800', writingDirection: 'rtl' },
  guideCopy: { marginTop: 12, paddingHorizontal: 20, alignItems: 'center' },
  guideTitle: { fontFamily: typography.bold, color: '#fff', fontSize: 13, fontWeight: '900', textAlign: 'center', writingDirection: 'rtl' },
  guideText: { fontFamily: typography.regular, color: 'rgba(255,255,255,.84)', fontSize: 10, lineHeight: 17, marginTop: 3, textAlign: 'center', writingDirection: 'rtl' },
  controls: { position: 'absolute', left: 18, right: 18, bottom: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orientationPill: { minWidth: 92, minHeight: 38, borderRadius: 20, backgroundColor: 'rgba(0,0,0,.44)', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 10 },
  orientationText: { fontFamily: typography.bold, color: '#fff', fontSize: 10, fontWeight: '800', writingDirection: 'rtl' },
  shutterOuter: { width: 78, height: 78, borderRadius: 39, borderWidth: 4, borderColor: '#fff', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,.18)' },
  shutterInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff' },
  spacer: { width: 92 },
  disabled: { opacity: .65 },
});
