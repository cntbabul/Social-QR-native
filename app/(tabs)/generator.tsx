import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import React, { useRef, useState } from 'react';
import { Alert, Keyboard, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

const Generator = () => {
    const [text, setText] = useState('');
    const [customMessage, setCustomMessage] = useState('');
    const [qrValue, setQrValue] = useState('');
    const qrRef = useRef<any>(null);
    const captureViewRef = useRef<View>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    const pasteFromClipboard = async () => {
        const content = await Clipboard.getStringAsync();
        if (content) {
            setText(content);
        }
    };

    const handleGenerate = () => {
        if (!text.trim()) {
            Alert.alert("Input Required", "Please enter some text or a URL to generate a QR code.");
            return;
        }
        setQrValue(text);
        Keyboard.dismiss();

        // Auto-scroll to the bottom where QR code appears
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const downloadQRCode = async () => {
        try {
            const uri = await captureRef(captureViewRef, {
                format: "png",
                quality: 1,
            });

            const directory = FileSystem.documentDirectory || FileSystem.cacheDirectory;
            const filename = directory + "gen_qrcode.png";

            await FileSystem.copyAsync({
                from: uri,
                to: filename
            });

            Sharing.shareAsync(filename).catch(err => {
                Alert.alert("Error", "Sharing failed: " + err.message);
            });
        } catch (error: any) {
            Alert.alert("Error", "Failed to save/share image: " + error.message);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0F0C29', '#302B63', '#24243E']}
                style={StyleSheet.absoluteFillObject}
            />
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={{ flex: 1 }}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={{ flex: 1 }}>
                        <ScrollView
                            ref={scrollViewRef}
                            style={{ flex: 1 }}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            keyboardDismissMode="on-drag"
                        >
                            {/* Header */}
                            <View style={styles.headerContainer}>
                                <LinearGradient
                                    colors={['#667EEA', '#764BA2', '#F093FB']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.titleGradient}
                                >
                                    <Text style={styles.title}>QR Generator</Text>
                                </LinearGradient>
                                <Text style={styles.subtitle}>Create custom QR codes instantly</Text>
                            </View>

                            {/* Input Card */}
                            <View style={styles.card}>
                                <View style={styles.cardGlass} />
                                <View style={styles.cardContent}>
                                    <View style={styles.inputContainer}>
                                        <View style={styles.labelRow}>
                                            <Text style={styles.label}>
                                                <MaterialCommunityIcons name="text" size={14} color="#A0A0FF" /> CONTENT
                                            </Text>
                                            <TouchableOpacity onPress={pasteFromClipboard} style={styles.pasteButton}>
                                                <MaterialCommunityIcons name="content-paste" size={14} color="#667EEA" />
                                                <Text style={styles.pasteText}>Paste</Text>
                                            </TouchableOpacity>
                                        </View>

                                        <View style={styles.inputWrapper}>
                                            <TextInput
                                                style={[styles.input, { height: 100, textAlignVertical: 'top', paddingTop: 12 }]}
                                                placeholder="Enter text, URL, or message..."
                                                placeholderTextColor="#888"
                                                value={text}
                                                onChangeText={setText}
                                                multiline
                                                numberOfLines={4}
                                                blurOnSubmit
                                            />
                                            {text.length > 0 && (
                                                <TouchableOpacity onPress={() => setText('')} style={styles.clearButton}>
                                                    <MaterialCommunityIcons name="close-circle" size={20} color="#888" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>

                                    <View style={styles.inputContainer}>
                                        <Text style={styles.label}>
                                            <MaterialCommunityIcons name="message-text" size={14} color="#F093FB" /> CUSTOM MESSAGE (OPTIONAL)
                                        </Text>
                                        <View style={styles.inputWrapper}>
                                            <TextInput
                                                style={styles.inputSingle}
                                                placeholder="Add a title or label..."
                                                placeholderTextColor="#888"
                                                value={customMessage}
                                                onChangeText={setCustomMessage}
                                            />
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        onPress={handleGenerate}
                                        activeOpacity={0.9}
                                    >
                                        <LinearGradient
                                            colors={['#667EEA', '#764BA2']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={styles.generateButton}
                                        >
                                            <MaterialCommunityIcons name="qrcode-scan" size={24} color="#FFF" />
                                            <Text style={styles.buttonText}>Generate Code</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* QR Code Result */}
                            {qrValue ? (
                                <View style={styles.resultCard}>
                                    <View style={styles.cardGlass} />
                                    <View style={styles.cardContent}>
                                        <View ref={captureViewRef} style={styles.qrCaptureContainer} collapsable={false}>
                                            {customMessage ? (
                                                <Text style={styles.customMessageText}>{customMessage}</Text>
                                            ) : null}
                                            <View style={styles.qrWrapper}>
                                                <QRCode
                                                    value={qrValue}
                                                    size={220}
                                                    backgroundColor="white"
                                                    color="black"
                                                    getRef={(ref) => (qrRef.current = ref)}
                                                />
                                            </View>
                                        </View>

                                        <LinearGradient
                                            colors={['#667EEA', '#764BA2']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.qrLabelGradient}
                                        >
                                            <MaterialCommunityIcons name="check-circle" size={20} color="#FFF" />
                                            <Text style={styles.qrLabel}>QR Code Ready!</Text>
                                        </LinearGradient>

                                        <TouchableOpacity
                                            onPress={downloadQRCode}
                                            activeOpacity={0.9}
                                            style={{ width: '100%' }}
                                        >
                                            <LinearGradient
                                                colors={['#F093FB', '#F5576C']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                                style={styles.shareButton}
                                            >
                                                <MaterialCommunityIcons name="share-variant" size={22} color="#FFF" />
                                                <Text style={styles.shareButtonText}>Share QR Image</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.placeholderContainer}>
                                    <View style={styles.placeholderGlow}>
                                        <MaterialCommunityIcons name="qrcode-edit" size={100} color="#667EEA" />
                                    </View>
                                    <Text style={styles.placeholderText}>Your generated QR will appear here</Text>
                                    <Text style={styles.placeholderSubtext}>Enter content above to create</Text>
                                </View>
                            )}

                            <View style={{ height: 40 }} />
                        </ScrollView>
                    </View>
                </TouchableWithoutFeedback>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 10,
    },
    titleGradient: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 20,
        marginBottom: 12,
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
    subtitle: {
        fontSize: 15,
        color: '#B8B8D1',
        letterSpacing: 0.8,
        fontWeight: '500',
    },
    card: {
        width: '100%',
        borderRadius: 24,
        marginBottom: 24,
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
        padding: 24,
    },
    inputContainer: {
        marginBottom: 20,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: '#B8B8D1',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    pasteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        gap: 6,
    },
    pasteText: {
        color: '#667EEA',
        fontSize: 12,
        fontWeight: '700',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        paddingHorizontal: 16,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '500',
        paddingVertical: 12,
    },
    inputSingle: {
        flex: 1,
        height: 54,
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    clearButton: {
        padding: 8,
        marginTop: 4,
    },
    generateButton: {
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
        marginTop: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    resultCard: {
        width: '100%',
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 24,
    },
    qrCaptureContainer: {
        padding: 28,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    qrWrapper: {
        padding: 12,
        backgroundColor: '#FFF',
        borderRadius: 16,
        shadowColor: '#667EEA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    customMessageText: {
        marginBottom: 16,
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A2E',
        textAlign: 'center',
        letterSpacing: 0.3,
    },
    qrLabelGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginVertical: 20,
    },
    qrLabel: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    shareButton: {
        flexDirection: 'row',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        shadowColor: '#F093FB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    shareButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    placeholderContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    placeholderGlow: {
        padding: 30,
        borderRadius: 100,
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        marginBottom: 24,
    },
    placeholderText: {
        marginTop: 16,
        fontSize: 17,
        color: '#B8B8D1',
        fontWeight: '600',
        textAlign: 'center',
        letterSpacing: 0.3,
    },
    placeholderSubtext: {
        marginTop: 8,
        fontSize: 14,
        color: '#8E8EA0',
        fontWeight: '500',
        textAlign: 'center',
    },
});

export default Generator;