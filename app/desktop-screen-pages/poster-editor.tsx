import React, { useState, useRef, useEffect } from 'react';
import { Asset } from 'expo-asset'; // Safe asset resolution
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Platform,
    TextInput,
    Alert,
    Modal,
    ActivityIndicator,
    PanResponder,
    Animated,
    FlatList
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { captureRef } from 'react-native-view-shot';
import { removeBackground as imglyRemoveBackground } from '../../utils/backgroundRemoval';
import { getApiUrl } from '../../utils/api';
import { TEMPLATES, RenderBottomBar } from '../../components/posteredit/BottomBarTemplates';
import FrameSelector from '../../components/posteredit/FrameSelector';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadHtml2Canvas } from '../../utils/loadHtml2Canvas';

// Image assets will be settled inside the component
// const frame1 = ...; // Removed to prevent crash

const { width, height } = Dimensions.get('window');
const SP_RED = '#E30512';
const SP_GREEN = '#009933';
const BANNER_HEIGHT = 80;
const API_URL = getApiUrl();

import DesktopHeader from '../../components/DesktopHeader';

type ToolType = 'content' | 'text' | 'image' | 'layout' | 'banner' | 'filter' | 'sticker' | 'customize';

interface EditorElement {
    id: string;
    type: 'text' | 'image' | 'sticker';
    content: string;
    x: number;
    y: number;
    scale: number;
    rotation: number;
    isFlipped: boolean;
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    letterSpacing?: number;
    lineHeight?: number;
    backgroundColor?: string;
    width?: number;
    height?: number;
}

const FONTS = ['System', 'Roboto', 'serif', 'monospace'];
const COLORS = ['#000000', '#FFFFFF', '#E30512', '#1e293b', '#2563eb', '#16a34a', '#d97706', '#dc2626'];

const FILTERS = [
    { id: 'none', name: 'Original', overlay: 'transparent' },
    { id: 'grayscale', name: 'Grayscale', overlay: 'rgba(128, 128, 128, 0.3)' },
    { id: 'sepia', name: 'Sepia', overlay: 'rgba(112, 66, 20, 0.4)' },
    { id: 'warm', name: 'Warm', overlay: 'rgba(255, 140, 0, 0.2)' },
    { id: 'cool', name: 'Cool', overlay: 'rgba(0, 100, 255, 0.2)' },
    { id: 'vintage', name: 'Vintage', overlay: 'rgba(240, 200, 140, 0.3)' },
    { id: 'dramatic', name: 'Dramatic', overlay: 'rgba(0, 0, 0, 0.3)' },
    { id: 'bright', name: 'Bright', overlay: 'rgba(255, 255, 255, 0.15)' },
];

