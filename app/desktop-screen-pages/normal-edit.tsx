import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    TextInput,
    Dimensions,
    Platform,
    ScrollView,
    Alert,
    Modal,
    FlatList
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ViewShot from 'react-native-view-shot';
import { TEMPLATES, RenderBottomBar } from '../../components/posteredit/BottomBarTemplates';

const { width } = Dimensions.get('window');
const SP_RED = '#E30512';

import DesktopHeader from '../../components/DesktopHeader';

const STEPS = [
    { key: 'name', label: 'Your Name', placeholder: 'Enter your full name', icon: 'account' },
    { key: 'designation', label: 'Designation', placeholder: 'e.g. District President', icon: 'badge-account-horizontal' },
    { key: 'mobile', label: 'Mobile Number', placeholder: 'Enter 10-digit number', icon: 'phone', keyboardType: 'phone-pad' },
    { key: 'social', label: 'Social Handle', placeholder: '@username', icon: 'at' },
    { key: 'address', label: 'Address', placeholder: 'Enter your address', icon: 'map-marker' },
    { key: 'photo', label: 'Profile Photo', placeholder: 'Select your photo', icon: 'camera' },
];

export default function DesktopNormalEdit() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { id, imageUrl, title } = params;

    const [details, setDetails] = useState({
        name: '',
        designation: '',
        mobile: '',
        social: '',
        address: '',
        photo: null as string | null,
    });
    const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].id);
    const [imageAspectRatio, setImageAspectRatio] = useState(4 / 5);
    const viewShotRef = useRef<any>(null);
    const posterRef = useRef<any>(null); // For web DOM access
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (imageUrl) {
            Image.getSize(imageUrl as string, (w, h) => {
                setImageAspectRatio(w / h);
            }, (error) => {
                console.error('Failed to get image size', error);
            });
        }
    }, [imageUrl]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setDetails(prev => ({ ...prev, photo: result.assets[0].uri }));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (Platform.OS === 'web') {
                // For web: Create proper PDF with image and bottom bar content
                const { jsPDF } = await import('jspdf');

                // Get template colors
                const getTemplateColors = () => {
                    switch (selectedTemplate) {
                        case 'modern_curve': return { bg: '#0ea5e9', text: '#ffffff', accent: '#e0f2fe' };
                        case 'bold_strip': return { bg: '#1e3a8a', text: '#ffffff', accent: '#fbbf24' };
                        case 'minimal_white': return { bg: '#ffffff', text: '#333333', accent: '#666666' };
                        case 'red_accent': return { bg: '#E30512', text: '#ffffff', accent: '#ffffff' };
                        case 'yellow_theme': return { bg: '#FFD700', text: '#000000', accent: '#000000' };
                        default: return { bg: '#ffffff', text: '#0f172a', accent: '#E30512' };
                    }
                };

                const templateColors = getTemplateColors();
                const templateName = TEMPLATES.find(t => t.id === selectedTemplate)?.name || 'Default';

                // Create PDF (A4 size in portrait)
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                const pageWidth = pdf.internal.pageSize.getWidth();
                const margin = 10;

                // Add poster image at the top
                if (imageUrl) {
                    try {
                        // Load image and add to PDF
                        const img = new window.Image();
                        img.crossOrigin = 'anonymous';

                        await new Promise((resolve, reject) => {
                            img.onload = resolve;
                            img.onerror = reject;
                            img.src = imageUrl as string;
                        });

                        // Calculate image dimensions to fit page width
                        const imgAspect = img.width / img.height;
                        const imgWidth = pageWidth - (margin * 2);
                        const imgHeight = imgWidth / imgAspect;

                        pdf.addImage(img, 'JPEG', margin, margin, imgWidth, imgHeight);

                        // Position for bottom bar below image
                        let yPos = margin + imgHeight;

                        // Draw bottom bar background based on template
                        const barHeight = 35;

                        // Parse color to RGB
                        const hexToRgb = (hex: string) => {
                            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                            return result ? {
                                r: parseInt(result[1], 16),
                                g: parseInt(result[2], 16),
                                b: parseInt(result[3], 16)
                            } : { r: 255, g: 255, b: 255 };
                        };

                        const bgColor = hexToRgb(templateColors.bg);
                        const textColor = hexToRgb(templateColors.text);
                        const accentColor = hexToRgb(templateColors.accent);

                        // Draw background rect for bottom bar
                        pdf.setFillColor(bgColor.r, bgColor.g, bgColor.b);
                        pdf.rect(margin, yPos, imgWidth, barHeight, 'F');

                        // Add accent strip for some templates
                        if (selectedTemplate === 'default') {
                            pdf.setFillColor(0, 153, 51); // SP Green
                            pdf.rect(margin, yPos + barHeight - 3, imgWidth, 3, 'F');
                        } else if (selectedTemplate === 'red_accent') {
                            pdf.setFillColor(227, 5, 18); // SP Red
                            pdf.rect(margin, yPos, imgWidth, 2, 'F');
                        } else if (selectedTemplate === 'yellow_theme') {
                            pdf.setFillColor(0, 0, 0);
                            pdf.rect(margin, yPos + barHeight - 8, imgWidth, 8, 'F');
                        }

                        // Add profile photo circle indicator
                        const photoX = margin + 8;
                        const photoY = yPos + 8;
                        pdf.setDrawColor(accentColor.r, accentColor.g, accentColor.b);
                        pdf.setLineWidth(0.5);
                        pdf.setFillColor(200, 200, 200);
                        pdf.circle(photoX + 8, photoY + 8, 8, 'FD');

                        // Add name
                        pdf.setFontSize(14);
                        pdf.setTextColor(textColor.r, textColor.g, textColor.b);
                        pdf.setFont('helvetica', 'bold');
                        pdf.text(details.name || 'Your Name', margin + 30, yPos + 12);

                        // Add designation
                        pdf.setFontSize(10);
                        pdf.setTextColor(accentColor.r, accentColor.g, accentColor.b);
                        pdf.setFont('helvetica', 'normal');
                        pdf.text(details.designation || 'Designation', margin + 30, yPos + 18);

                        // Add contact info on right side
                        const rightX = pageWidth - margin - 5;
                        pdf.setFontSize(9);
                        pdf.setTextColor(textColor.r, textColor.g, textColor.b);

                        if (details.mobile) {
                            pdf.text(details.mobile, rightX, yPos + 10, { align: 'right' });
                        }
                        if (details.social) {
                            pdf.text(details.social, rightX, yPos + 16, { align: 'right' });
                        }
                        if (details.address) {
                            const shortAddr = details.address.length > 35 ? details.address.substring(0, 35) + '...' : details.address;
                            pdf.text(shortAddr, rightX, yPos + 22, { align: 'right' });
                        }

                        // Add template name footer
                        yPos += barHeight + 5;
                        pdf.setFontSize(8);
                        pdf.setTextColor(150, 150, 150);
                        pdf.text(`Template: ${templateName} | Generated from Samajwadi Party App`, pageWidth / 2, yPos, { align: 'center' });

                    } catch (imgError) {
                        console.error('Image load error:', imgError);
                        pdf.setFontSize(14);
                        pdf.text('Poster could not be loaded', margin, 20);
                    }
                }

                // Download PDF
                pdf.save(`poster-${title || 'custom'}-${Date.now()}.pdf`);
                Alert.alert('Success', 'PDF downloaded successfully!');
            } else {
                // For mobile: Use ViewShot
                if (!viewShotRef.current) return;
                const uri = await viewShotRef.current.capture({
                    format: 'png',
                    quality: 1,
                });
                const { shareAsync } = await import('expo-sharing');
                await shareAsync(uri, {
                    mimeType: 'image/png',
                    dialogTitle: 'Save or Share Poster'
                });
            }
        } catch (error) {
            console.error('Save error:', error);
            Alert.alert('Error', 'Failed to save poster. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <DesktopHeader />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#1e293b" />
                    <Text style={styles.backText}>Back to Posters</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Normal Edit</Text>
                <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                    <MaterialCommunityIcons name={Platform.OS === 'web' ? 'file-pdf-box' : 'download'} size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>
                        {saving ? 'Generating...' : (Platform.OS === 'web' ? 'Download PDF' : 'Share')}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.content}>
                    {/* Left: Preview */}
                    <View style={styles.previewSection}>
                        <View style={styles.previewCard}>
                            <View ref={posterRef} style={styles.posterContainer}>
                                <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }} style={{ width: '100%' }}>
                                    <Image
                                        source={{ uri: imageUrl as string }}
                                        style={[styles.posterImage, { aspectRatio: imageAspectRatio }]}
                                        resizeMode="cover"
                                    />
                                    <View style={{ width: '100%' }}>
                                        <RenderBottomBar
                                            template={selectedTemplate}
                                            details={details}
                                            width={500} // Fixed width for desktop preview
                                        />
                                    </View>
                                </ViewShot>
                            </View>
                        </View>
                    </View>

                    {/* Right: Form */}
                    <View style={styles.formSection}>
                        <View style={styles.formCard}>
                            <Text style={styles.sectionTitle}>Enter Details</Text>

                            {STEPS.map((step) => (
                                <View key={step.key} style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>{step.label}</Text>
                                    {step.key === 'photo' ? (
                                        <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                                            {details.photo ? (
                                                <Image source={{ uri: details.photo }} style={styles.photoPreview} />
                                            ) : (
                                                <View style={styles.photoPlaceholder}>
                                                    <MaterialCommunityIcons name="camera-plus" size={32} color="#94a3b8" />
                                                    <Text style={styles.photoPlaceholderText}>Upload Photo</Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    ) : (
                                        <View style={styles.inputWrapper}>
                                            <MaterialCommunityIcons name={step.icon as any} size={20} color="#64748b" style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder={step.placeholder}
                                                value={(details as any)[step.key]}
                                                onChangeText={(text) => setDetails(prev => ({ ...prev, [step.key]: text }))}
                                            />
                                        </View>
                                    )}
                                </View>
                            ))}

                            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Select Frame Style</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.framesScroll}>
                                {TEMPLATES.map((template) => (
                                    <TouchableOpacity
                                        key={template.id}
                                        style={[
                                            styles.frameOption,
                                            selectedTemplate === template.id && styles.selectedFrame
                                        ]}
                                        onPress={() => setSelectedTemplate(template.id)}
                                    >
                                        <Text style={[
                                            styles.frameName,
                                            selectedTemplate === template.id && styles.selectedFrameText
                                        ]}>{template.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        height: 70,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 32,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    backText: {
        fontSize: 16,
        color: '#1e293b',
        fontWeight: '500',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: SP_RED,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        gap: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        padding: 32,
        gap: 32,
        maxWidth: 1400,
        alignSelf: 'center',
        width: '100%',
    },
    previewSection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    previewCard: {
        padding: 24,
        backgroundColor: '#fff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    posterContainer: {
        width: 500,
        backgroundColor: '#fff',
    },
    posterImage: {
        width: '100%',
        height: undefined,
    },
    formSection: {
        width: 400,
    },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748b',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 48,
        backgroundColor: '#f8fafc',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#1e293b',
        ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) as any,
    },
    photoButton: {
        height: 100,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        overflow: 'hidden',
    },
    photoPlaceholder: {
        alignItems: 'center',
        gap: 8,
    },
    photoPlaceholderText: {
        fontSize: 14,
        color: '#64748b',
    },
    photoPreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    framesScroll: {
        flexDirection: 'row',
        gap: 12,
    },
    frameOption: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        marginRight: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    selectedFrame: {
        backgroundColor: '#fee2e2',
        borderColor: SP_RED,
    },
    frameName: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    selectedFrameText: {
        color: SP_RED,
        fontWeight: '600',
    },
});
