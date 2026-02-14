import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Camera, CameraView, useCameraPermissions } from "expo-camera";
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from "react";
import { Alert, Linking, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Scanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);

  if (!permission) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0F0C29', '#302B63', '#24243E']}
          style={StyleSheet.absoluteFillObject}
        />
        <SafeAreaView style={{ flex: 1 }} />
      </View>
    );
  }

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScannedData(data);
    setIsScanning(false);
  };

  const copyToClipboard = async () => {
    if (scannedData) {
      await Clipboard.setStringAsync(scannedData);
      Alert.alert("Success", "Copied to clipboard!");
    }
  };

  const openLink = async () => {
    if (scannedData) {
      try {
        const supported = await Linking.canOpenURL(scannedData);
        if (supported) {
          await Linking.openURL(scannedData);
        } else {
          Alert.alert("Error", "Cannot open this link: " + scannedData);
        }
      } catch (err) {
        // Silent fail
      }
    }
  };

  const isUrl = (text: string | null) => {
    if (!text) return false;
    return (
      text.startsWith("http://") ||
      text.startsWith("https://") ||
      text.startsWith("www.") ||
      text.startsWith("mailto:")
    );
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (Camera && Camera.scanFromURLAsync) {
          const scannedResults = await Camera.scanFromURLAsync(result.assets[0].uri, ["qr"]);

          if (scannedResults.length > 0) {
            const { data } = scannedResults[0];
            setScannedData(data);
            setIsScanning(false);
            Alert.alert("Success", "QR Code found in image!");
          } else {
            Alert.alert("No QR Code", "Could not find a valid QR code in the selected image.");
          }
        } else {
          Alert.alert(
            "Feature Unavailable",
            "Scanning from gallery requires a native build update."
          );
        }
      }
    } catch (E: any) {
      console.log(E);
      Alert.alert("Error", "Failed to scan image: " + (E.message || "Unknown error"));
    }
  };

  if (isScanning) {
    return (
      <View style={StyleSheet.absoluteFill}>
        <StatusBar barStyle="light-content" translucent />
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          onBarcodeScanned={scannedData && !isScanning ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />

        {/* Scan Overlay */}
        <View style={styles.scanOverlay}>
          <View style={styles.overlayRow}>
            <View style={styles.overlayBlur} />
          </View>
          <View style={styles.middleRow}>
            <View style={styles.overlayBlur} />
            <View style={styles.scanFrame}>
              <View style={styles.cornerTopLeft} />
              <View style={styles.cornerTopRight} />
              <View style={styles.cornerBottomLeft} />
              <View style={styles.cornerBottomRight} />
            </View>
            <View style={styles.overlayBlur} />
          </View>
          <View style={styles.overlayRow}>
            <View style={styles.overlayBlur} />
          </View>
        </View>

        <SafeAreaView style={styles.overlayUI}>
          <LinearGradient
            colors={['rgba(102, 126, 234, 0.9)', 'rgba(118, 75, 162, 0.9)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.scanInstruction}
          >
            <Text style={styles.scanInstructionText}>Align QR code within the frame</Text>
          </LinearGradient>

          <View style={styles.controlsContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.controlButton}>
              <View style={styles.controlIconBg}>
                <MaterialCommunityIcons name="image-outline" size={28} color="#FFF" />
              </View>
              <Text style={styles.controlLabel}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsScanning(false)} style={styles.closeButton}>
              <LinearGradient
                colors={['#FFFFFF', '#F0F0F0']}
                style={styles.closeButtonGradient}
              >
                <MaterialCommunityIcons name="close" size={32} color="#1A1A2E" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F0C29', '#302B63', '#24243E']}
        style={StyleSheet.absoluteFillObject}
      />
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' }}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={['#667EEA', '#764BA2', '#F093FB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.titleGradient}
          >
            <Text style={styles.title}>QR Scanner</Text>
          </LinearGradient>
        </View>

        {scannedData ? (
          <View style={styles.resultCard}>
            <View style={styles.cardGlass} />
            <View style={styles.cardContent}>
              <View style={styles.successIconContainer}>
                <MaterialCommunityIcons name="check-circle-outline" size={80} color="#4CD964" />
              </View>

              <Text style={styles.resultLabel}>Scanned Content:</Text>
              <View style={styles.resultBox}>
                <Text style={styles.resultText} numberOfLines={6}>{scannedData}</Text>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity onPress={copyToClipboard} style={{ flex: 1 }} activeOpacity={0.9}>
                  <LinearGradient
                    colors={['#667EEA', '#764BA2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.actionButton}
                  >
                    <MaterialCommunityIcons name="content-copy" size={20} color="#FFFFFF" />
                    <Text style={styles.buttonText}>Copy</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {isUrl(scannedData) && (
                  <TouchableOpacity onPress={openLink} style={{ flex: 1 }} activeOpacity={0.9}>
                    <LinearGradient
                      colors={['#F093FB', '#F5576C']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.actionButton}
                    >
                      <MaterialCommunityIcons name="open-in-new" size={20} color="#FFFFFF" />
                      <Text style={styles.buttonText}>Open</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                onPress={() => {
                  setScannedData(null);
                  setIsScanning(true);
                }}
                style={{ width: "100%", marginTop: 16 }}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#4CD964', '#34C759']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.scanAgainButton}
                >
                  <MaterialCommunityIcons name="qrcode-scan" size={22} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Scan Another</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.startContainer}>
            <View style={styles.iconGlow}>
              <MaterialCommunityIcons name="qrcode-scan" size={100} color="#667EEA" />
            </View>
            <Text style={styles.instructionText}>Position the QR code within the frame to scan.</Text>

            {!permission.granted ? (
              <TouchableOpacity
                onPress={requestPermission}
                style={{ width: '100%' }}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#667EEA', '#764BA2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.permissionButton}
                >
                  <MaterialCommunityIcons name="camera" size={24} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Allow Camera Access</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setScannedData(null);
                  setIsScanning(true);
                }}
                style={{ width: '100%' }}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#667EEA', '#764BA2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.scanButton}
                >
                  <MaterialCommunityIcons name="camera" size={24} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Start Scanning</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  titleGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
  },
  overlayRow: {
    flex: 1,
  },
  middleRow: {
    flexDirection: 'row',
    height: 280,
  },
  overlayBlur: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  scanFrame: {
    width: 280,
    height: 280,
    borderColor: 'transparent',
    position: 'relative',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 50,
    height: 50,
    borderColor: '#667EEA',
    borderTopWidth: 5,
    borderLeftWidth: 5,
    borderTopLeftRadius: 12,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 50,
    height: 50,
    borderColor: '#667EEA',
    borderTopWidth: 5,
    borderRightWidth: 5,
    borderTopRightRadius: 12,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 50,
    height: 50,
    borderColor: '#667EEA',
    borderBottomWidth: 5,
    borderLeftWidth: 5,
    borderBottomLeftRadius: 12,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 50,
    height: 50,
    borderColor: '#667EEA',
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderBottomRightRadius: 12,
  },
  overlayUI: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingVertical: 60,
    alignItems: 'center',
  },
  scanInstruction: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  scanInstructionText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 50,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  controlIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(102, 126, 234, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  controlLabel: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  closeButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startContainer: {
    width: "100%",
    alignItems: "center",
  },
  iconGlow: {
    padding: 40,
    borderRadius: 100,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    marginBottom: 30,
  },
  instructionText: {
    fontSize: 16,
    color: "#B8B8D1",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  resultCard: {
    width: "100%",
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardGlass: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
  },
  cardContent: {
    padding: 30,
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: 24,
  },
  resultLabel: {
    fontSize: 13,
    color: "#B8B8D1",
    fontWeight: "700",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  resultBox: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  resultText: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 24,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  actionButton: {
    flexDirection: "row",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  scanAgainButton: {
    flexDirection: "row",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: '#4CD964',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  permissionButton: {
    flexDirection: 'row',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  scanButton: {
    flexDirection: 'row',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