export default function DesktopPosterEditor() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { imageUrl, title } = params;

    const canvasRef = useRef(null);
    const [elements, setElements] = useState<EditorElement[]>([]);
    const [selectedTool, setSelectedTool] = useState<ToolType | null>(null);
    const [canvasSize, setCanvasSize] = useState({ w: 600, h: 750 });

    // Selection State
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [currentImage, setCurrentImage] = useState(imageUrl as string);
    const [zoomScale, setZoomScale] = useState(1);

    // Bottom Bar Template State
    const [showBottomBarModal, setShowBottomBarModal] = useState(false);
    const [selectedBottomBarTemplate, setSelectedBottomBarTemplate] = useState(TEMPLATES[2].id);
    const [bottomBarDetails, setBottomBarDetails] = useState({
        name: '',
        designation: '',
        mobile: '',
        socialHandle: '',
        socialPlatform: 'twitter' as 'twitter' | 'facebook' | 'instagram' | 'youtube' | 'linkedin' | 'whatsapp',
        address: '',
        photo: null as string | null,
    });
    const [showBottomBarEditForm, setShowBottomBarEditForm] = useState(false);
    const [isRemovingBg, setIsRemovingBg] = useState(false);
    const [selectedSocialPlatform, setSelectedSocialPlatform] = useState<'twitter' | 'facebook' | 'instagram' | 'youtube' | 'linkedin' | 'whatsapp'>('twitter');
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);
    const previewRef = useRef(null);

    // Frame Customization State
    const [frameCustomization, setFrameCustomization] = useState({
        // Background
        backgroundType: 'gradient' as 'solid' | 'gradient',
        backgroundColor: SP_RED,
        backgroundGradient: [SP_RED, SP_GREEN],
        backgroundOpacity: 1,

        // Image
        imageSize: 100,
        imageBorderColor: '#ffffff',
        imageBorderWidth: 2,

        // Name
        nameFontSize: 15,
        nameColor: '#ffffff',
        nameBackgroundColor: 'transparent',

        // Designation
        designationFontSize: 15,
        designationColor: '#ffffff',
        designationBackgroundColor: 'transparent',

        // Mobile
        mobileFontSize: 15,
        mobileColor: '#ffffff',
        mobileBackgroundColor: 'transparent',

        // Address
        addressFontSize: 15,
        addressColor: '#ffffff',
        addressBackgroundColor: 'transparent',

        // Social
        socialFontSize: 15,
        socialColor: '#ffffff',
        socialBackgroundColor: 'transparent',

        // Custom Colors
        customColor1: '#000000',
        customColor2: '#009933',
    });

    // Image Enhancer State
    const [showEnhancerModal, setShowEnhancerModal] = useState(false);
    const [enhancements, setEnhancements] = useState({
        brightness: 100,
        contrast: 100,
        saturation: 100,
    });

    const [selectedCustomElement, setSelectedCustomElement] = useState<string | null>(null);

    // Filter State
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('none');

    // Image Processing State
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
    const [processedImageUri, setProcessedImageUri] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Posters State
    const [availablePosters, setAvailablePosters] = useState<any[]>([]);
    const [isLoadingPosters, setIsLoadingPosters] = useState(false);

    // Tools Configuration
    const tools = [
        { id: 'content', name: 'Change Content', icon: 'text-box-edit' },
        { id: 'banner', name: 'Posters', icon: 'image-multiple' },
        { id: 'text', name: 'Add Text', icon: 'format-text' },
        { id: 'image', name: 'Add Image', icon: 'image-plus' },
        { id: 'filter', name: 'Filters', icon: 'filter-variant' },
        { id: 'sticker', name: 'Frames', icon: 'sticker-emoji' },
        { id: 'customize', name: 'Customize', icon: 'palette' },
    ];

    useEffect(() => {
        if (imageUrl) {
            Image.getSize(imageUrl as string, (w, h) => {
                const aspectRatio = h / w;
                setCanvasSize({ w: 600, h: 600 * aspectRatio });
            }, (error) => {
                console.error('Error getting image size:', error);
            });
        }

        // Load html2canvas for web screenshots
        if (Platform.OS === 'web') {
            loadHtml2Canvas().catch(err => console.error('Failed to load html2canvas:', err));
        }
    }, [imageUrl]);

    // Fetch available posters
    useEffect(() => {
        fetchPosters();
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const userInfoStr = await AsyncStorage.getItem('userInfo');
            if (userInfoStr) {
                const userInfo = JSON.parse(userInfoStr);

                // Format address if it's an object
                let addressStr = 'Your Address';
                if (userInfo.address) {
                    if (typeof userInfo.address === 'string') {
                        addressStr = userInfo.address;
                    } else if (typeof userInfo.address === 'object') {
                        // Convert address object to string
                        const { street, city, state, postalCode, country } = userInfo.address;
                        const parts = [street, city, state, postalCode, country].filter(Boolean);
                        addressStr = parts.join(', ') || 'Your Address';
                    }
                }

                setBottomBarDetails({
                    name: userInfo.name || '',
                    designation: userInfo.partyRole || userInfo.designation || '',
                    mobile: userInfo.phone || '',
                    socialHandle: userInfo.twitter || userInfo.social || '',
                    socialPlatform: 'twitter',
                    address: addressStr || '',
                    photo: userInfo.profileImage || null,
                });
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const fetchPosters = async () => {
        setIsLoadingPosters(true);
        try {
            // Fetch all posters without pagination limit
            const response = await fetch(`${API_URL}/posters?limit=1000`);
            const data = await response.json();

            // Handle different response formats
            if (data.posters && Array.isArray(data.posters)) {
                setAvailablePosters(data.posters);
            } else if (Array.isArray(data)) {
                setAvailablePosters(data);
            } else if (data.success && data.data) {
                setAvailablePosters(data.data);
            } else {
                console.warn('Unexpected API response format:', data);
                setAvailablePosters([]);
            }
        } catch (error) {
            console.error('Error fetching posters:', error);
            setAvailablePosters([]);
        } finally {
            setIsLoadingPosters(false);
        }
    };

    const handlePosterSelect = (posterUrl: string) => {
        setCurrentImage(posterUrl);
        Image.getSize(posterUrl, (w, h) => {
            const aspectRatio = h / w;
            setCanvasSize({ w: 600, h: 600 * aspectRatio });
        }, (error) => {
            console.error('Error getting image size:', error);
        });
    };

    const handleZoom = (increment: boolean) => {
        setZoomScale(prev => {
            const newScale = increment ? prev + 0.1 : prev - 0.1;
            return Math.max(0.5, Math.min(newScale, 3));
        });
    };

    const handleToolPress = (toolId: string) => {
        const tool = toolId as ToolType;
        setSelectedTool(tool);
        setSelectedElementId(null);
        // Don't auto-execute, just show options in sidebar
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImageUri(result.assets[0].uri);
            setProcessedImageUri(null);
            setShowImageModal(true);
        }
    };

    const handleRemoveBackground = async () => {
        if (!selectedImageUri) return;

        setIsProcessing(true);
        try {
            if (Platform.OS === 'web') {
                const blob = await imglyRemoveBackground(selectedImageUri);
                const url = URL.createObjectURL(blob);
                setProcessedImageUri(url);
                Alert.alert('Success', 'Background removed successfully!');
            } else {
                // For native platforms
                const formData = new FormData();
                formData.append('image', {
                    uri: selectedImageUri,
                    name: 'image.jpg',
                    type: 'image/jpeg',
                } as any);

                const response = await fetch(`${API_URL}/ai-gemini/remove-background`, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                const result = await response.json();
                if (result.success) {
                    setProcessedImageUri(result.processedImageUrl);
                    Alert.alert('Success', 'Background removed successfully!');
                } else {
                    throw new Error(result.message || 'Failed to remove background');
                }
            }
        } catch (error) {
            console.error('Background removal error:', error);
            Alert.alert('Error', 'Failed to remove background');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAddImage = (useProcessed: boolean) => {
        const uri = useProcessed && processedImageUri ? processedImageUri : selectedImageUri;
        if (uri) {
            addElement('image', uri);
            setShowImageModal(false);
            setSelectedImageUri(null);
            setProcessedImageUri(null);
        }
    };

    const addElement = (type: 'text' | 'image' | 'sticker', content: string) => {
        const newElement: EditorElement = {
            id: Date.now().toString(),
            type,
            content: type === 'text' ? '' : content, // Empty for text so user can type immediately
            x: 50,
            y: 50,
            scale: 1,
            rotation: 0,
            isFlipped: false,
            color: '#000000',
            fontSize: 24,
            fontFamily: 'System'
        };
        setElements([...elements, newElement]);
        setSelectedElementId(newElement.id);
        // Auto-switch to text tool when adding text for immediate editing
        if (type === 'text') {
            setSelectedTool('text');
        }
    };

    const updateElement = (id: string, updates: Partial<EditorElement>) => {
        setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
    };

    const deleteSelectedElement = () => {
        if (selectedElementId) {
            setElements(prev => prev.filter(el => el.id !== selectedElementId));
            setSelectedElementId(null);
        }
    };


    const removeImageBackground = async (elementId: string) => {
        const element = elements.find(el => el.id === elementId);
        if (!element || element.type !== 'image') return;

        setIsRemovingBg(true);

        try {
            // Use Gemini API for background removal
            let formData = new FormData();

            // Fetch image to get blob
            const response = await fetch(element.content);
            const blob = await response.blob();
            formData.append('image', blob, 'image.jpg');

            const apiResponse = await fetch(`${API_URL}/ai-gemini/remove-background`, {
                method: 'POST',
                body: formData,
            });

            const result = await apiResponse.json();

            // Handle response
            const processedImageUrl = result.processedImageUrl || result.image || result.data?.image || result.data?.url;

            if (result.success && processedImageUrl) {
                updateElement(elementId, { content: processedImageUrl });
                Alert.alert('Success', 'Background removed successfully!');
            } else {
                throw new Error(result.message || result.error || 'Failed to remove background');
            }
        } catch (error) {
            console.error('Background removal failed:', error);
            Alert.alert('Error', 'Failed to remove background. Please try again.');
        } finally {
            setIsRemovingBg(false);
        }
    };



    const handleSave = async () => {
        try {
            setSelectedElementId(null);
            setTimeout(async () => {
                try {
                    const canvasElement = canvasRef.current as any;
                    if (!canvasElement) {
                        Alert.alert('Error', 'Canvas not found');
                        return;
                    }

                    // Use html2canvas if available (better quality)
                    if (typeof window !== 'undefined' && (window as any).html2canvas) {
                        const html2canvas = (window as any).html2canvas;
                        const canvas = await html2canvas(canvasElement, {
                            useCORS: true,
                            allowTaint: true,
                            backgroundColor: '#ffffff',
                            scale: 2, // Higher quality
                        });
                        const uri = canvas.toDataURL('image/jpeg', 0.95);

                        const link = document.createElement('a');
                        link.href = uri;
                        link.download = `poster - ${Date.now()}.jpg`;
                        link.click();
                    } else {
                        // Fallback: Simple approach for basic images
                        Alert.alert('Info', 'For best results, please refresh the page. Using fallback download method.');

                        // Try to capture just the main image
                        const imgElement = canvasElement.querySelector('img');
                        if (imgElement) {
                            const link = document.createElement('a');
                            link.href = imgElement.src;
                            link.download = `poster - ${Date.now()}.jpg`;
                            link.click();
                        } else {
                            Alert.alert('Error', 'Could not capture poster. Please try again.');
                        }
                    }
                } catch (innerError) {
                    console.error('Screenshot error:', innerError);
                    Alert.alert('Error', 'Failed to save poster');
                }
            }, 100);
        } catch (error) {
            console.error('Save error:', error);
            Alert.alert('Error', 'Failed to save poster');
        }
    };




    const handleDownloadPDF = async () => {
        try {
            setSelectedElementId(null);

            // Load jsPDF and html2canvas sequentially
            if (typeof window !== 'undefined') {
                if (!(window as any).jspdf) {
                    await new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                        script.onload = resolve;
                        script.onerror = reject;
                        document.head.appendChild(script);
                    });
                }
                if (!(window as any).html2canvas) {
                    await new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
                        script.onload = resolve;
                        script.onerror = reject;
                        document.head.appendChild(script);
                    });
                }
            }

            setTimeout(async () => {
                try {
                    // Get the element to capture (Prefer preview modal ref)
                    const elementToCapture = (previewRef.current || canvasRef.current) as unknown as HTMLElement;

                    if (!elementToCapture) {
                        Alert.alert('Error', 'Canvas not found');
                        return;
                    }

                    const html2canvas = (window as any).html2canvas;
                    const { jsPDF } = (window as any).jspdf;

                    // --- VISIBLE OVERLAY STRATEGY ---
                    // Create a dedicated container for capture
                    // We render it ON TOP of everything to guarantee the browser renders it fully
                    const captureContainer = document.createElement('div');
                    captureContainer.style.position = 'fixed';
                    captureContainer.style.top = '0';
                    captureContainer.style.left = '0';
                    captureContainer.style.width = `${canvasSize.w}px`;
                    captureContainer.style.height = `${canvasSize.h}px`;
                    captureContainer.style.zIndex = '999999'; // Ensure it's on top
                    captureContainer.style.backgroundColor = '#ffffff'; // Ensure white background
                    captureContainer.style.overflow = 'hidden';

                    // Clone the poster node strictly
                    const clone = elementToCapture.cloneNode(true) as HTMLElement;

                    // Reset clone styles to fit container perfectly
                    clone.style.transform = 'none';
                    clone.style.margin = '0';
                    clone.style.width = '100%';
                    clone.style.height = '100%';
                    clone.style.position = 'absolute';
                    clone.style.top = '0';
                    clone.style.left = '0';

                    captureContainer.appendChild(clone);
                    document.body.appendChild(captureContainer);

                    // Wait longer for DOM/Images to settle
                    await new Promise(r => setTimeout(r, 500));

                    // Capture the CONTAINER
                    const canvas = await html2canvas(captureContainer, {
                        useCORS: true,
                        allowTaint: true,
                        backgroundColor: '#ffffff',
                        scale: 3, // High Resolution
                        width: canvasSize.w,
                        height: canvasSize.h,
                        logging: false,
                        x: 0,
                        y: 0
                    });

                    // Clean up immediately
                    document.body.removeChild(captureContainer);

                    const imgData = canvas.toDataURL('image/png');
                    const imgWidth = canvasSize.w;
                    const imgHeight = canvasSize.h;

                    const pdf = new jsPDF({
                        orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
                        unit: 'px',
                        format: [imgWidth, imgHeight],
                        hotfixes: ['px_scaling']
                    });

                    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                    pdf.save(`poster-${Date.now()}.pdf`);

                    setShowPreviewModal(false);
                    Alert.alert('Success', 'Poster PDF downloaded successfully!');

                } catch (innerError) {
                    // Ensure cleanup on error
                    const existingContainer = document.querySelector('div[style*="z-index: 999999"]');
                    if (existingContainer) document.body.removeChild(existingContainer);

                    console.error('PDF generation error:', innerError);
                    Alert.alert('Error', 'Failed to generate PDF.');
                }
            }, 100);
        } catch (error) {
            console.error('PDF error:', error);
            Alert.alert('Error', 'Failed to initiate PDF download');
        }
    };

    const handleDownloadPNG = async () => {
        try {
            setSelectedElementId(null);
            setTimeout(async () => {
                try {
                    const canvasElement = canvasRef.current as any;
                    if (!canvasElement) {
                        Alert.alert('Error', 'Canvas not found');
                        return;
                    }

                    if (typeof window !== 'undefined' && (window as any).html2canvas) {
                        const html2canvas = (window as any).html2canvas;
                        const canvas = await html2canvas(canvasElement, {
                            scale: 2,
                            useCORS: true,
                            logging: false,
                            backgroundColor: null,
                        });

                        canvas.toBlob((blob: any) => {
                            if (blob) {
                                const link = document.createElement('a');
                                link.href = URL.createObjectURL(blob);
                                link.download = `poster-${Date.now()}.png`;
                                link.click();
                                setShowPreviewModal(false);
                                Alert.alert('Success', 'Poster downloaded successfully!');
                            }
                        }, 'image/png');
                    } else {
                        Alert.alert('Error', 'Screenshot library not loaded');
                    }
                } catch (error) {
                    console.error('Download error:', error);
                    Alert.alert('Error', 'Failed to download poster');
                }
            }, 100);
        } catch (error) {
            console.error('Download error:', error);
            Alert.alert('Error', 'Failed to download poster');
        }
    };

    const handleSharePoster = async () => {
        try {
            setSelectedElementId(null);
            setTimeout(async () => {
                try {
                    const canvasElement = canvasRef.current as any;
                    if (!canvasElement) {
                        Alert.alert('Error', 'Canvas not found');
                        return;
                    }

                    if (typeof window !== 'undefined' && (window as any).html2canvas) {
                        const html2canvas = (window as any).html2canvas;
                        const canvas = await html2canvas(canvasElement, {
                            scale: 2,
                            useCORS: true,
                            logging: false,
                            backgroundColor: null,
                        });

                        canvas.toBlob(async (blob: any) => {
                            if (blob) {
                                const file = new File([blob], `poster-${Date.now()}.png`, { type: 'image/png' });

                                if (navigator.share && navigator.canShare({ files: [file] })) {
                                    try {
                                        await navigator.share({
                                            files: [file],
                                            title: 'Poster',
                                            text: 'Check out my poster!',
                                        });
                                        setShowPreviewModal(false);
                                    } catch (shareError) {
                                        console.log('Share cancelled or failed:', shareError);
                                    }
                                } else {
                                    Alert.alert('Info', 'Sharing not supported. Downloading instead...');
                                    handleDownloadPNG();
                                }
                            }
                        }, 'image/png');
                    } else {
                        Alert.alert('Error', 'Screenshot library not loaded');
                    }
                } catch (error) {
                    console.error('Share error:', error);
                    Alert.alert('Error', 'Failed to share poster');
                }
            }, 100);
        } catch (error) {
            console.error('Share error:', error);
            Alert.alert('Error', 'Failed to share poster');
        }
    };


    // Draggable Item Component
    const DraggableItem = ({ element }: { element: EditorElement }) => {
        const pan = useRef(new Animated.ValueXY({ x: element.x, y: element.y })).current;
        const scale = useRef(new Animated.Value(element.scale)).current;
        const rotation = useRef(new Animated.Value(element.rotation)).current;

        useEffect(() => {
            pan.setValue({ x: element.x, y: element.y });
            scale.setValue(element.scale);
            rotation.setValue(element.rotation);
        }, [element.x, element.y, element.scale, element.rotation]);

        const [dragStartPos, setDragStartPos] = useState({ x: element.x, y: element.y });
        const [currentGesture, setCurrentGesture] = useState({ dx: 0, dy: 0 });

        const panResponder = useRef(
            PanResponder.create({
                onStartShouldSetPanResponder: () => true,
                onStartShouldSetPanResponderCapture: () => true,
                onMoveShouldSetPanResponder: () => true,
                onMoveShouldSetPanResponderCapture: () => true,
                onPanResponderTerminationRequest: () => false,
                onPanResponderGrant: () => {
                    setIsDragging(true);
                    setSelectedElementId(element.id);
                    if (element.type === 'text') {
                        setSelectedTool('text');
                    }
                    setDragStartPos({ x: element.x, y: element.y });
                    setCurrentGesture({ dx: 0, dy: 0 });
                },
                onPanResponderMove: (_, gestureState) => {
                    setCurrentGesture({ dx: gestureState.dx, dy: gestureState.dy });
                },
                onPanResponderRelease: (_, gestureState) => {
                    setIsDragging(false);
                    updateElement(element.id, {
                        x: dragStartPos.x + gestureState.dx,
                        y: dragStartPos.y + gestureState.dy
                    });
                    setCurrentGesture({ dx: 0, dy: 0 });
                }
            })
        ).current;

        const resizeResponder = useRef(
            PanResponder.create({
                onStartShouldSetPanResponder: () => true,
                onPanResponderGrant: () => setIsDragging(true),
                onPanResponderMove: (_, gestureState) => {
                    const s = Math.max(0.2, element.scale + (gestureState.dy / 200));
                    scale.setValue(s);
                },
                onPanResponderRelease: (_, gestureState) => {
                    setIsDragging(false);
                    const newScale = Math.max(0.2, element.scale + (gestureState.dy / 200));
                    updateElement(element.id, { scale: newScale });
                }
            })
        ).current;

        const isSelected = selectedElementId === element.id;

        const rotateStr = rotation.interpolate({
            inputRange: [0, 360],
            outputRange: ['0deg', '360deg']
        });

        return (
            <View
                style={{
                    position: 'absolute',
                    left: isDragging ? dragStartPos.x + currentGesture.dx : element.x,
                    top: isDragging ? dragStartPos.y + currentGesture.dy : element.y,
                }}
            >
                {element.type === 'text' ? (
                    // Text elements - direct drag without TouchableOpacity, auto-select on hover
                    <div
                        onMouseEnter={() => {
                            // Auto-select on hover for easier dragging
                            if (selectedElementId !== element.id) {
                                setSelectedElementId(element.id);
                            }
                        }}
                        onMouseDown={(e) => {
                            // Track click position to differentiate between click and drag
                            (e.currentTarget as any)._clickStart = { x: e.clientX, y: e.clientY, time: Date.now() };
                        }}
                        onMouseUp={(e) => {
                            // Only trigger edit if it was a click (not a drag)
                            const clickStart = (e.currentTarget as any)._clickStart;
                            if (clickStart) {
                                const deltaX = Math.abs(e.clientX - clickStart.x);
                                const deltaY = Math.abs(e.clientY - clickStart.y);
                                const deltaTime = Date.now() - clickStart.time;

                                // If mouse didn't move much and it was quick, it's a click
                                if (deltaX < 5 && deltaY < 5 && deltaTime < 300) {
                                    setSelectedElementId(element.id);
                                    setSelectedTool('text'); // Switch to text editing mode
                                }

                                delete (e.currentTarget as any)._clickStart;
                            }
                        }}
                        style={{
                            display: 'inline-block',
                            cursor: isDragging ? 'grabbing' : 'grab',
                        }}
                    >
                        <Animated.View
                            {...panResponder.panHandlers}
                            style={[
                                styles.element,
                                {
                                    transform: [
                                        { rotate: rotateStr },
                                        { scale: scale }
                                    ],
                                    borderColor: isSelected ? SP_RED : 'transparent',
                                    borderStyle: isSelected ? 'dashed' : 'solid',
                                    borderWidth: isSelected ? 2 : 0,
                                }
                            ]}
                        >
                            {isSelected ? (
                                // Editable TextInput when selected - NO flip transform to prevent flipped typing
                                <input
                                    type="text"
                                    autoFocus
                                    value={element.content}
                                    onChange={(e) => updateElement(element.id, { content: e.target.value })}
                                    style={{
                                        fontWeight: '700',
                                        color: element.color,
                                        fontSize: element.fontSize,
                                        fontFamily: element.fontFamily,
                                        letterSpacing: element.letterSpacing || 0,
                                        lineHeight: `${element.lineHeight || (element.fontSize || 24) * 1.2}px`,
                                        backgroundColor: element.backgroundColor || 'transparent',
                                        paddingLeft: element.backgroundColor && element.backgroundColor !== 'transparent' ? 8 : 4,
                                        paddingRight: element.backgroundColor && element.backgroundColor !== 'transparent' ? 8 : 4,
                                        paddingTop: element.backgroundColor && element.backgroundColor !== 'transparent' ? 4 : 2,
                                        paddingBottom: element.backgroundColor && element.backgroundColor !== 'transparent' ? 4 : 2,
                                        borderRadius: element.backgroundColor && element.backgroundColor !== 'transparent' ? 4 : 0,
                                        minWidth: 100,
                                        border: 'none',
                                        outline: 'none',
                                        textAlign: 'left',
                                        direction: 'ltr',
                                    }}
                                />
                            ) : (
                                // Display-only Text when not selected - apply flip transform here only
                                <View style={{ transform: [{ scaleX: element.isFlipped ? -1 : 1 }] }}>
                                    <Text
                                        selectable={false}
                                        style={[
                                            { fontWeight: '700' },
                                            {
                                                color: element.color,
                                                fontSize: element.fontSize,
                                                fontFamily: element.fontFamily,
                                                letterSpacing: element.letterSpacing || 0,
                                                lineHeight: element.lineHeight || (element.fontSize || 24) * 1.2,
                                                backgroundColor: element.backgroundColor || 'transparent',
                                                paddingHorizontal: element.backgroundColor && element.backgroundColor !== 'transparent' ? 8 : 0,
                                                paddingVertical: element.backgroundColor && element.backgroundColor !== 'transparent' ? 4 : 0,
                                                borderRadius: element.backgroundColor && element.backgroundColor !== 'transparent' ? 4 : 0,
                                                userSelect: 'none',
                                            }
                                        ]}
                                    >
                                        {element.content || 'Type here...'}
                                    </Text>
                                </View>
                            )}
                        </Animated.View>

                        {isSelected && (() => {
                            // Smart toolbar positioning based on text location
                            const isNearTop = element.y < 100;
                            const isNearBottom = element.y > canvasSize.h - 150;
                            const isNearLeft = element.x < 150;
                            const isNearRight = element.x > canvasSize.w - 150;

                            // Vertical position: below if near top, above if near bottom
                            const verticalPosition = isNearTop ? { top: '100%', marginTop: 10 } : { bottom: '100%', marginBottom: 10 };

                            // Horizontal alignment: adjust if near edges
                            let horizontalAlignment: any = { left: '50%', transform: [{ translateX: '-50%' }] };
                            if (isNearLeft) {
                                horizontalAlignment = { left: 0 };
                            } else if (isNearRight) {
                                horizontalAlignment = { right: 0 };
                            }

                            return (
                                <>
                                    {/* Top Toolbar - Canva Style with Smart Positioning */}
                                    <View style={{
                                        position: 'absolute',
                                        ...verticalPosition,
                                        ...horizontalAlignment,
                                        flexDirection: 'row',
                                        backgroundColor: '#1e293b',
                                        borderRadius: 8,
                                        padding: 4,
                                        gap: 4,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.25,
                                        shadowRadius: 4,
                                        elevation: 5,
                                        zIndex: 1000,
                                    }}>
                                        {/* Decrease Size */}
                                        <TouchableOpacity
                                            style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 6,
                                                backgroundColor: 'rgba(255,255,255,0.1)',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                updateElement(element.id, {
                                                    fontSize: Math.max(12, (element.fontSize || 24) - 4)
                                                });
                                            }}
                                        >
                                            <MaterialCommunityIcons name="format-font-size-decrease" size={20} color="#fff" />
                                        </TouchableOpacity>

                                        {/* Font Size Display */}
                                        <View style={{
                                            minWidth: 36,
                                            height: 36,
                                            borderRadius: 6,
                                            backgroundColor: 'rgba(255,255,255,0.15)',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            paddingHorizontal: 8,
                                        }}>
                                            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                                                {element.fontSize || 24}
                                            </Text>
                                        </View>

                                        {/* Increase Size */}
                                        <TouchableOpacity
                                            style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 6,
                                                backgroundColor: 'rgba(255,255,255,0.1)',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                updateElement(element.id, {
                                                    fontSize: Math.min(120, (element.fontSize || 24) + 4)
                                                });
                                            }}
                                        >
                                            <MaterialCommunityIcons name="format-font-size-increase" size={20} color="#fff" />
                                        </TouchableOpacity>

                                        {/* Separator */}
                                        <View style={{ width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.2)' }} />

                                        {/* Delete */}
                                        <TouchableOpacity
                                            style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 6,
                                                backgroundColor: 'rgba(255,255,255,0.1)',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                deleteSelectedElement();
                                            }}
                                        >
                                            <MaterialCommunityIcons name="delete" size={20} color="#fff" />
                                        </TouchableOpacity>

                                        {/* Flip Horizontal */}
                                        <TouchableOpacity
                                            style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 6,
                                                backgroundColor: element.isFlipped ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                updateElement(element.id, { isFlipped: !element.isFlipped });
                                            }}
                                        >
                                            <MaterialCommunityIcons name="flip-horizontal" size={20} color="#fff" />
                                        </TouchableOpacity>

                                        {/* Rotate Left */}
                                        <TouchableOpacity
                                            style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 6,
                                                backgroundColor: 'rgba(255,255,255,0.1)',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                const newRotation = (element.rotation - 15) % 360;
                                                updateElement(element.id, { rotation: newRotation });
                                            }}
                                        >
                                            <MaterialCommunityIcons name="rotate-left" size={20} color="#fff" />
                                        </TouchableOpacity>

                                        {/* Rotate Right */}
                                        <TouchableOpacity
                                            style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 6,
                                                backgroundColor: 'rgba(255,255,255,0.1)',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                const newRotation = (element.rotation + 15) % 360;
                                                updateElement(element.id, { rotation: newRotation });
                                            }}
                                        >
                                            <MaterialCommunityIcons name="rotate-right" size={20} color="#fff" />
                                        </TouchableOpacity>

                                        {/* Duplicate */}
                                        <TouchableOpacity
                                            style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 6,
                                                backgroundColor: 'rgba(255,255,255,0.1)',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                // Duplicate the element with offset
                                                const newElement = {
                                                    ...element,
                                                    id: Date.now().toString(),
                                                    x: element.x + 20,
                                                    y: element.y + 20,
                                                };
                                                setElements(prev => [...prev, newElement]);
                                            }}
                                        >
                                            <MaterialCommunityIcons name="content-copy" size={20} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                </>
                            );
                        })()}
                    </div>
                ) : (
                    // Image elements - hover to select with smart toolbar
                    <div
                        onMouseEnter={() => {
                            // Auto-select on hover
                            if (selectedElementId !== element.id) {
                                setSelectedElementId(element.id);
                            }
                        }}
                        onMouseDown={(e) => {
                            // Track click position to differentiate between click and drag
                            (e.currentTarget as any)._clickStart = { x: e.clientX, y: e.clientY, time: Date.now() };
                        }}
                        onMouseUp={(e) => {
                            // Only trigger action if it was a click (not a drag)
                            const clickStart = (e.currentTarget as any)._clickStart;
                            if (clickStart) {
                                const deltaX = Math.abs(e.clientX - clickStart.x);
                                const deltaY = Math.abs(e.clientY - clickStart.y);
                                const deltaTime = Date.now() - clickStart.time;

                                // If mouse didn't move much and it was quick, it's a click
                                if (deltaX < 5 && deltaY < 5 && deltaTime < 300) {
                                    setSelectedElementId(element.id);
                                }

                                delete (e.currentTarget as any)._clickStart;
                            }
                        }}
                        style={{
                            display: 'inline-block',
                            cursor: isDragging ? 'grabbing' : 'grab',
                        }}
                    >
                        <Animated.View
                            {...panResponder.panHandlers}
                            style={[
                                styles.element,
                                {
                                    transform: [
                                        { rotate: rotateStr },
                                        { scale: scale }
                                    ],
                                    borderColor: isSelected ? SP_RED : 'transparent',
                                    borderStyle: isSelected ? 'dashed' : 'solid',
                                    borderWidth: isSelected ? 2 : 0,
                                    width: element.width,
                                    height: element.height,
                                }
                            ]}
                        >
                            <View style={{ width: '100%', height: '100%', transform: [{ scaleX: element.isFlipped ? -1 : 1 }] }}>
                                <Image source={{ uri: element.content }} style={[styles.elementImage, { width: '100%', height: '100%' }]} resizeMode="stretch" />
                            </View>

                        </Animated.View>
                    </div>
                )
                }
            </View >
        );
    };

    const selectedElement = elements.find(el => el.id === selectedElementId);

    return (
        <View style={styles.container}>
            <DesktopHeader />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#1e293b" />
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Poster Editor</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>




                    <TouchableOpacity
                        onPress={async () => {
                            if (canvasRef.current) {
                                try {
                                    // Load libraries if needed
                                    if (typeof window !== 'undefined') {
                                        if (!(window as any).html2canvas) {
                                            await new Promise((resolve, reject) => {
                                                const script = document.createElement('script');
                                                script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
                                                script.onload = resolve;
                                                script.onerror = reject;
                                                document.head.appendChild(script);
                                            });
                                        }
                                    }

                                    const html2canvas = (window as any).html2canvas;

                                    // --- ROBUST VISIBLE OVERLAY STRATEGY ---
                                    // 1. Create a container on top of everything
                                    const captureContainer = document.createElement('div');
                                    captureContainer.style.position = 'fixed';
                                    captureContainer.style.top = '0';
                                    captureContainer.style.left = '0';
                                    captureContainer.style.width = `${canvasSize.w}px`;
                                    captureContainer.style.height = `${canvasSize.h}px`;
                                    captureContainer.style.zIndex = '9999999';
                                    captureContainer.style.backgroundColor = '#ffffff';
                                    captureContainer.style.overflow = 'hidden';

                                    // 2. Clone the editor canvas
                                    const originalCanvas = canvasRef.current as unknown as HTMLElement;
                                    const clone = originalCanvas.cloneNode(true) as HTMLElement;

                                    // 3. Reset styles on clone to ensure perfect fit
                                    clone.style.transform = 'none';
                                    clone.style.margin = '0';
                                    clone.style.width = '100%';
                                    clone.style.height = '100%';
                                    clone.style.position = 'absolute';
                                    clone.style.top = '0';
                                    clone.style.left = '0';

                                    // 4. Mount
                                    captureContainer.appendChild(clone);
                                    document.body.appendChild(captureContainer);

                                    // 5. Wait for layout settling (fonts, images)
                                    await new Promise(r => setTimeout(r, 500));

                                    // --- REMOVE UI ELEMENTS FROM CLONE ---
                                    // Remove the pencil edit button from the captured clone
                                    const pencilBtn = captureContainer.querySelector('[data-testid="edit-pencil-btn"]');
                                    if (pencilBtn) {
                                        pencilBtn.remove();
                                    }

                                    // 6. Capture
                                    const canvas = await html2canvas(captureContainer, {
                                        useCORS: true,
                                        allowTaint: true,
                                        backgroundColor: '#ffffff',
                                        scale: 4, // Increased Resolution
                                        width: canvasSize.w,
                                        height: canvasSize.h,
                                        x: 0,
                                        y: 0,
                                        scrollX: 0,
                                        scrollY: 0,
                                        windowWidth: canvasSize.w,
                                        windowHeight: canvasSize.h
                                    });

                                    // 7. Cleanup
                                    document.body.removeChild(captureContainer);

                                    const uri = canvas.toDataURL('image/png');
                                    setPreviewImageUri(uri);
                                    setShowPreviewModal(true);

                                } catch (error) {
                                    // Cleanup on error
                                    const existingContainer = document.querySelector('div[style*="z-index: 9999999"]');
                                    if (existingContainer) document.body.removeChild(existingContainer);

                                    console.error('Preview capture error:', error);
                                    Alert.alert('Error', 'Failed to generate preview');
                                }
                            }
                        }}
                        style={[styles.saveButton, { backgroundColor: '#8b5cf6' }]}
                    >
                        <MaterialCommunityIcons name="eye" size={18} color="#fff" />
                        <Text style={styles.saveButtonText}>Preview</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.workspace}>
                {/* Left Toolbar - Enhanced Scrollable */}
                <ScrollView
                    style={styles.leftToolbar}
                    contentContainerStyle={styles.leftToolbarContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.toolbarHeader}>
                        <View style={styles.toolbarHeaderGradient}>
                            <MaterialCommunityIcons name="palette" size={20} color="#fff" />
                        </View>
                        <Text style={styles.toolbarHeaderText}>Tools</Text>
                    </View>

                    {tools.map((tool, index) => (
                        <TouchableOpacity
                            key={tool.id}
                            style={[
                                styles.toolItem,
                                selectedTool === tool.id && styles.selectedTool,
                                { animationDelay: `${index * 50}ms` }
                            ]}
                            onPress={() => handleToolPress(tool.id)}
                        >
                            <View style={[
                                styles.toolIconContainer,
                                selectedTool === tool.id && styles.selectedToolIconContainer
                            ]}>
                                <MaterialCommunityIcons
                                    name={tool.icon as any}
                                    size={24}
                                    color={selectedTool === tool.id ? '#fff' : '#64748b'}
                                />
                            </View>
                            <Text style={[
                                styles.toolName,
                                selectedTool === tool.id && styles.selectedToolText
                            ]}>{tool.name}</Text>
                            {selectedTool === tool.id && (
                                <View style={styles.selectedToolIndicator} />
                            )}
                        </TouchableOpacity>
                    ))}

                    <View style={styles.toolbarFooter}>
                        <View style={styles.toolbarDivider} />
                        <Text style={styles.toolbarFooterText}>v1.0</Text>
                    </View>
                </ScrollView>

                {/* Main Canvas */}
                <ScrollView
                    contentContainerStyle={styles.canvasScrollContent}
                    style={styles.canvasArea}
                    showsVerticalScrollIndicator={true}
                    showsHorizontalScrollIndicator={true}
                >
                    {/* Zoom Controls */}
                    <View style={styles.zoomControls}>
                        <TouchableOpacity onPress={() => handleZoom(false)} style={styles.zoomButton}>
                            <Ionicons name="remove" size={20} color="#1e293b" />
                        </TouchableOpacity>
                        <Text style={styles.zoomText}>{Math.round(zoomScale * 100)}%</Text>
                        <TouchableOpacity onPress={() => handleZoom(true)} style={styles.zoomButton}>
                            <Ionicons name="add" size={20} color="#1e293b" />
                        </TouchableOpacity>
                    </View>

                    <View style={{ transform: [{ scale: zoomScale }], marginVertical: 40, paddingTop: 2 }}>
                        <View
                            ref={canvasRef}
                            style={[
                                styles.canvas,
                                { width: canvasSize.w, height: canvasSize.h }
                            ]}
                        >
                            <Image
                                source={{ uri: currentImage }}
                                style={[styles.baseImage, { height: canvasSize.h }]}
                                resizeMode="cover"
                            />

                            {/* Filter Overlay */}
                            {selectedFilter !== 'none' && (
                                <View style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: canvasSize.h,
                                    backgroundColor: FILTERS.find(f => f.id === selectedFilter)?.overlay || 'transparent',
                                    pointerEvents: 'none',
                                }} />
                            )}

                            {elements.map((el) => (
                                <DraggableItem key={el.id} element={el} />
                            ))}

                            {/* Dynamic Bottom Bar - Auto-height based on content */}
                            <View style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                width: '100%',
                                minHeight: canvasSize.h * 0.15,
                                maxHeight: canvasSize.h * 0.35,
                            }}>
                                <RenderBottomBar
                                    template={selectedBottomBarTemplate}
                                    details={bottomBarDetails}
                                    width={canvasSize.w}
                                    customization={frameCustomization}
                                />
                                <TouchableOpacity
                                    testID="edit-pencil-btn"
                                    style={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        backgroundColor: 'rgba(0,0,0,0.6)',
                                        borderRadius: 20,
                                        padding: 8,
                                        zIndex: 10,
                                    }}
                                    onPress={() => {
                                        setSelectedTool('content');
                                        setShowBottomBarModal(false);
                                    }}
                                >
                                    <MaterialCommunityIcons name="pencil" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                {/* Right Properties Panel */}
                <View style={styles.rightPanel}>
                    <Text style={styles.panelTitle}>
                        {selectedElement
                            ? 'Properties'
                            : selectedTool === 'text'
                                ? 'Add Text'
                                : selectedTool === 'image'
                                    ? 'Add Image'
                                    : selectedTool === 'filter'
                                        ? 'Filters'
                                        : selectedTool === 'sticker'
                                            ? 'Bottom Bar Frames'
                                            : selectedTool === 'customize'
                                                ? 'Customize Frame'
                                                : selectedTool === 'banner'
                                                    ? 'Available Posters'
                                                    : 'Options'}
                    </Text>

                    {selectedElement ? (
                        // Show element properties when element is selected
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {selectedElement.type === 'text' && (
                                <>
                                    <Text style={styles.propLabel}>Text Content</Text>
                                    <TextInput
                                        style={styles.propInput}
                                        value={selectedElement.content}
                                        onChangeText={(text) => updateElement(selectedElement.id, { content: text })}
                                        multiline
                                    />

                                    <Text style={styles.propLabel}>Position</Text>
                                    <View style={styles.row}>
                                        <TouchableOpacity onPress={() => updateElement(selectedElement.id, { x: selectedElement.x - 5 })} style={[styles.propBtn, { flex: 1 }]}>
                                            <MaterialCommunityIcons name="arrow-left" size={20} color="#334155" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => updateElement(selectedElement.id, { y: selectedElement.y - 5 })} style={[styles.propBtn, { flex: 1 }]}>
                                            <MaterialCommunityIcons name="arrow-up" size={20} color="#334155" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => updateElement(selectedElement.id, { y: selectedElement.y + 5 })} style={[styles.propBtn, { flex: 1 }]}>
                                            <MaterialCommunityIcons name="arrow-down" size={20} color="#334155" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => updateElement(selectedElement.id, { x: selectedElement.x + 5 })} style={[styles.propBtn, { flex: 1 }]}>
                                            <MaterialCommunityIcons name="arrow-right" size={20} color="#334155" />
                                        </TouchableOpacity>
                                    </View>

                                    <Text style={styles.propLabel}>Font Size: {selectedElement.fontSize || 24}</Text>
                                    <View style={styles.row}>
                                        <TouchableOpacity onPress={() => updateElement(selectedElement.id, { fontSize: Math.max(12, (selectedElement.fontSize || 24) - 2) })} style={styles.propBtn}><Text>-</Text></TouchableOpacity>
                                        <TouchableOpacity onPress={() => updateElement(selectedElement.id, { fontSize: Math.min(120, (selectedElement.fontSize || 24) + 2) })} style={styles.propBtn}><Text>+</Text></TouchableOpacity>
                                    </View>

                                    <Text style={styles.propLabel}>Font Family</Text>
                                    <View style={styles.colorGrid}>
                                        {FONTS.map(font => (
                                            <TouchableOpacity
                                                key={font}
                                                style={[
                                                    styles.fontButton,
                                                    selectedElement.fontFamily === font && styles.selectedFontButton
                                                ]}
                                                onPress={() => updateElement(selectedElement.id, { fontFamily: font })}
                                            >
                                                <Text style={[styles.fontButtonText, selectedElement.fontFamily === font && styles.selectedFontButtonText]}>{font}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    <Text style={styles.propLabel}>Letter Spacing: {selectedElement.letterSpacing || 0}</Text>
                                    <View style={styles.row}>
                                        <TouchableOpacity onPress={() => updateElement(selectedElement.id, { letterSpacing: Math.max(-5, (selectedElement.letterSpacing || 0) - 0.5) })} style={styles.propBtn}><Text>-</Text></TouchableOpacity>
                                        <TouchableOpacity onPress={() => updateElement(selectedElement.id, { letterSpacing: Math.min(20, (selectedElement.letterSpacing || 0) + 0.5) })} style={styles.propBtn}><Text>+</Text></TouchableOpacity>
                                    </View>

                                    <Text style={styles.propLabel}>Line Height: {selectedElement.lineHeight || (selectedElement.fontSize || 24) * 1.2}</Text>
                                    <View style={styles.row}>
                                        <TouchableOpacity onPress={() => updateElement(selectedElement.id, { lineHeight: Math.max(12, (selectedElement.lineHeight || (selectedElement.fontSize || 24) * 1.2) - 2) })} style={styles.propBtn}><Text>-</Text></TouchableOpacity>
                                        <TouchableOpacity onPress={() => updateElement(selectedElement.id, { lineHeight: Math.min(200, (selectedElement.lineHeight || (selectedElement.fontSize || 24) * 1.2) + 2) })} style={styles.propBtn}><Text>+</Text></TouchableOpacity>
                                    </View>

                                    <Text style={styles.propLabel}>Text Color</Text>
                                    <View style={styles.colorGrid}>
                                        {COLORS.map(c => (
                                            <TouchableOpacity
                                                key={c}
                                                style={[styles.colorDot, { backgroundColor: c }, selectedElement.color === c && { borderWidth: 3, borderColor: SP_RED }]}
                                                onPress={() => updateElement(selectedElement.id, { color: c })}
                                            />
                                        ))}
                                    </View>

                                    <Text style={styles.propLabel}>Background Color</Text>
                                    <View style={styles.colorGrid}>
                                        {['transparent', '#FFFFFF', '#000000', '#E30512', '#009933', '#FFD700', '#3b82f6'].map(c => (
                                            <TouchableOpacity
                                                key={c}
                                                style={[
                                                    styles.colorDot,
                                                    { backgroundColor: c === 'transparent' ? '#fff' : c },
                                                    c === 'transparent' && { borderWidth: 2, borderColor: '#e2e8f0', borderStyle: 'dashed' },
                                                    selectedElement.backgroundColor === c && { borderWidth: 3, borderColor: SP_RED }
                                                ]}
                                                onPress={() => updateElement(selectedElement.id, { backgroundColor: c })}
                                            >
                                                {c === 'transparent' && <Text style={{ fontSize: 10 }}>T</Text>}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </>
                            )}



                            {selectedElement.type === 'image' && (
                                <>
                                    {/* Scale Control */}
                                    <Text style={styles.propLabel}>Size: {Math.round((selectedElement.scale || 1) * 100)}%</Text>
                                    <View style={styles.row}>
                                        <TouchableOpacity onPress={() => updateElement(selectedElement.id, { scale: Math.max(0.1, (selectedElement.scale || 1) - 0.1) })} style={styles.propBtn}><Text>-</Text></TouchableOpacity>
                                        <TouchableOpacity onPress={() => updateElement(selectedElement.id, { scale: Math.min(3, (selectedElement.scale || 1) + 0.1) })} style={styles.propBtn}><Text>+</Text></TouchableOpacity>
                                    </View>

                                    {/* Rotation Control */}
                                    <Text style={styles.propLabel}>Rotation: {Math.round(selectedElement.rotation || 0)}°</Text>
                                    <View style={styles.row}>
                                        <TouchableOpacity onPress={() => updateElement(selectedElement.id, { rotation: (selectedElement.rotation || 0) - 15 })} style={styles.propBtn}>
                                            <MaterialCommunityIcons name="rotate-left" size={16} color="#334155" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => updateElement(selectedElement.id, { rotation: (selectedElement.rotation || 0) + 15 })} style={styles.propBtn}>
                                            <MaterialCommunityIcons name="rotate-right" size={16} color="#334155" />
                                        </TouchableOpacity>
                                    </View>

                                    <Text style={styles.propLabel}>Actions</Text>

                                    <View style={{ marginBottom: 16 }}>
                                        <Text style={[styles.propLabel, { marginTop: 0 }]}>Position</Text>
                                        <View style={styles.row}>
                                            <TouchableOpacity onPress={() => updateElement(selectedElement.id, { x: selectedElement.x - 5 })} style={[styles.propBtn, { flex: 1 }]}>
                                                <MaterialCommunityIcons name="arrow-left" size={20} color="#334155" />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => updateElement(selectedElement.id, { y: selectedElement.y - 5 })} style={[styles.propBtn, { flex: 1 }]}>
                                                <MaterialCommunityIcons name="arrow-up" size={20} color="#334155" />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => updateElement(selectedElement.id, { y: selectedElement.y + 5 })} style={[styles.propBtn, { flex: 1 }]}>
                                                <MaterialCommunityIcons name="arrow-down" size={20} color="#334155" />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => updateElement(selectedElement.id, { x: selectedElement.x + 5 })} style={[styles.propBtn, { flex: 1 }]}>
                                                <MaterialCommunityIcons name="arrow-right" size={20} color="#334155" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <Text style={styles.propLabel}>Tools</Text>
                                    <View style={{ gap: 8 }}>
                                        <TouchableOpacity
                                            style={[styles.toolActionButton, { backgroundColor: selectedElement.isFlipped ? '#3b82f6' : '#fff', borderWidth: 1, borderColor: '#e2e8f0' }]}
                                            onPress={() => updateElement(selectedElement.id, { isFlipped: !selectedElement.isFlipped })}
                                        >
                                            <MaterialCommunityIcons name="flip-horizontal" size={20} color={selectedElement.isFlipped ? "#fff" : "#1e293b"} />
                                            <Text style={[styles.toolActionText, { color: selectedElement.isFlipped ? "#fff" : "#1e293b" }]}>Flip Horizontal</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.toolActionButton, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', opacity: isRemovingBg ? 0.7 : 1 }]}
                                            onPress={() => removeImageBackground(selectedElement.id)}
                                            disabled={isRemovingBg}
                                        >
                                            {isRemovingBg ? (
                                                <ActivityIndicator size="small" color={SP_RED} style={{ marginRight: 8 }} />
                                            ) : (
                                                <MaterialCommunityIcons name="image-remove" size={20} color="#1e293b" style={{ marginRight: 8 }} />
                                            )}
                                            <Text style={[styles.toolActionText, { color: "#1e293b" }]}>
                                                {isRemovingBg ? 'Removing...' : 'Remove Background'}
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.toolActionButton, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' }]}
                                            onPress={() => {
                                                const newElement = {
                                                    ...selectedElement,
                                                    id: Date.now().toString(),
                                                    x: selectedElement.x + 20,
                                                    y: selectedElement.y + 20,
                                                };
                                                setElements(prev => [...prev, newElement]);
                                            }}
                                        >
                                            <MaterialCommunityIcons name="content-copy" size={20} color="#1e293b" />
                                            <Text style={[styles.toolActionText, { color: "#1e293b" }]}>Duplicate</Text>
                                        </TouchableOpacity>


                                    </View>
                                </>
                            )}

                            <TouchableOpacity style={styles.deleteButtonFull} onPress={deleteSelectedElement}>
                                <MaterialCommunityIcons name="delete" size={20} color="#fff" />
                                <Text style={{ color: '#fff', marginLeft: 8 }}>Delete Element</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    ) : (
                        // Show tool-specific options based on selected tool
                        <ScrollView showsVerticalScrollIndicator={true} style={{ flex: 1 }}>
                            {selectedTool === 'content' ? (
                                // Change Content Form
                                <>
                                    <Text style={styles.sectionTitle}>Edit Frame Content</Text>
                                    <Text style={styles.helpText}>Update the information displayed in your poster</Text>

                                    <View style={{ gap: 16, marginTop: 16 }}>
                                        {/* Name Field */}
                                        <View>
                                            <Text style={styles.inputLabel}>Name</Text>
                                            <TextInput
                                                style={styles.textInput}
                                                value={bottomBarDetails.name}
                                                onChangeText={(text) => setBottomBarDetails(prev => ({ ...prev, name: text }))}
                                                placeholder="Enter name"
                                                placeholderTextColor="#94a3b8"
                                            />
                                        </View>

                                        {/* Designation Field */}
                                        <View>
                                            <Text style={styles.inputLabel}>Designation / Role</Text>
                                            <TextInput
                                                style={styles.textInput}
                                                value={bottomBarDetails.designation}
                                                onChangeText={(text) => setBottomBarDetails(prev => ({ ...prev, designation: text }))}
                                                placeholder="Enter designation"
                                                placeholderTextColor="#94a3b8"
                                            />
                                        </View>

                                        {/* Mobile Field */}
                                        <View>
                                            <Text style={styles.inputLabel}>Mobile Number</Text>
                                            <TextInput
                                                style={styles.textInput}
                                                value={bottomBarDetails.mobile}
                                                onChangeText={(text) => {
                                                    // Only allow numeric characters and limit to 10 digits
                                                    const numericText = text.replace(/[^0-9]/g, '');
                                                    if (numericText.length <= 10) {
                                                        setBottomBarDetails(prev => ({ ...prev, mobile: numericText }));
                                                    }
                                                }}
                                                placeholder="Enter 10-digit mobile number"
                                                placeholderTextColor="#94a3b8"
                                                keyboardType="numeric"
                                                maxLength={10}
                                            />
                                            {bottomBarDetails.mobile && bottomBarDetails.mobile.length < 10 && (
                                                <Text style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>
                                                    Mobile number must be 10 digits ({bottomBarDetails.mobile.length}/10)
                                                </Text>
                                            )}
                                        </View>

                                        {/* Social Field with Platform Selection */}
                                        <View>
                                            <Text style={styles.inputLabel}>Social Media</Text>

                                            {/* Platform Icons */}
                                            <View style={{
                                                flexDirection: 'row',
                                                gap: 8,
                                                marginBottom: 8,
                                                flexWrap: 'wrap'
                                            }}>
                                                <TouchableOpacity
                                                    style={[
                                                        styles.socialIconButton,
                                                        selectedSocialPlatform === 'twitter' && styles.selectedSocialIconButton
                                                    ]}
                                                    onPress={() => {
                                                        setSelectedSocialPlatform('twitter');
                                                        setBottomBarDetails(prev => ({ ...prev, socialPlatform: 'twitter' }));
                                                    }}
                                                >
                                                    <MaterialCommunityIcons
                                                        name="twitter"
                                                        size={20}
                                                        color={selectedSocialPlatform === 'twitter' ? '#fff' : '#1DA1F2'}
                                                    />
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    style={[
                                                        styles.socialIconButton,
                                                        selectedSocialPlatform === 'facebook' && styles.selectedSocialIconButton
                                                    ]}
                                                    onPress={() => {
                                                        setSelectedSocialPlatform('facebook');
                                                        setBottomBarDetails(prev => ({ ...prev, socialPlatform: 'facebook' }));
                                                    }}
                                                >
                                                    <MaterialCommunityIcons
                                                        name="facebook"
                                                        size={20}
                                                        color={selectedSocialPlatform === 'facebook' ? '#fff' : '#1877F2'}
                                                    />
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    style={[
                                                        styles.socialIconButton,
                                                        selectedSocialPlatform === 'instagram' && styles.selectedSocialIconButton
                                                    ]}
                                                    onPress={() => {
                                                        setSelectedSocialPlatform('instagram');
                                                        setBottomBarDetails(prev => ({ ...prev, socialPlatform: 'instagram' }));
                                                    }}
                                                >
                                                    <MaterialCommunityIcons
                                                        name="instagram"
                                                        size={20}
                                                        color={selectedSocialPlatform === 'instagram' ? '#fff' : '#E4405F'}
                                                    />
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    style={[
                                                        styles.socialIconButton,
                                                        selectedSocialPlatform === 'youtube' && styles.selectedSocialIconButton
                                                    ]}
                                                    onPress={() => {
                                                        setSelectedSocialPlatform('youtube');
                                                        setBottomBarDetails(prev => ({ ...prev, socialPlatform: 'youtube' }));
                                                    }}
                                                >
                                                    <MaterialCommunityIcons
                                                        name="youtube"
                                                        size={20}
                                                        color={selectedSocialPlatform === 'youtube' ? '#fff' : '#FF0000'}
                                                    />
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    style={[
                                                        styles.socialIconButton,
                                                        selectedSocialPlatform === 'linkedin' && styles.selectedSocialIconButton
                                                    ]}
                                                    onPress={() => {
                                                        setSelectedSocialPlatform('linkedin');
                                                        setBottomBarDetails(prev => ({ ...prev, socialPlatform: 'linkedin' }));
                                                    }}
                                                >
                                                    <MaterialCommunityIcons
                                                        name="linkedin"
                                                        size={20}
                                                        color={selectedSocialPlatform === 'linkedin' ? '#fff' : '#0A66C2'}
                                                    />
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    style={[
                                                        styles.socialIconButton,
                                                        selectedSocialPlatform === 'whatsapp' && styles.selectedSocialIconButton
                                                    ]}
                                                    onPress={() => {
                                                        setSelectedSocialPlatform('whatsapp');
                                                        setBottomBarDetails(prev => ({ ...prev, socialPlatform: 'whatsapp' }));
                                                    }}
                                                >
                                                    <MaterialCommunityIcons
                                                        name="whatsapp"
                                                        size={20}
                                                        color={selectedSocialPlatform === 'whatsapp' ? '#fff' : '#25D366'}
                                                    />
                                                </TouchableOpacity>
                                            </View>

                                            {/* Handle Input */}
                                            <TextInput
                                                style={styles.textInput}
                                                value={bottomBarDetails.socialHandle}
                                                onChangeText={(text) => setBottomBarDetails(prev => ({ ...prev, socialHandle: text }))}
                                                placeholder={`Enter ${selectedSocialPlatform} handle or ID`}
                                                placeholderTextColor="#94a3b8"
                                            />
                                        </View>

                                        {/* Address Field */}
                                        <View>
                                            <Text style={styles.inputLabel}>Address</Text>
                                            <TextInput
                                                style={[styles.textInput, { height: 80 }]}
                                                value={bottomBarDetails.address}
                                                onChangeText={(text) => setBottomBarDetails(prev => ({ ...prev, address: text }))}
                                                placeholder="Enter address"
                                                placeholderTextColor="#94a3b8"
                                                multiline
                                                numberOfLines={3}
                                            />
                                        </View>
                                    </View>
                                </>
                            ) : selectedTool === 'text' ? (
                                // Show only text tool options, no posters
                                <>
                                    <Text style={styles.helpText}>Click button below to add text to your poster</Text>
                                    <TouchableOpacity
                                        style={styles.toolActionButton}
                                        onPress={() => addElement('text', 'Double tap to edit')}
                                    >
                                        <MaterialCommunityIcons name="text-box-plus" size={24} color="#fff" />
                                        <Text style={styles.toolActionText}>Add Text Element</Text>
                                    </TouchableOpacity>
                                </>
                            ) : selectedTool === 'image' ? (
                                // Show only image tool options, no posters
                                <>
                                    <Text style={styles.helpText}>Choose an image from your device</Text>
                                    <TouchableOpacity
                                        style={styles.toolActionButton}
                                        onPress={pickImage}
                                    >
                                        <MaterialCommunityIcons name="image-plus" size={24} color="#fff" />
                                        <Text style={styles.toolActionText}>Choose Image</Text>
                                    </TouchableOpacity>
                                </>
                            ) : selectedTool === 'filter' ? (
                                // Show only filters, no posters
                                <>
                                    <Text style={styles.helpText}>Apply filters to your poster</Text>
                                    <View style={{ gap: 12, marginTop: 8 }}>
                                        {FILTERS.map(filter => (
                                            <TouchableOpacity
                                                key={filter.id}
                                                style={[
                                                    styles.filterOption,
                                                    selectedFilter === filter.id && styles.selectedFilterOption
                                                ]}
                                                onPress={() => setSelectedFilter(filter.id)}
                                            >
                                                <View style={[styles.filterPreview, { backgroundColor: filter.overlay }]} />
                                                <Text style={[
                                                    styles.filterOptionText,
                                                    selectedFilter === filter.id && styles.selectedFilterOptionText
                                                ]}>{filter.name}</Text>
                                                {selectedFilter === filter.id && (
                                                    <MaterialCommunityIcons name="check-circle" size={20} color={SP_RED} />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </>
                            ) : selectedTool === 'sticker' ? (
                                // Frame Selector Component
                                <FrameSelector
                                    selectedTemplate={selectedBottomBarTemplate}
                                    onSelectTemplate={(templateId) => {
                                        setSelectedBottomBarTemplate(templateId);
                                        // Stay on frame selection section - don't auto-switch to customize
                                    }}
                                />
                            ) : selectedTool === 'customize' ? (
                                // Show frame customization options
                                <>
                                    <Text style={styles.helpText}>Customize your frame</Text>

                                    {/* Element Selection Buttons */}
                                    <View style={{ gap: 8, marginTop: 12 }}>
                                        {['Background', 'Image', 'Name', 'Designation', 'Mobile', 'Address', 'Social'].map(element => (
                                            <TouchableOpacity
                                                key={element}
                                                style={[
                                                    styles.customElementButton,
                                                    selectedCustomElement === element && styles.selectedCustomElementButton
                                                ]}
                                                onPress={() => setSelectedCustomElement(selectedCustomElement === element ? null : element)}
                                            >
                                                <MaterialCommunityIcons
                                                    name={element === 'Background' ? 'palette' : element === 'Image' ? 'image' : 'text'}
                                                    size={20}
                                                    color={selectedCustomElement === element ? '#fff' : '#1e293b'}
                                                />
                                                <Text style={[
                                                    styles.customElementButtonText,
                                                    selectedCustomElement === element && styles.selectedCustomElementButtonText
                                                ]}>{element}</Text>
                                                <MaterialCommunityIcons
                                                    name={selectedCustomElement === element ? 'chevron-up' : 'chevron-down'}
                                                    size={20}
                                                    color={selectedCustomElement === element ? '#fff' : '#64748b'}
                                                />
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    {/* Element-Specific Customization */}
                                    {selectedCustomElement && (
                                        <View style={styles.customizationPanel}>
                                            {/* Global Custom Colors Config */}
                                            <View style={{ marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 16 }}>
                                                <Text style={[styles.customizeLabel, { marginBottom: 8 }]}>My Custom Colors (Quick Access)</Text>
                                                <View style={{ flexDirection: 'row', gap: 16 }}>
                                                    <View style={{ alignItems: 'center', gap: 4 }}>
                                                        <Text style={{ fontSize: 10, color: '#64748b' }}>Color 1</Text>
                                                        <input
                                                            type="color"
                                                            value={frameCustomization.customColor1 || '#000000'}
                                                            onChange={(e) => setFrameCustomization(prev => ({ ...prev, customColor1: e.target.value }))}
                                                            style={{ width: 60, height: 34, borderRadius: 6, cursor: 'pointer', border: '1px solid #cbd5e1', padding: 0 }}
                                                        />
                                                    </View>
                                                    <View style={{ alignItems: 'center', gap: 4 }}>
                                                        <Text style={{ fontSize: 10, color: '#64748b' }}>Color 2</Text>
                                                        <input
                                                            type="color"
                                                            value={frameCustomization.customColor2 || '#ffffff'}
                                                            onChange={(e) => setFrameCustomization(prev => ({ ...prev, customColor2: e.target.value }))}
                                                            style={{ width: 60, height: 34, borderRadius: 6, cursor: 'pointer', border: '1px solid #cbd5e1', padding: 0 }}
                                                        />
                                                    </View>
                                                </View>
                                            </View>
                                            {selectedCustomElement === 'Background' && (
                                                <>
                                                    <View style={styles.customSection}>
                                                        <Text style={styles.customizeLabel}>Gradient Colors</Text>
                                                        <View style={{ gap: 16 }}>
                                                            {/* Color 1 Picker */}
                                                            <View>
                                                                <Text style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Start Color</Text>
                                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                                                    <input
                                                                        type="color"
                                                                        value={frameCustomization.backgroundGradient?.[0] || '#E30512'}
                                                                        onChange={(e) => {
                                                                            const newGradient = [...(frameCustomization.backgroundGradient || ['#E30512', '#b91c1c'])];
                                                                            newGradient[0] = e.target.value;
                                                                            setFrameCustomization(prev => ({ ...prev, backgroundGradient: newGradient }));
                                                                        }}
                                                                        style={{
                                                                            width: 50,
                                                                            height: 40,
                                                                            border: '2px solid #e2e8f0',
                                                                            borderRadius: 8,
                                                                            cursor: 'pointer'
                                                                        }}
                                                                    />
                                                                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#1e293b' }}>
                                                                        {frameCustomization.backgroundGradient?.[0] || '#E30512'}
                                                                    </Text>
                                                                </View>
                                                            </View>

                                                            {/* Color 2 Picker */}
                                                            <View>
                                                                <Text style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>End Color</Text>
                                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                                                    <input
                                                                        type="color"
                                                                        value={frameCustomization.backgroundGradient?.[1] || '#b91c1c'}
                                                                        onChange={(e) => {
                                                                            const newGradient = [...(frameCustomization.backgroundGradient || ['#E30512', '#b91c1c'])];
                                                                            newGradient[1] = e.target.value;
                                                                            setFrameCustomization(prev => ({ ...prev, backgroundGradient: newGradient }));
                                                                        }}
                                                                        style={{
                                                                            width: 50,
                                                                            height: 40,
                                                                            border: '2px solid #e2e8f0',
                                                                            borderRadius: 8,
                                                                            cursor: 'pointer'
                                                                        }}
                                                                    />
                                                                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#1e293b' }}>
                                                                        {frameCustomization.backgroundGradient?.[1] || '#b91c1c'}
                                                                    </Text>
                                                                </View>
                                                            </View>

                                                            {/* Color 3 Picker (Optional) */}
                                                            <View>
                                                                <Text style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Middle Color (Optional)</Text>
                                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                                                    <input
                                                                        type="color"
                                                                        value={frameCustomization.backgroundGradient?.[2] || '#7f1d1d'}
                                                                        onChange={(e) => {
                                                                            const newGradient = [...(frameCustomization.backgroundGradient || ['#E30512', '#b91c1c', '#7f1d1d'])];
                                                                            if (newGradient.length < 3) newGradient.push(e.target.value);
                                                                            else newGradient[2] = e.target.value;
                                                                            setFrameCustomization(prev => ({ ...prev, backgroundGradient: newGradient }));
                                                                        }}
                                                                        style={{
                                                                            width: 50,
                                                                            height: 40,
                                                                            border: '2px solid #e2e8f0',
                                                                            borderRadius: 8,
                                                                            cursor: 'pointer'
                                                                        }}
                                                                    />
                                                                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#1e293b' }}>
                                                                        {frameCustomization.backgroundGradient?.[2] || 'Click to add'}
                                                                    </Text>
                                                                </View>
                                                            </View>

                                                            {/* Gradient Preview */}
                                                            <View>
                                                                <Text style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Preview:</Text>
                                                                <LinearGradient
                                                                    colors={(frameCustomization.backgroundGradient || ['#E30512', '#b91c1c']) as any}
                                                                    start={{ x: 0, y: 0 }}
                                                                    end={{ x: 1, y: 1 }}
                                                                    style={{ height: 60, borderRadius: 8, borderWidth: 2, borderColor: '#e2e8f0' }}
                                                                />
                                                            </View>

                                                            {/* Quick Gradient Presets */}
                                                            <View>
                                                                <Text style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Quick Presets:</Text>
                                                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                                                    {[
                                                                        { name: 'Party', colors: ['#E30512', '#16a34a'] },
                                                                        { name: 'Red', colors: ['#E30512', '#b91c1c'] },
                                                                        { name: 'Green', colors: ['#009933', '#15803d'] },
                                                                        { name: 'Gold', colors: ['#fbbf24', '#f59e0b'] },
                                                                        { name: 'Blue', colors: ['#3b82f6', '#1e40af'] },
                                                                        { name: 'Purple', colors: ['#8b5cf6', '#d946ef'] },
                                                                    ].map(preset => (
                                                                        <TouchableOpacity
                                                                            key={preset.name}
                                                                            onPress={() => setFrameCustomization(prev => ({ ...prev, backgroundGradient: preset.colors }))}
                                                                            style={{ alignItems: 'center', gap: 4, width: '48%' }}
                                                                        >
                                                                            <LinearGradient
                                                                                colors={preset.colors as any}
                                                                                start={{ x: 0, y: 0 }}
                                                                                end={{ x: 1, y: 0 }}
                                                                                style={{ width: '100%', height: 40, borderRadius: 8 }}
                                                                            />
                                                                            <Text style={{ fontSize: 11, color: '#64748b', fontWeight: '500' }}>{preset.name}</Text>
                                                                        </TouchableOpacity>
                                                                    ))}
                                                                </View>
                                                            </View>
                                                        </View>
                                                    </View>

                                                    <View style={styles.customSection}>
                                                        <Text style={styles.customizeLabel}>Opacity: {Math.round(frameCustomization.backgroundOpacity * 100)}%</Text>
                                                        <View style={styles.row}>
                                                            <TouchableOpacity
                                                                onPress={() => setFrameCustomization(prev => ({ ...prev, backgroundOpacity: Math.max(0, prev.backgroundOpacity - 0.1) }))}
                                                                style={styles.propBtn}
                                                            >
                                                                <Text>-</Text>
                                                            </TouchableOpacity>
                                                            <View style={{ flex: 1, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, marginHorizontal: 12 }}>
                                                                <View style={{ width: `${frameCustomization.backgroundOpacity * 100}%`, height: '100%', backgroundColor: SP_RED, borderRadius: 2 }} />
                                                            </View>
                                                            <TouchableOpacity
                                                                onPress={() => setFrameCustomization(prev => ({ ...prev, backgroundOpacity: Math.min(1, prev.backgroundOpacity + 0.1) }))}
                                                                style={styles.propBtn}
                                                            >
                                                                <Text>+</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                </>
                                            )}

                                            {selectedCustomElement === 'Image' && (
                                                <>
                                                    <View style={styles.customSection}>
                                                        <Text style={styles.customizeLabel}>Image Size</Text>
                                                        <View style={styles.row}>
                                                            <TouchableOpacity
                                                                onPress={() => setFrameCustomization(prev => ({ ...prev, imageSize: Math.max(50, prev.imageSize - 5) }))}
                                                                style={styles.propBtn}
                                                            >
                                                                <Text>-</Text>
                                                            </TouchableOpacity>
                                                            <Text style={styles.customizeValue}>{frameCustomization.imageSize}px</Text>
                                                            <TouchableOpacity
                                                                onPress={() => setFrameCustomization(prev => ({ ...prev, imageSize: Math.min(150, prev.imageSize + 5) }))}
                                                                style={styles.propBtn}
                                                            >
                                                                <Text>+</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>

                                                    <View style={styles.customSection}>
                                                        <Text style={styles.customizeLabel}>Border Color</Text>
                                                        <View style={styles.colorGrid}>
                                                            {[SP_RED, SP_GREEN, '#FFD700', '#000000', '#ffffff', frameCustomization.customColor1 || '#000000', frameCustomization.customColor2 || '#ffffff', 'transparent'].map((c, idx) => (
                                                                <TouchableOpacity
                                                                    key={`${c}-${idx}`}
                                                                    style={[
                                                                        styles.colorDot,
                                                                        { backgroundColor: c === 'transparent' ? '#fff' : c },
                                                                        c === 'transparent' && { borderWidth: 2, borderColor: '#e2e8f0', borderStyle: 'dashed' },
                                                                        frameCustomization.imageBorderColor === c && { borderWidth: 3, borderColor: SP_RED }
                                                                    ]}
                                                                    onPress={() => setFrameCustomization(prev => ({ ...prev, imageBorderColor: c }))}
                                                                >
                                                                    {c === 'transparent' && <Text style={{ fontSize: 10 }}>T</Text>}
                                                                </TouchableOpacity>
                                                            ))}
                                                        </View>
                                                    </View>
                                                </>
                                            )}

                                            {['Name', 'Designation', 'Mobile', 'Address', 'Social'].map(elem => {
                                                if (selectedCustomElement !== elem) return null;
                                                const key = elem.toLowerCase() as 'name' | 'designation' | 'mobile' | 'address' | 'social';
                                                return (
                                                    <View key={elem}>
                                                        <View style={styles.customSection}>
                                                            <Text style={styles.customizeLabel}>Font Size</Text>
                                                            <View style={styles.row}>
                                                                <TouchableOpacity
                                                                    onPress={() => setFrameCustomization(prev => ({ ...prev, [`${key}FontSize`]: Math.max(6, prev[`${key}FontSize`] - 1) }))}
                                                                    style={styles.propBtn}
                                                                >
                                                                    <Text>-</Text>
                                                                </TouchableOpacity>
                                                                <Text style={styles.customizeValue}>{frameCustomization[`${key}FontSize`]}</Text>
                                                                <TouchableOpacity
                                                                    onPress={() => setFrameCustomization(prev => ({ ...prev, [`${key}FontSize`]: Math.min(32, prev[`${key}FontSize`] + 1) }))}
                                                                    style={styles.propBtn}
                                                                >
                                                                    <Text>+</Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                        </View>

                                                        <View style={styles.customSection}>
                                                            <Text style={styles.customizeLabel}>Text Color</Text>
                                                            <View style={styles.colorGrid}>
                                                                {['#0f172a', '#64748b', SP_RED, SP_GREEN, '#FFD700', '#ffffff', frameCustomization.customColor1 || '#000000', frameCustomization.customColor2 || '#ffffff', 'transparent'].map((c, idx) => (
                                                                    <TouchableOpacity
                                                                        key={`${c}-${idx}`}
                                                                        style={[
                                                                            styles.colorDot,
                                                                            { backgroundColor: c === 'transparent' ? '#fff' : c },
                                                                            c === 'transparent' && { borderWidth: 2, borderColor: '#e2e8f0', borderStyle: 'dashed' },
                                                                            frameCustomization[`${key}Color`] === c && { borderWidth: 3, borderColor: SP_RED }
                                                                        ]}
                                                                        onPress={() => setFrameCustomization(prev => ({ ...prev, [`${key}Color`]: c }))}
                                                                    >
                                                                        {c === 'transparent' && <Text style={{ fontSize: 10 }}>T</Text>}
                                                                    </TouchableOpacity>
                                                                ))}
                                                            </View>
                                                        </View>

                                                        <View style={styles.customSection}>
                                                            <Text style={styles.customizeLabel}>Background Color</Text>
                                                            <View style={styles.colorGrid}>
                                                                {['transparent', '#ffffff', '#f8fafc', SP_RED, SP_GREEN, '#FFD700', '#000000', frameCustomization.customColor1 || '#000000', frameCustomization.customColor2 || '#ffffff'].map((c, idx) => (
                                                                    <TouchableOpacity
                                                                        key={`${c}-${idx}`}
                                                                        style={[
                                                                            styles.colorDot,
                                                                            { backgroundColor: c === 'transparent' ? '#fff' : c },
                                                                            c === 'transparent' && { borderWidth: 2, borderColor: '#e2e8f0', borderStyle: 'dashed' },
                                                                            frameCustomization[`${key}BackgroundColor`] === c && { borderWidth: 3, borderColor: SP_RED }
                                                                        ]}
                                                                        onPress={() => setFrameCustomization(prev => ({ ...prev, [`${key}BackgroundColor`]: c }))}
                                                                    >
                                                                        {c === 'transparent' && <Text style={{ fontSize: 10 }}>T</Text>}
                                                                    </TouchableOpacity>
                                                                ))}
                                                            </View>
                                                        </View>
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    )}
                                </>
                            ) : selectedTool === 'banner' ? (
                                // Show posters only for banner tool
                                <>
                                    <Text style={styles.helpText}>Select a poster template to start editing</Text>
                                    {isLoadingPosters ? (
                                        <View style={{ padding: 40, alignItems: 'center' }}>
                                            <ActivityIndicator size="large" color={SP_RED} />
                                            <Text style={{ marginTop: 12, color: '#64748b' }}>Loading posters...</Text>
                                        </View>
                                    ) : (
                                        <View style={{ gap: 12, marginTop: 12 }}>
                                            {availablePosters.map((poster) => (
                                                <TouchableOpacity
                                                    key={poster._id}
                                                    style={[
                                                        styles.posterItem,
                                                        currentImage === poster.imageUrl && styles.selectedPosterItem
                                                    ]}
                                                    onPress={() => handlePosterSelect(poster.imageUrl)}
                                                >
                                                    <Image
                                                        source={{ uri: poster.imageUrl }}
                                                        style={styles.posterThumbnail}
                                                        resizeMode="cover"
                                                    />
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={styles.posterTitle} numberOfLines={2}>
                                                            {poster.title}
                                                        </Text>
                                                        <Text style={styles.posterCategory}>
                                                            {poster.category}
                                                        </Text>
                                                    </View>
                                                    {currentImage === poster.imageUrl && (
                                                        <MaterialCommunityIcons
                                                            name="check-circle"
                                                            size={24}
                                                            color={SP_RED}
                                                        />
                                                    )}
                                                </TouchableOpacity>
                                            ))}
                                            {availablePosters.length === 0 && (
                                                <Text style={styles.emptyState}>No posters available</Text>
                                            )}
                                        </View>
                                    )}
                                </>
                            ) : (
                                <Text style={styles.emptyState}>Select a tool to see options</Text>
                            )}
                        </ScrollView>
                    )}
                </View>
            </View>

            {/* Bottom Bar Template Modal */}
            <Modal
                visible={showBottomBarModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowBottomBarModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={() => setShowBottomBarModal(false)}
                    />
                    <View style={styles.bottomSheet}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Bottom Bar Frame</Text>
                            <TouchableOpacity onPress={() => setShowBottomBarModal(false)} style={styles.closeButton}>
                                <MaterialCommunityIcons name="close" size={24} color="#0f172a" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={TEMPLATES}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={item => item.id}
                            contentContainerStyle={styles.carouselContent}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.carouselItem,
                                        { width: width * 0.8 }
                                    ]}
                                    onPress={() => {
                                        setSelectedBottomBarTemplate(item.id);

                                        setShowBottomBarModal(false);
                                        setShowBottomBarEditForm(true);
                                    }}
                                >
                                    <View style={{ paddingHorizontal: 40, width: '100%' }}>
                                        <View style={[
                                            styles.framePreviewContainer,
                                            selectedBottomBarTemplate === item.id && styles.selectedFrameBorder
                                        ]}>
                                            <RenderBottomBar
                                                template={item.id}
                                                details={bottomBarDetails}
                                                width={width * 0.8 - 80 - 28}
                                            />
                                        </View>
                                        <Text style={[
                                            styles.templateName,
                                            selectedBottomBarTemplate === item.id && styles.selectedTemplateName
                                        ]}>{item.name}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            {/* Bottom Bar Edit Form Modal */}
            <Modal
                visible={showBottomBarEditForm}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowBottomBarEditForm(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={() => setShowBottomBarEditForm(false)}
                    />
                    <View style={[styles.bottomSheet, { height: '70%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Bottom Bar Details</Text>
                            <TouchableOpacity onPress={() => setShowBottomBarEditForm(false)} style={styles.closeButton}>
                                <MaterialCommunityIcons name="close" size={24} color="#0f172a" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={{ flex: 1, padding: 20 }} showsVerticalScrollIndicator={false}>
                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Name</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={bottomBarDetails.name}
                                    onChangeText={(text) => setBottomBarDetails(prev => ({ ...prev, name: text }))}
                                    placeholder="Enter your name"
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Designation</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={bottomBarDetails.designation}
                                    onChangeText={(text) => setBottomBarDetails(prev => ({ ...prev, designation: text }))}
                                    placeholder="e.g. District President"
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Mobile Number</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={bottomBarDetails.mobile}
                                    onChangeText={(text) => setBottomBarDetails(prev => ({ ...prev, mobile: text }))}
                                    placeholder="+91 XXXXX XXXXX"
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Social Handle</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={bottomBarDetails.socialHandle}
                                    onChangeText={(text) => setBottomBarDetails(prev => ({ ...prev, socialHandle: text }))}
                                    placeholder="@username"
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Address</Text>
                                <TextInput
                                    style={[styles.formInput, { height: 80 }]}
                                    value={bottomBarDetails.address}
                                    onChangeText={(text) => setBottomBarDetails(prev => ({ ...prev, address: text }))}
                                    placeholder="Enter your address"
                                    multiline
                                    numberOfLines={3}
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.saveFormButton}
                                onPress={() => setShowBottomBarEditForm(false)}
                            >
                                <Text style={styles.saveFormButtonText}>Save Changes</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Image Processing Modal */}
            <Modal
                visible={showImageModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowImageModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={() => setShowImageModal(false)}
                    />
                    <View style={[styles.bottomSheet, { height: '60%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Image Options</Text>
                            <TouchableOpacity onPress={() => setShowImageModal(false)} style={styles.closeButton}>
                                <MaterialCommunityIcons name="close" size={24} color="#0f172a" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={{ flex: 1, padding: 20 }} showsVerticalScrollIndicator={false}>
                            <View style={{ alignItems: 'center', marginBottom: 20 }}>
                                <Image
                                    source={{ uri: processedImageUri || selectedImageUri || '' }}
                                    style={{ width: 300, height: 300, borderRadius: 12 }}
                                    resizeMode="contain"
                                />
                            </View>



                            <TouchableOpacity
                                style={[styles.toolActionButton, { marginTop: 12 }]}
                                onPress={() => handleAddImage(!!processedImageUri)}
                            >
                                <MaterialCommunityIcons name="check" size={24} color="#fff" />
                                <Text style={styles.toolActionText}>Add to Poster</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Filter Modal */}
            <Modal
                visible={showFilterModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowFilterModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={() => setShowFilterModal(false)}
                    />
                    <View style={[styles.bottomSheet, { height: '50%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Filter</Text>
                            <TouchableOpacity onPress={() => setShowFilterModal(false)} style={styles.closeButton}>
                                <MaterialCommunityIcons name="close" size={24} color="#0f172a" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={FILTERS}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20 }}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.filterItem,
                                        selectedFilter === item.id && styles.selectedFilterItem
                                    ]}
                                    onPress={() => {
                                        setSelectedFilter(item.id);
                                        setShowFilterModal(false);
                                    }}
                                >
                                    <View style={styles.filterPreviewContainer}>
                                        <Image
                                            source={{ uri: currentImage }}
                                            style={styles.filterPreviewImage}
                                            resizeMode="cover"
                                        />
                                        <View style={[
                                            styles.filterPreviewOverlay,
                                            { backgroundColor: item.overlay }
                                        ]} />
                                    </View>
                                    <Text style={[
                                        styles.filterName,
                                        selectedFilter === item.id && styles.selectedFilterName
                                    ]}>{item.name}</Text>
                                    {selectedFilter === item.id && (
                                        <MaterialCommunityIcons
                                            name="check-circle"
                                            size={20}
                                            color={SP_RED}
                                            style={{ marginTop: 4 }}
                                        />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
            {/* Preview Modal */}
            <Modal
                visible={showPreviewModal}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowPreviewModal(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity
                        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                        activeOpacity={1}
                        onPress={() => setShowPreviewModal(false)}
                    />

                    <View style={{ width: '90%', maxWidth: 800, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' }}>
                        {/* Preview Header */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' }}>
                            <Text style={{ fontSize: 20, fontWeight: '700', color: '#1e293b' }}>Poster Preview</Text>
                            <TouchableOpacity onPress={() => setShowPreviewModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        {/* Poster Preview */}
                        <ScrollView style={{ maxHeight: 600 }}>
                            <View style={{ padding: 20, alignItems: 'center', backgroundColor: '#f8fafc' }}>
                                <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 }}>
                                    {/* This will show the captured screenshot */}
                                    <View style={{ width: canvasSize.w, height: canvasSize.h }}>
                                        {previewImageUri ? (
                                            <Image
                                                source={{ uri: previewImageUri }}
                                                style={{ width: '100%', height: '100%', borderRadius: 4 }}
                                                resizeMode="contain"
                                            />
                                        ) : (
                                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                <ActivityIndicator size="large" color="#8b5cf6" />
                                                <Text style={{ marginTop: 10, color: '#64748b' }}>Loading Preview...</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                        </ScrollView>

                        {/* Action Buttons */}
                        <View style={{ flexDirection: 'row', gap: 12, padding: 20, borderTopWidth: 1, borderTopColor: '#e2e8f0' }}>
                            <TouchableOpacity
                                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#3b82f6', padding: 14, borderRadius: 8 }}
                                onPress={handleSharePoster}
                            >
                                <MaterialCommunityIcons name="share-variant" size={20} color="#fff" />
                                <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>Share</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#10b981', padding: 14, borderRadius: 8 }}
                                onPress={() => {
                                    if (previewImageUri) {
                                        const link = document.createElement('a');
                                        link.href = previewImageUri;
                                        link.download = `poster-${Date.now()}.png`;
                                        link.click();
                                        Alert.alert('Success', 'Poster downloaded successfully!');
                                        setShowPreviewModal(false);
                                    }
                                }}
                            >
                                <MaterialCommunityIcons name="download" size={20} color="#fff" />
                                <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>Download</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#f59e0b', padding: 14, borderRadius: 8 }}
                                onPress={() => setShowPreviewModal(false)}
                            >
                                <MaterialCommunityIcons name="pencil" size={20} color="#fff" />
                                <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>Edit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal >
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f5f9',
    },
    header: {
        height: 60,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    backText: {
        color: '#1e293b',
        fontWeight: '500',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    saveButton: {
        backgroundColor: SP_RED,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    workspace: {
        flex: 1,
        flexDirection: 'row',
    },
    leftToolbar: {
        flex: 0.15,
        minWidth: 70,
        maxWidth: 150,
        backgroundColor: '#f8fafc',
        borderRightWidth: 1,
        borderRightColor: '#e2e8f0',
    },
    leftToolbarContent: {
        paddingVertical: 16,
        paddingHorizontal: 8,
        gap: 8,
        alignItems: 'center',
    },
    toolbarHeader: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 12,
    },
    toolbarHeaderGradient: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: SP_RED,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: SP_RED,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    toolbarHeaderText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#1e293b',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    toolItem: {
        alignItems: 'center',
        gap: 5,
        paddingVertical: 10,
        paddingHorizontal: 6,
        borderRadius: 12,
        width: '100%',
        position: 'relative',
    },
    toolIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    selectedTool: {
        backgroundColor: 'rgba(227, 5, 18, 0.05)',
    },
    selectedToolIconContainer: {
        backgroundColor: SP_RED,
        borderColor: SP_RED,
        shadowColor: SP_RED,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        transform: [{ scale: 1.05 }],
    },
    selectedToolIndicator: {
        position: 'absolute',
        left: -8,
        top: '50%',
        marginTop: -12,
        width: 4,
        height: 24,
        backgroundColor: SP_RED,
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
    },
    toolName: {
        fontSize: 9,
        color: '#64748b',
        fontWeight: '500',
        textAlign: 'center',
    },
    selectedToolText: {
        color: SP_RED,
        fontWeight: '700',
    },
    toolbarFooter: {
        width: '100%',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 16,
    },
    toolbarDivider: {
        width: '60%',
        height: 1,
        backgroundColor: '#e2e8f0',
        marginBottom: 8,
    },
    toolbarFooterText: {
        fontSize: 9,
        color: '#94a3b8',
        fontWeight: '500',
    },
    canvasArea: {
        flex: 0.55,
        backgroundColor: '#e2e8f0',
    },
    canvasScrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    zoomControls: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 8,
        gap: 12,
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        zIndex: 10,
    },
    zoomButton: {
        padding: 4,
    },
    zoomText: {
        color: '#1e293b',
        fontSize: 12,
        fontWeight: '600',
    },
    canvas: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        position: 'relative',
    },
    baseImage: {
        width: '100%',
    },
    rightPanel: {
        flex: 0.30,
        minWidth: 280,
        maxWidth: 400,
        backgroundColor: '#fff',
        borderLeftWidth: 1,
        borderLeftColor: '#e2e8f0',
        padding: 20,
    },
    panelTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#1e293b',
    },
    element: {
        padding: 4,
    },
    elementImage: {
        width: 100,
        height: 100,
    },
    controlBtn: {
        position: 'absolute',
        backgroundColor: SP_RED,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    controlBtnTL: {
        top: -12,
        left: -12,
    },
    controlBtnTR: {
        top: -12,
        right: -12,
    },
    controlBtnBL: {
        bottom: -12,
        left: -12,
    },
    controlBtnBR: {
        bottom: -12,
        right: -12,
    },
    propLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748b',
        marginBottom: 8,
        marginTop: 16,
    },
    propInput: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        padding: 8,
        fontSize: 14,
    },
    row: {
        flexDirection: 'row',
        gap: 8,
    },
    propBtn: {
        backgroundColor: '#f1f5f9',
        padding: 8,
        borderRadius: 4,
        minWidth: 40,
        alignItems: 'center',
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    colorDot: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    deleteButtonFull: {
        backgroundColor: '#ef4444',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 32,
    },
    emptyState: {
        color: '#94a3b8',
        fontStyle: 'italic',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalBackdrop: {
        flex: 1,
    },
    bottomSheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 40,
        height: '40%',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    closeButton: {
        padding: 4,
    },
    carouselContent: {
        alignItems: 'center',
    },
    carouselItem: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    framePreviewContainer: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        overflow: 'hidden',
        padding: 12,
    },
    selectedFrameBorder: {
        borderColor: SP_RED,
    },
    templateName: {
        padding: 12,
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b',
        textAlign: 'center',
    },
    selectedTemplateName: {
        color: SP_RED,
        fontWeight: 'bold',
    },
    formField: {
        marginBottom: 20,
    },
    formLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
    },
    formInput: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#0f172a',
    },
    saveFormButton: {
        backgroundColor: SP_RED,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    saveFormButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    // Filter Styles
    filterItem: {
        alignItems: 'center',
        marginRight: 16,
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    selectedFilterItem: {
        borderColor: SP_RED,
        backgroundColor: '#fff',
    },
    filterPreviewContainer: {
        width: 100,
        height: 120,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 8,
        position: 'relative',
    },
    filterPreviewImage: {
        width: '100%',
        height: '100%',
    },
    filterPreviewOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    filterName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        textAlign: 'center',
    },
    selectedFilterName: {
        color: SP_RED,
    },
    // Tool Sidebar Styles
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    helpText: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 16,
        lineHeight: 20,
    },
    toolActionButton: {
        backgroundColor: SP_RED,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    toolActionText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    filterOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#f8fafc',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        gap: 12,
    },
    selectedFilterOption: {
        borderColor: SP_RED,
        backgroundColor: '#fff',
    },
    filterPreview: {
        width: 40,
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    filterOptionText: {
        flex: 1,
        fontSize: 16,
        color: '#1e293b',
        fontWeight: '500',
    },
    selectedFilterOptionText: {
        color: SP_RED,
        fontWeight: '600',
    },
    frameOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#f8fafc',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        gap: 12,
    },
    selectedFrameOption: {
        borderColor: SP_RED,
        backgroundColor: '#fff',
    },
    framePreview: {
        width: '100%',
        height: 120,
        borderRadius: 10,
        overflow: 'hidden',
    },
    frameOptionText: {
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 8,
    },
    selectedFrameOptionText: {
        color: SP_RED,
        fontWeight: '700',
    },
    frameCard: {
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    selectedFrameCard: {
        borderColor: SP_RED,
        backgroundColor: '#fff',
    },
    customizeLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
    },
    customizeValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
        marginHorizontal: 16,
        minWidth: 40,
        textAlign: 'center',
    },
    layoutOption: {
        padding: 16,
        borderRadius: 8,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    layoutOptionText: {
        fontSize: 16,
        color: '#1e293b',
        fontWeight: '500',
        textAlign: 'center',
    },
    // Poster Gallery Styles
    posterItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        gap: 12,
    },
    selectedPosterItem: {
        borderColor: SP_RED,
        backgroundColor: '#fff',
    },
    posterThumbnail: {
        width: 60,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#e2e8f0',
    },
    posterTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    posterCategory: {
        fontSize: 12,
        color: '#64748b',
    },
    // Customization Styles
    customElementButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        borderRadius: 10,
        backgroundColor: '#f8fafc',
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    selectedCustomElementButton: {
        backgroundColor: SP_RED,
        borderColor: SP_RED,
    },
    customElementButtonText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
        marginLeft: 10,
    },
    selectedCustomElementButtonText: {
        color: '#fff',
    },
    customizationPanel: {
        marginTop: 12,
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    customSection: {
        marginBottom: 16,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#f8fafc',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        marginHorizontal: 4,
        alignItems: 'center',
    },
    activeTypeButton: {
        backgroundColor: SP_RED,
        borderColor: SP_RED,
    },
    typeButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    activeTypeButtonText: {
        color: '#fff',
    },
    gradientOption: {
        alignItems: 'center',
        padding: 8,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        backgroundColor: '#fff',
        minWidth: 80,
    },
    selectedGradientOption: {
        borderColor: SP_RED,
    },
    gradientPreview: {
        width: 60,
        height: 40,
        borderRadius: 6,
        marginBottom: 6,
    },
    gradientName: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748b',
        textAlign: 'center',
    },
    gradientGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'space-between',
    },
    fontButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#f8fafc',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        marginBottom: 8,
    },
    selectedFontButton: {
        backgroundColor: SP_RED,
        borderColor: SP_RED,
    },
    fontButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1e293b',
    },
    selectedFontButtonText: {
        color: '#fff',
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 6,
    },
    textInput: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#1e293b',
    },
    socialIconButton: {
        width: 44,
        height: 44,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedSocialIconButton: {
        borderColor: SP_RED,
        backgroundColor: SP_RED,
    },
});
