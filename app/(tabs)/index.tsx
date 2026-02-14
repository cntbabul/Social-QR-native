import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';


import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { Alert, Keyboard, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Common country codes
const COUNTRY_CODES = [
    { label: "India (+91)", value: "91" },
    { label: "USA/Canada (+1)", value: "1" },
    { label: "UK (+44)", value: "44" },
    { label: "Australia (+61)", value: "61" },
    { label: "UAE (+971)", value: "971" },
    { label: "Germany (+49)", value: "49" },
    { label: "France (+33)", value: "33" },
    { label: "Japan (+81)", value: "81" },
    { label: "China (+86)", value: "86" },
];



export default function SocialScreen() {
    const [socialMode, setSocialMode] = useState<'whatsapp' | 'email' | 'instagram' | 'twitter' | 'linkedin' | 'github' | 'facebook' | 'business'>('whatsapp');

    // Standard Modes State
    const [countryCode, setCountryCode] = useState("91");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [emailAddress, setEmailAddress] = useState("");
    const [emailSubject, setEmailSubject] = useState("");
    const [emailBody, setEmailBody] = useState("");
    const [instagramUsername, setInstagramUsername] = useState("");
    const [twitterHandle, setTwitterHandle] = useState("");
    const [linkedinProfile, setLinkedinProfile] = useState("");
    const [githubUsername, setGithubUsername] = useState("");
    const [facebookProfile, setFacebookProfile] = useState("");
    const [customMessage, setCustomMessage] = useState("");

    // ...



    const [qrValue, setQrValue] = useState("");
    const qrRef = useRef<any>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    // const [permissionResponse, requestPermission] = MediaLibrary.usePermissions(); // Removed hook to avoid init errors

    const handleGenerate = () => {
        if (socialMode === 'whatsapp') {
            if (!phoneNumber.trim()) {
                Alert.alert("Phone Number Required", "Please enter a valid phone number.");
                return;
            }
            const cleanPhone = phoneNumber.replace(/^0+|^\+|[^0-9]/g, '');
            const link = `https://wa.me/${countryCode}${cleanPhone}`;
            setQrValue(link);


        } else if (socialMode === 'instagram') {
            if (!instagramUsername.trim()) {
                Alert.alert("Username Required", "Please enter a valid Instagram username.");
                return;
            }
            const cleanUsername = instagramUsername.trim().replace('@', '');
            const link = `https://instagram.com/${cleanUsername}`;
            setQrValue(link);
        } else if (socialMode === 'twitter') {
            if (!twitterHandle.trim()) {
                Alert.alert("Handle Required", "Please enter a valid Twitter/X handle.");
                return;
            }
            const cleanHandle = twitterHandle.trim().replace('@', '');
            const link = `https://twitter.com/${cleanHandle}`;
            setQrValue(link);
        } else if (socialMode === 'linkedin') {
            if (!linkedinProfile.trim()) {
                Alert.alert("Profile Required", "Please enter a valid LinkedIn profile ID.");
                return;
            }
            // Assume user enters just the ID part or full URL, basic cleanup
            const cleanProfile = linkedinProfile.trim().replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '').replace(/\/$/, '');
            const link = `https://linkedin.com/in/${cleanProfile}`;
            setQrValue(link);
        } else if (socialMode === 'github') {
            if (!githubUsername.trim()) {
                Alert.alert("Username Required", "Please enter a valid GitHub username.");
                return;
            }
            const cleanUsername = githubUsername.trim();
            const link = `https://github.com/${cleanUsername}`;
            setQrValue(link);
        } else if (socialMode === 'facebook') {
            if (!facebookProfile.trim()) {
                Alert.alert("Profile Required", "Please enter a valid Facebook page/profile ID.");
                return;
            }
            const cleanProfile = facebookProfile.trim().replace(/^https?:\/\/(www\.)?facebook\.com\//, '').replace(/\/$/, '');
            const link = `https://facebook.com/${cleanProfile}`;
            setQrValue(link);
        } else {
            if (!emailAddress.trim()) {
                Alert.alert("Email Required", "Please enter a valid email address.");
                return;
            }

            let link = `mailto:${emailAddress}`;
            const params = [];
            if (emailSubject) params.push(`subject=${encodeURIComponent(emailSubject)}`);
            if (emailBody) params.push(`body=${encodeURIComponent(emailBody)}`);

            if (params.length > 0) {
                link += `?${params.join('&')}`;
            }

            setQrValue(link);
        }
        Keyboard.dismiss();

        // Auto-scroll to the bottom where QR code appears
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const captureViewRef = useRef<View>(null);

    const downloadQRCode = async () => {
        try {
            const uri = await captureRef(captureViewRef, {
                format: "png",
                quality: 1,
            });

            const directory = FileSystem.documentDirectory || FileSystem.cacheDirectory;
            const filename = directory + "social_qrcode_with_number.png";

            await FileSystem.copyAsync({
                from: uri,
                to: filename
            });

            Sharing.shareAsync(filename).catch(err => {
                Alert.alert("Error", "Sharing failed: " + err.message);
            });
        } catch (error: any) {
            Alert.alert("Error", "Failed to share image: " + error.message);
        }
    };

    const saveToGallery = async () => {
        try {
            // Request write-only permission to avoid unnecessary read permissions (like AUDIO on some devices)
            const permission = await MediaLibrary.requestPermissionsAsync(true);

            if (!permission.granted) {
                Alert.alert("Permission Required", "Please grant permission to save images to your gallery in settings.");
                return;
            }

            const uri = await captureRef(captureViewRef, {
                format: "png",
                quality: 1,
            });

            // Ensure file has valid extension for Android MediaScanner
            const fileUri = FileSystem.cacheDirectory + "social_qr_code.png";
            await FileSystem.copyAsync({
                from: uri,
                to: fileUri
            });

            const asset = await MediaLibrary.createAssetAsync(fileUri);

            // Explicitly creating an album is optional but good for organization.
            try {
                await MediaLibrary.createAlbumAsync("SocialQR", asset, false);
            } catch (e) {
                console.log("Album creation error", e);
            }

            Alert.alert("Success", "QR Code saved to Gallery!");
        } catch (error: any) {
            // Specific error handling for the "AUDIO permission" issue which means native build is stale
            if (error.message && error.message.includes("AUDIO")) {
                Alert.alert(
                    "Configuration Error",
                    "Your app needs to be rebuilt to support saving. Please run your build command again.",
                    [
                        { text: "OK" },
                        { text: "Share Instead", onPress: () => downloadQRCode() }
                    ]
                );
            } else {
                Alert.alert("Save Error", error.message || "Unknown error occurred");
            }
        }
    };

    const getSubtitle = () => {
        switch (socialMode) {
            case 'whatsapp': return "Direct Message via WhatsApp";
            case 'instagram': return "Link to Instagram Profile";
            case 'twitter': return "Link to X (Twitter) Profile";
            case 'linkedin': return "Link to LinkedIn Profile";
            case 'github': return "Link to GitHub Profile";
            case 'facebook': return "Link to Facebook Profile";
            case 'email': return "Compose Email via QR";

            default: return "Social QR";
        }
    };

    const getButtonColor = () => {
        switch (socialMode) {
            case 'whatsapp': return '#25D366';
            case 'instagram': return '#C13584';
            case 'twitter': return '#1DA1F2';
            case 'linkedin': return '#0077B5';
            case 'github': return '#333';
            case 'facebook': return '#1877F2';
            case 'email': return '#EA4335';

            default: return '#4A90E2';
        }
    };

    const getButtonIcon = () => {
        switch (socialMode) {
            case 'whatsapp': return 'whatsapp';
            case 'instagram': return 'instagram';
            case 'twitter': return 'twitter';
            case 'linkedin': return 'linkedin';
            case 'github': return 'github';
            case 'facebook': return 'facebook';
            case 'email': return 'email-plus';

            default: return 'qrcode';
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
                <ScrollView
                    ref={scrollViewRef}
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header with Gradient Text Effect */}
                    <View style={styles.headerContainer}>
                        <LinearGradient
                            colors={['#667EEA', '#764BA2', '#F093FB']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.titleGradient}
                        >
                            <Text style={styles.title}>Social QR Generator</Text>
                        </LinearGradient>
                        <Text style={styles.subtitle}>{getSubtitle()}</Text>
                    </View>

                    {/* Mode Selector with Glassmorphism */}
                    <View style={styles.modeSelectorContainer}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.modeSelectorScroll}
                        >
                            {[
                                { id: 'whatsapp', icon: 'whatsapp', label: 'WhatsApp', gradient: ['#25D366', '#128C7E'] as const },
                                { id: 'instagram', icon: 'instagram', label: 'Instagram', gradient: ['#F58529', '#DD2A7B', '#8134AF'] as const },
                                { id: 'twitter', icon: 'twitter', label: 'Twitter/X', gradient: ['#1DA1F2', '#0E71C8'] as const },
                                { id: 'linkedin', icon: 'linkedin', label: 'LinkedIn', gradient: ['#0077B5', '#005885'] as const },
                                { id: 'github', icon: 'github', label: 'GitHub', gradient: ['#333', '#24292E'] as const },
                                { id: 'facebook', icon: 'facebook', label: 'Facebook', gradient: ['#1877F2', '#0C63D4'] as const },
                                { id: 'email', icon: 'email', label: 'Email', gradient: ['#EA4335', '#C5221F'] as const },
                            ].map((mode) => (
                                <TouchableOpacity
                                    key={mode.id}
                                    activeOpacity={0.8}
                                    onPress={() => { setSocialMode(mode.id as any); setQrValue(""); }}
                                >
                                    {socialMode === mode.id ? (
                                        <LinearGradient
                                            colors={mode.gradient}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={styles.modeButtonActive}
                                        >
                                            <MaterialCommunityIcons
                                                name={mode.icon as any}
                                                size={22}
                                                color="#FFF"
                                            />
                                            <Text style={styles.modeTextActive}>
                                                {mode.label}
                                            </Text>
                                        </LinearGradient>
                                    ) : (
                                        <View style={styles.modeButton}>
                                            <MaterialCommunityIcons
                                                name={mode.icon as any}
                                                size={22}
                                                color="#A0A0A0"
                                            />
                                            <Text style={styles.modeText}>
                                                {mode.label}
                                            </Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Glassmorphic Input Card */}
                    <View style={styles.card}>
                        <View style={styles.cardGlass} />
                        <View style={styles.cardContent}>
                            {socialMode === 'whatsapp' ? (
                                <>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>
                                            <MaterialCommunityIcons name="earth" size={14} color="#A0A0FF" /> COUNTRY CODE
                                        </Text>
                                        <View style={styles.pickerWrapper}>
                                            <Picker
                                                selectedValue={countryCode}
                                                onValueChange={(itemValue) => setCountryCode(itemValue)}
                                                style={styles.picker}
                                                dropdownIconColor="#FFF"
                                                itemStyle={{ color: '#FFF' }}
                                                mode="dropdown"
                                            >
                                                {COUNTRY_CODES.map((code) => (
                                                    <Picker.Item key={code.value} label={code.label} value={code.value} color="#000" />
                                                ))}
                                            </Picker>
                                        </View>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>
                                            <MaterialCommunityIcons name="phone" size={14} color="#A0A0FF" /> PHONE NUMBER
                                        </Text>
                                        <View style={styles.inputWrapper}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Enter phone number"
                                                placeholderTextColor="#888"
                                                value={phoneNumber}
                                                onChangeText={setPhoneNumber}
                                                keyboardType="phone-pad"
                                            />
                                            {phoneNumber.length > 0 && (
                                                <TouchableOpacity onPress={() => setPhoneNumber('')} style={styles.clearButton}>
                                                    <MaterialCommunityIcons name="close-circle" size={20} color="#888" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                </>

                            ) : socialMode === 'instagram' ? (
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>
                                        <MaterialCommunityIcons name="instagram" size={14} color="#F093FB" /> INSTAGRAM USERNAME
                                    </Text>
                                    <View style={styles.inputWrapper}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="@username"
                                            placeholderTextColor="#888"
                                            value={instagramUsername}
                                            onChangeText={setInstagramUsername}
                                            autoCapitalize="none"
                                        />
                                    </View>
                                </View>
                            ) : socialMode === 'twitter' ? (
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>
                                        <MaterialCommunityIcons name="twitter" size={14} color="#1DA1F2" /> TWITTER/X HANDLE
                                    </Text>
                                    <View style={styles.inputWrapper}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="@handle"
                                            placeholderTextColor="#888"
                                            value={twitterHandle}
                                            onChangeText={setTwitterHandle}
                                            autoCapitalize="none"
                                        />
                                    </View>
                                </View>
                            ) : socialMode === 'linkedin' ? (
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>
                                        <MaterialCommunityIcons name="linkedin" size={14} color="#0077B5" /> LINKEDIN PROFILE ID
                                    </Text>
                                    <View style={styles.inputWrapper}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="e.g. john-doe-123"
                                            placeholderTextColor="#888"
                                            value={linkedinProfile}
                                            onChangeText={setLinkedinProfile}
                                            autoCapitalize="none"
                                        />
                                    </View>
                                </View>
                            ) : socialMode === 'github' ? (
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>
                                        <MaterialCommunityIcons name="github" size={14} color="#FFF" /> GITHUB USERNAME
                                    </Text>
                                    <View style={styles.inputWrapper}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="username"
                                            placeholderTextColor="#888"
                                            value={githubUsername}
                                            onChangeText={setGithubUsername}
                                            autoCapitalize="none"
                                        />
                                    </View>
                                </View>
                            ) : socialMode === 'facebook' ? (
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>
                                        <MaterialCommunityIcons name="facebook" size={14} color="#1877F2" /> FACEBOOK PROFILE ID/NAME
                                    </Text>
                                    <View style={styles.inputWrapper}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="username or id"
                                            placeholderTextColor="#888"
                                            value={facebookProfile}
                                            onChangeText={setFacebookProfile}
                                            autoCapitalize="none"
                                        />
                                    </View>
                                </View>
                            ) : (
                                <>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>
                                            <MaterialCommunityIcons name="email" size={14} color="#EA4335" /> EMAIL ADDRESS
                                        </Text>
                                        <View style={styles.inputWrapper}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="name@example.com"
                                                placeholderTextColor="#888"
                                                value={emailAddress}
                                                onChangeText={setEmailAddress}
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                            />
                                            {emailAddress.length > 0 && (
                                                <TouchableOpacity onPress={() => setEmailAddress('')} style={styles.clearButton}>
                                                    <MaterialCommunityIcons name="close-circle" size={20} color="#888" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>
                                            <MaterialCommunityIcons name="format-title" size={14} color="#A0A0FF" /> SUBJECT (OPTIONAL)
                                        </Text>
                                        <View style={styles.inputWrapper}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Enter subject"
                                                placeholderTextColor="#888"
                                                value={emailSubject}
                                                onChangeText={setEmailSubject}
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>
                                            <MaterialCommunityIcons name="text" size={14} color="#A0A0FF" /> BODY (OPTIONAL)
                                        </Text>
                                        <View style={[styles.inputWrapper, { height: 100, alignItems: 'flex-start' }]}>
                                            <TextInput
                                                style={[styles.input, { height: 100, textAlignVertical: 'top', paddingTop: 12 }]}
                                                placeholder="Enter email content..."
                                                placeholderTextColor="#888"
                                                value={emailBody}
                                                onChangeText={setEmailBody}
                                                multiline
                                            />
                                        </View>
                                    </View>
                                </>
                            )}

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    <MaterialCommunityIcons name="message-text" size={14} color="#F093FB" /> CUSTOM MESSAGE (OPTIONAL)
                                </Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter custom message..."
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
                                    colors={
                                        socialMode === 'whatsapp' ? ['#25D366', '#128C7E'] :
                                            socialMode === 'instagram' ? ['#F58529', '#DD2A7B', '#8134AF'] :
                                                socialMode === 'twitter' ? ['#1DA1F2', '#0E71C8'] :
                                                    socialMode === 'linkedin' ? ['#0077B5', '#005885'] :
                                                        socialMode === 'github' ? ['#333', '#24292E'] :
                                                            socialMode === 'facebook' ? ['#1877F2', '#0C63D4'] :
                                                                ['#EA4335', '#C5221F']
                                    }
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.generateButton}
                                >
                                    <MaterialCommunityIcons
                                        name={getButtonIcon() as any}
                                        size={24}
                                        color="#FFF"
                                    />
                                    <Text style={styles.buttonText}>
                                        Generate {socialMode.charAt(0).toUpperCase() + socialMode.slice(1)} QR
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* QR Code Result with Premium Styling */}
                    {qrValue ? (
                        <View style={styles.resultCard}>
                            <View style={styles.cardGlass} />
                            <View style={styles.cardContent}>
                                <View
                                    ref={captureViewRef}
                                    style={styles.qrCaptureContainer}
                                    collapsable={false}
                                >
                                    {customMessage ? (
                                        <Text style={styles.customMessageText}>{customMessage}</Text>
                                    ) : null}
                                    <View style={styles.qrWrapper}>
                                        <QRCode
                                            value={qrValue}
                                            size={200}
                                            backgroundColor="white"
                                            color="black"
                                            getRef={(ref) => (qrRef.current = ref)}
                                        />
                                    </View>
                                    <Text style={styles.captureText}>
                                        {socialMode === 'whatsapp' ? `WhatsApp: +${countryCode} ${phoneNumber}` :
                                            socialMode === 'instagram' ? `IG: @${instagramUsername.replace('@', '')}` :
                                                socialMode === 'twitter' ? `X: @${twitterHandle.replace('@', '')}` :
                                                    socialMode === 'linkedin' ? `LinkedIn: ${linkedinProfile}` :
                                                        socialMode === 'github' ? `GitHub: ${githubUsername}` :
                                                            socialMode === 'facebook' ? `FB: ${facebookProfile}` :
                                                                `Email: ${emailAddress}`}
                                    </Text>
                                </View>

                                <LinearGradient
                                    colors={['#667EEA', '#764BA2']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.qrLabelGradient}
                                >
                                    <MaterialCommunityIcons name="check-circle" size={20} color="#FFF" />
                                    <Text style={styles.qrLabel}>Ready to Share</Text>
                                </LinearGradient>

                                <View style={styles.actionButtonsContainer}>
                                    <TouchableOpacity onPress={downloadQRCode} activeOpacity={0.9} style={{ flex: 1 }}>
                                        <LinearGradient
                                            colors={['#667EEA', '#764BA2']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={styles.actionButton}
                                        >
                                            <MaterialCommunityIcons name="share-variant" size={22} color="#FFF" />
                                            <Text style={styles.buttonText}>Share</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={saveToGallery} activeOpacity={0.9} style={{ flex: 1 }}>
                                        <LinearGradient
                                            colors={['#F093FB', '#F5576C']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={styles.actionButton}
                                        >
                                            <MaterialCommunityIcons name="download" size={22} color="#FFF" />
                                            <Text style={styles.buttonText}>Save</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.placeholderContainer}>
                            <View style={styles.placeholderGlow}>
                                <MaterialCommunityIcons name="qrcode-scan" size={100} color="#667EEA" />
                            </View>
                            <Text style={styles.placeholderText}>Enter details above to generate your QR code</Text>
                            <Text style={styles.placeholderSubtext}>Share your social profiles instantly</Text>
                        </View>
                    )}
                </ScrollView>
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
    modeSelectorContainer: {
        marginBottom: 24,
    },
    modeSelectorScroll: {
        gap: 12,
        paddingHorizontal: 4,
    },
    modeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 16,
        gap: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    modeButtonActive: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 16,
        gap: 8,
        shadowColor: '#667EEA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    modeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#A0A0A0',
    },
    modeTextActive: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
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
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: '#B8B8D1',
        marginBottom: 10,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    pickerWrapper: {
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
    },
    picker: {
        height: 54,
        width: '100%',
        color: '#FFFFFF',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        paddingHorizontal: 16,
    },
    input: {
        flex: 1,
        height: 54,
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    clearButton: {
        padding: 8,
    },
    generateButton: {
        width: '100%',
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
        fontSize: 16,
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
    captureText: {
        marginTop: 18,
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A2E',
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
    actionButtonsContainer: {
        flexDirection: 'row',
        gap: 14,
        width: '100%',
    },
    actionButton: {
        flexDirection: 'row',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        shadowColor: '#667EEA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    customMessageText: {
        marginBottom: 16,
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A2E',
        textAlign: 'center',
        letterSpacing: 0.3,
    },
});

