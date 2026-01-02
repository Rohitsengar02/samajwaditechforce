import React, { useState, useRef, useEffect } from 'react';
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
    PixelRatio
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
import { removeBackground as imglyRemoveBackground } from '../utils/backgroundRemoval';
import { getApiUrl } from '../utils/api';
import { TEMPLATES, RenderBottomBar } from '../components/posteredit/MobileBottomBarTemplates';
import FrameSelector from '../components/posteredit/FrameSelector';
import { FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const SP_RED = '#E30512';
const BANNER_HEIGHT = 60; // Reduced from 80

// Calculate available canvas height to fit in one view without scrolling
// Be aggressive with deductions to ensure no scrolling
const HEADER_HEIGHT = 60;
const TOOLBAR_HEIGHT = 140; // Increased to account for text editing toolbar
const ZOOM_HEIGHT = 50;
const SAFE_AREA = 100;
const MAX_CANVAS_HEIGHT = height - HEADER_HEIGHT - TOOLBAR_HEIGHT - ZOOM_HEIGHT - SAFE_AREA;

// API URL Helper


const API_URL = getApiUrl();

// Types
type ToolType = 'text' | 'image' | 'music' | 'layout' | 'banner' | 'filter' | 'frame' | 'shape' | 'draw' | 'bg' | 'content' | 'customize';

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
    backgroundColor?: string;
    fontSize?: number;
    fontFamily?: string;
    // Image specific
    imageWidth?: number;
    imageHeight?: number;
    borderWidth?: number;
    borderColor?: string;
    borderRadius?: number;
}

interface PosterAsset {
    _id: string;
    title: string;
    imageUrl: string;
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

export default function PosterEditor() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { imageUrl, title } = params;

    const canvasRef = useRef(null);
    const [elements, setElements] = useState<EditorElement[]>([]);
    const [selectedTool, setSelectedTool] = useState<ToolType | null>(null);
    // Initial canvas fits in view - will be adjusted based on image aspect ratio
    const [canvasSize, setCanvasSize] = useState({ w: width, h: Math.min(width, MAX_CANVAS_HEIGHT) });
    const [bannerText, setBannerText] = useState('Samajwadi Party');
    const [showTextModal, setShowTextModal] = useState(false);
    const [newText, setNewText] = useState('');

    // Selection State
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Main Image State (can be swapped)
    const [currentImage, setCurrentImage] = useState(imageUrl as string);

    // Layout Modal State
    const [showLayoutModal, setShowLayoutModal] = useState(false);
    const [posterName, setPosterName] = useState(title as string || 'My Poster');
    const [selectedRatio, setSelectedRatio] = useState('1:1');
    const [customSize, setCustomSize] = useState({ w: '1080', h: '1080' });

    // Banner/Poster Selection Modal State
    const [showBannerModal, setShowBannerModal] = useState(false);
    const [posterAssets, setPosterAssets] = useState<PosterAsset[]>([]);
    const [loadingAssets, setLoadingAssets] = useState(false);

    // Image Processing Modal State
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
    const [processedImageUri, setProcessedImageUri] = useState<string | null>(null);
    const [isProcessingBg, setIsProcessingBg] = useState(false);

    // Zoom State - Start at 80%
    const [zoomScale, setZoomScale] = useState(0.8);

    // Bottom Bar Template Modal State
    const [showBottomBarModal, setShowBottomBarModal] = useState(false);
    const [selectedBottomBarTemplate, setSelectedBottomBarTemplate] = useState(TEMPLATES[0].id);
    const [bottomBarDetails, setBottomBarDetails] = useState({
        name: 'Your Name',
        designation: 'Designation',
        mobile: '+91 XXXXX XXXXX',
        social: '@username',
        socialPlatform: 'instagram',
        address: 'Your Address',
        photo: null as string | null,
        photoNoBg: null as string | null,
    });
    const [showBottomBarEditForm, setShowBottomBarEditForm] = useState(false);
    const [showCustomizationModal, setShowCustomizationModal] = useState(false);

    // Footer Photo Controls
    const [footerPhotoPosition, setFooterPhotoPosition] = useState({ x: 10, y: -120 });
    const [isPhotoFlipped, setIsPhotoFlipped] = useState(false);
    const [isRemovingFooterPhotoBg, setIsRemovingFooterPhotoBg] = useState(false);


    // Frame Customization State (matching desktop)
    const [frameCustomization, setFrameCustomization] = useState({
        // Background
        backgroundType: 'gradient' as 'solid' | 'gradient',
        backgroundColor: SP_RED,
        backgroundGradient: [SP_RED, '#16a34a'],
        backgroundOpacity: 1,
        // Image
        imageSize: 80,
        imageBorderColor: '#ffffff',
        imageBorderWidth: 3,
        // Name
        nameFontSize: 14,
        nameColor: '#ffffff',
        nameBackgroundColor: 'transparent',
        // Designation
        designationFontSize: 11,
        designationColor: '#ffffff',
        designationBackgroundColor: 'transparent',
        // Mobile
        mobileFontSize: 10,
        mobileColor: '#ffffff',
        mobileBackgroundColor: 'transparent',
        // Address
        addressFontSize: 9,
        addressColor: '#ffffff',
        addressBackgroundColor: 'transparent',
        // Social
        socialFontSize: 10,
        socialColor: '#ffffff',
        socialBackgroundColor: 'transparent',
    });

    // Edit Tab State (for carousel in text/image toolbar)
    const [activeEditTab, setActiveEditTab] = useState<'move' | 'typo' | 'style'>('move');

    // Filter State
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('none');

    // Preview Modal State (desktop-like preview with download)
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isRemovingBg, setIsRemovingBg] = useState(false);

    // Poster Pan/Move State
    const posterOffsetRef = useRef({ x: 0, y: 0 });
    const [posterOffset, setPosterOffset] = useState({ x: 0, y: 0 });

    // Keep ref in sync with state
    useEffect(() => {
        posterOffsetRef.current = posterOffset;
    }, [posterOffset]);

    const posterPanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                // Capture current position at start of gesture
            },
            onPanResponderMove: (_, gestureState) => {
                setPosterOffset({
                    x: gestureState.dx,
                    y: gestureState.dy,
                });
            },
            onPanResponderRelease: (_, gestureState) => {
                // Update the base position
                posterOffsetRef.current = {
                    x: posterOffsetRef.current.x + gestureState.dx,
                    y: posterOffsetRef.current.y + gestureState.dy,
                };
                setPosterOffset(posterOffsetRef.current);
            },
        })
    ).current;

    // Tools Configuration
    const tools = [
        { id: 'content', name: 'Content', icon: 'card-account-details-star-outline' },
        { id: 'banner', name: 'Posters', icon: 'image-multiple' },
        { id: 'frame', name: 'Frames', icon: 'card-account-details-outline' },
        { id: 'customize', name: 'Style', icon: 'palette' },
        { id: 'filter', name: 'Filters', icon: 'filter-variant' },
        { id: 'text', name: 'Add Text', icon: 'format-text' },
        { id: 'image', name: 'Add Image', icon: 'image-plus' },


    ];

    // Social platform options
    const SOCIAL_PLATFORMS = [
        { id: 'facebook', name: 'Facebook', icon: 'facebook' },
        { id: 'twitter', name: 'Twitter/X', icon: 'twitter' },
        { id: 'instagram', name: 'Instagram', icon: 'instagram' },
        { id: 'youtube', name: 'YouTube', icon: 'youtube' },
        { id: 'whatsapp', name: 'WhatsApp', icon: 'whatsapp' },
        { id: 'telegram', name: 'Telegram', icon: 'send' },
    ];

    useEffect(() => {
        fetchPosterAssets();
        if (imageUrl) {
            updateCanvasToImageSize(imageUrl as string);
        }
        loadUserProfile(); // Auto-fill user data
    }, []);

    // Auto-fill from user profile
    const loadUserProfile = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            let user = null;

            // Fetch fresh data from API if token exists
            if (token) {
                try {
                    const response = await fetch(`${API_URL}/auth/profile`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        user = await response.json();
                        console.log('Fresh user data from API:', user);
                        await AsyncStorage.setItem('userInfo', JSON.stringify(user));
                    }
                } catch (apiError) {
                    console.log('API fetch failed, using cached data');
                }
            }

            // Fall back to cached data
            if (!user) {
                const userInfoStr = await AsyncStorage.getItem('userInfo');
                if (userInfoStr) {
                    user = JSON.parse(userInfoStr);
                }
            }

            if (user) {
                // Build address from nested address object
                let fullAddress = 'Your Address';
                if (user.address && typeof user.address === 'object') {
                    const parts = [
                        user.address.street,
                        user.address.city,
                        user.address.state
                    ].filter(Boolean);
                    if (parts.length > 0) {
                        fullAddress = parts.join(', ');
                    }
                } else if (user.district) {
                    fullAddress = `${user.vidhanSabha || ''}, ${user.district}`;
                }

                setBottomBarDetails({
                    name: user.name || 'Your Name',
                    designation: user.partyRole || 'Designation',
                    mobile: user.phone || '+91 XXXXX XXXXX',
                    social: user.socialHandle || (user.email ? `@${user.email.split('@')[0]}` : '@username'),
                    socialPlatform: user.socialPlatform || 'instagram',
                    address: fullAddress,
                    photo: user.profileImage || null,
                    photoNoBg: user.profileImageNoBg || null,
                });
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    };

    const fetchPosterAssets = async () => {
        try {
            setLoadingAssets(true);
            // API_URL already includes /api, so don't add it again
            const url = `${API_URL}/posters?limit=100`;
            console.log('Fetching posters from:', url);
            const response = await fetch(url);

            if (!response.ok) {
                console.error('Poster fetch failed with status:', response.status);
                return;
            }

            const data = await response.json();
            console.log('Poster API response:', JSON.stringify(data).substring(0, 200));

            // Handle different response formats
            if (data.posters && Array.isArray(data.posters)) {
                // Backend returns { posters: [...] }
                console.log('Found', data.posters.length, 'posters');
                setPosterAssets(data.posters);
            } else if (data.success && data.data && Array.isArray(data.data)) {
                setPosterAssets(data.data);
            } else if (Array.isArray(data)) {
                setPosterAssets(data);
            } else {
                console.log('Unknown response format:', Object.keys(data));
            }
        } catch (error) {
            console.error('Error fetching poster assets:', error);
        } finally {
            setLoadingAssets(false);
        }
    };

    const updateCanvasToImageSize = (uri: string) => {
        Image.getSize(uri, (w, h) => {
            const aspectRatio = h / w;
            let newWidth = width; // Always full screen width
            let newHeight = newWidth * aspectRatio; // Same as image height

            // Cap height at max but keep width at full screen
            if (newHeight > MAX_CANVAS_HEIGHT) {
                newHeight = MAX_CANVAS_HEIGHT;
            }

            setCanvasSize({ w: newWidth, h: newHeight });
        }, (error) => {
            console.error('Error getting image size:', error);
        });
    };

    const handlePosterSelect = (uri: string) => {
        setCurrentImage(uri);
        updateCanvasToImageSize(uri);
        setShowBannerModal(false);
    };

    const handleZoom = (increment: boolean) => {
        setZoomScale(prev => {
            const newScale = increment ? prev + 0.1 : prev - 0.1;
            return Math.max(0.5, Math.min(newScale, 3));
        });
    };

    const handleToolPress = async (toolId: string) => {
        const tool = toolId as ToolType;
        setSelectedTool(tool);
        setSelectedElementId(null); // Deselect element when switching main tools

        switch (tool) {
            case 'text':
                // Add text directly to canvas and select it
                const newTextElement: EditorElement = {
                    id: Date.now().toString(),
                    type: 'text',
                    content: 'Your Text',
                    x: canvasSize.w / 2 - 50,
                    y: canvasSize.h / 2 - 20,
                    scale: 1,
                    rotation: 0,
                    isFlipped: false,
                    color: '#ffffff',
                    fontSize: 24,
                    fontFamily: 'System'
                };
                setElements(prev => [...prev, newTextElement]);
                setSelectedElementId(newTextElement.id);
                setActiveEditTab('move');
                break;
            case 'image':
                // Open image picker directly
                const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: false,
                    quality: 1,
                });
                if (!result.canceled && result.assets[0]) {
                    const newImageElement: EditorElement = {
                        id: Date.now().toString(),
                        type: 'image',
                        content: result.assets[0].uri,
                        x: canvasSize.w / 2 - 50,
                        y: canvasSize.h / 2 - 50,
                        scale: 1,
                        rotation: 0,
                        isFlipped: false,
                        imageWidth: 100,
                        imageHeight: 100,
                        borderWidth: 0,
                        borderColor: '#ffffff',
                        borderRadius: 0,
                    };
                    setElements(prev => [...prev, newImageElement]);
                    setSelectedElementId(newImageElement.id);
                    setActiveEditTab('move');
                }
                break;
            case 'layout':
                setShowLayoutModal(true);
                break;
            case 'banner':
                setShowBannerModal(true);
                break;
            case 'frame':
                setShowBottomBarModal(true);
                break;
            case 'content':
                setShowBottomBarEditForm(true);
                break;
            case 'filter':
                setShowFilterModal(true);
                break;
            case 'customize':
                setShowCustomizationModal(true);
                break;
            case 'music':
                Alert.alert('Coming Soon', 'Music feature will be available in the next update!');
                break;
            default:
                break;
        }
    };

    const applyLayout = () => {
        let newWidth = width; // Full screen width
        let newHeight = newWidth;
        let aspectRatio = 1;

        if (selectedRatio === 'custom') {
            const w = parseInt(customSize.w) || 1080;
            const h = parseInt(customSize.h) || 1080;
            aspectRatio = h / w;
        } else {
            const [w, h] = selectedRatio.split(':').map(Number);
            aspectRatio = h / w;
        }

        newHeight = (newWidth * aspectRatio) + BANNER_HEIGHT;

        // Scale down to fit if needed
        if (newHeight > MAX_CANVAS_HEIGHT) {
            newHeight = MAX_CANVAS_HEIGHT;
            newWidth = (newHeight - BANNER_HEIGHT) / aspectRatio;
        }

        setCanvasSize({ w: newWidth, h: newHeight });
        setShowLayoutModal(false);
    };



    const pickImageForModal = async (crop = false) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: crop, // Enable cropping if requested
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImageUri(result.assets[0].uri);
            setProcessedImageUri(null); // Reset processed image when new one picked

            // Auto-trigger background removal logic immediately
            // We use a slight timeout to allow state to settle
            setTimeout(() => {
                // Reuse existing removeBackground function but we need to ensure state is set
                // Since setState is async, we might need to pass URI directly or use a ref
                // For simplicity, we'll assume the component re-renders quickly or we call a version that takes URI
                triggerAutoBgRemoval(result.assets[0].uri);
            }, 100);
        }
    };

    // Helper to trigger BG removal automatically
    const triggerAutoBgRemoval = async (uri: string) => {
        try {
            setIsProcessingBg(true);
            const { removeBackground } = require('../utils/backgroundRemovalApi');

            if (Platform.OS === 'web') {
                // Web implementation (simplified)
                const blob = await imglyRemoveBackground(uri);
                const url = URL.createObjectURL(blob);
                setProcessedImageUri(url);
                setIsProcessingBg(false);
                return;
            }

            // Mobile Implementation
            const formData = new FormData();
            formData.append('image', {
                uri: uri,
                name: 'image.jpg',
                type: 'image/jpeg',
            } as any);

            const response = await fetch(`${API_URL}/ai-gemini/remove-background`, {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: formData,
            });

            const data = await response.json();
            if (data.success) {
                setProcessedImageUri(data.image);
            }
        } catch (e) {
            console.log("Auto BG Remove Failed", e);
        } finally {
            setIsProcessingBg(false);
        }
    };

    const removeBackground = async () => {
        if (!selectedImageUri) return;

        try {
            setIsProcessingBg(true);

            if (Platform.OS === 'web') {
                const blob = await imglyRemoveBackground(selectedImageUri);
                const url = URL.createObjectURL(blob);
                setProcessedImageUri(url);
                Alert.alert('Success', 'Background removed successfully!');
                setIsProcessingBg(false);
                return;
            }

            const formData = new FormData();
            formData.append('image', {
                uri: selectedImageUri,
                name: 'image.jpg',
                type: 'image/jpeg',
            } as any);

            const response = await fetch(`${API_URL}/ai-gemini/remove-background`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                },
                body: formData,
            });

            const data = await response.json();
            if (data.success) {
                setProcessedImageUri(data.image);
                Alert.alert('Success', 'Background removed successfully!');
            } else {
                Alert.alert('Error', data.error || 'Failed to remove background');
            }
        } catch (error) {
            console.error('BG Remove Error:', error);
            Alert.alert('Error', 'Failed to remove background');
        } finally {
            setIsProcessingBg(false);
        }
    };

    const addImageToPoster = () => {
        const imageToAdd = processedImageUri || selectedImageUri;
        if (imageToAdd) {
            addElement('image', imageToAdd);
            setShowImageModal(false);
        }
    };

    // Remove Background from Footer User Photo (Free Local Service)
    const handleRemoveFooterPhotoBg = async (arg?: boolean | any) => {
        const silent = typeof arg === 'boolean' ? arg : false;
        if (!bottomBarDetails.photo) {
            if (!silent) Alert.alert('No Photo', 'Please upload a photo first');
            return;
        }

        setIsRemovingFooterPhotoBg(true);
        try {
            // Import and use our background removal utility with fallback
            const { removeBackground } = require('../utils/backgroundRemovalApi');
            const result = await removeBackground(bottomBarDetails.photo);

            setBottomBarDetails(prev => ({
                ...prev,
                photoNoBg: result.url,
            }));

            if (!silent) {
                Alert.alert(
                    result.success ? 'Success' : 'Info',
                    result.message
                );
            }
        } catch (error: any) {
            console.error('Background removal error:', error);
            if (!silent) {
                Alert.alert(
                    'Service Not Running',
                    'Background removal service is not running.\n\nTo start it:\n1. Open Terminal in project folder\n2. Run: ./start_bg_service.sh',
                    [{ text: 'OK' }]
                );
            }
        } finally {
            setIsRemovingFooterPhotoBg(false);
        }
    };

    // Auto-trigger BG removal for footer photo if present
    useEffect(() => {
        if (bottomBarDetails.photo && !bottomBarDetails.photoNoBg) {
            const timer = setTimeout(() => {
                handleRemoveFooterPhotoBg(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [bottomBarDetails.photo]);


    // Legacy direct pick (not used for 'image' tool anymore, but kept if needed)
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            addElement('image', result.assets[0].uri);
        }
    };

    const addElement = (type: 'text' | 'image' | 'sticker', content: string) => {
        const newElement: EditorElement = {
            id: Date.now().toString(),
            type,
            content,
            x: type === 'image' ? (width - 120) : 50, // Extreme Right
            y: type === 'image' ? (MAX_CANVAS_HEIGHT - 100) : 50, // Extreme Bottom
            scale: 1,
            rotation: 0,
            isFlipped: false,
            color: '#000000',
            fontSize: 24,
            fontFamily: 'System',
            // Set reasonable default size for images (small to fit poster well)
            imageWidth: type === 'image' ? 50 : undefined,
            imageHeight: type === 'image' ? 50 : undefined,
        };
        setElements([...elements, newElement]);
        setSelectedElementId(newElement.id); // Auto-select new element
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

    // Background Removal Function - Uses Gemini API for all platforms (Web, Android, iOS)
    const handleRemoveBackground = async (elementId: string, imageUri: string) => {
        setIsRemovingBg(true);

        try {
            // Use our background removal utility
            const { removeBackground } = require('../utils/backgroundRemovalApi');
            const result = await removeBackground(imageUri);

            if (result.success) {
                // Update the element with the processed image
                updateElement(elementId, { content: result.url });
                Alert.alert('Success', result.message);
            } else {
                // Show info message if service unavailable
                Alert.alert('Info', result.message);
                // Still update with original image
                updateElement(elementId, { content: result.url });
            }
        } catch (error) {
            console.error('Background removal failed:', error);
            Alert.alert('Error', 'Failed to remove background. Please try again.');
        } finally {
            setIsRemovingBg(false);
        }
    };

    const handleSave = async (action: 'download' | 'share' = 'download') => {
        try {
            setSelectedElementId(null); //  Deselect before saving to hide border
            setIsSaving(true);

            // Wait for state updates and images to fully load
            await new Promise(resolve => setTimeout(resolve, 800));

            try {
                let uri: string;

                if (Platform.OS === 'web') {
                    // For web, we need to use html2canvas
                    const canvasElement = canvasRef.current as any;
                    if (!canvasElement) {
                        throw new Error('Canvas ref not found');
                    }

                    // Dynamically load html2canvas if not available
                    if (typeof window !== 'undefined' && !(window as any).html2canvas) {
                        console.log('Loading html2canvas from CDN...');
                        await new Promise((resolve, reject) => {
                            const script = document.createElement('script');
                            script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
                            script.onload = resolve;
                            script.onerror = reject;
                            document.head.appendChild(script);
                        });
                    }

                    if ((window as any).html2canvas) {
                        const html2canvas = (window as any).html2canvas;

                        // Capture the canvas with CORS support
                        const canvas = await html2canvas(canvasElement, {
                            useCORS: true,
                            allowTaint: false,
                            backgroundColor: '#E30512',
                            scale: 2, // Higher quality
                            logging: false,
                        });

                        uri = canvas.toDataURL('image/png');

                        // Download the image
                        const link = document.createElement('a');
                        link.href = uri;
                        link.download = `${posterName.replace(/\s+/g, '-').toLowerCase()}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);

                        Alert.alert('Success', 'Poster downloaded successfully!');
                    } else {
                        throw new Error('html2canvas failed to load');
                    }
                } else {
                    // For mobile, use captureRef
                    uri = await captureRef(canvasRef, {
                        format: 'png',
                        quality: 1.0,
                    });

                    if (action === 'share') {
                        await Sharing.shareAsync(uri);
                    } else {
                        // Save to Gallery
                        const { status } = await MediaLibrary.requestPermissionsAsync(true);
                        if (status === 'granted') {
                            await MediaLibrary.saveToLibraryAsync(uri);
                            Alert.alert('Success', 'Poster saved to gallery!');
                        } else {
                            Alert.alert('Permission Required', 'Please grant permission to save photos to your gallery.');
                        }
                    }
                }
            } catch (innerError: any) {
                console.error('Capture error:', innerError);

                // Provide helpful error message
                const errorMsg = innerError?.message || '';
                if (errorMsg.includes('tainted') || errorMsg.includes('CORS') || errorMsg.includes('cross-origin')) {
                    Alert.alert(
                        'Download Error - CORS Issue',
                        'The images cannot be downloaded due to browser security restrictions.\n\n' +
                        'Solutions:\n' +
                        '1. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)\n' +
                        '2. Clear browser cache and reload\n' +
                        '3. Use a different browser\n' +
                        '4. Use the mobile app instead\n\n' +
                        'Technical: Images must be served with CORS headers.'
                    );
                } else if (errorMsg.includes('html2canvas')) {
                    Alert.alert(
                        'Download Error',
                        'Failed to load the download library. Please check your internet connection and try again.'
                    );
                } else {
                    Alert.alert('Error', `Failed to download poster: ${errorMsg.substring(0, 100)}`);
                }
            } finally {
                setIsSaving(false);
            }
        } catch (error) {
            console.error('Save error:', error);
            Alert.alert('Error', 'Failed to save poster');
            setIsSaving(false);
        }
    };

    // Draggable Element Component
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
                onMoveShouldSetPanResponder: () => true,
                onPanResponderGrant: () => {
                    setIsDragging(true);
                    setSelectedElementId(element.id);
                    setActiveEditTab('move');
                    setDragStartPos({ x: element.x, y: element.y });
                    setCurrentGesture({ dx: 0, dy: 0 });
                },
                onPanResponderMove: (_, gestureState) => {
                    // Update position smoothly during drag
                    setCurrentGesture({ dx: gestureState.dx, dy: gestureState.dy });
                },
                onPanResponderRelease: (_, gestureState) => {
                    setIsDragging(false);
                    // Update final position
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

        const rotateResponder = useRef(
            PanResponder.create({
                onStartShouldSetPanResponder: () => true,
                onPanResponderGrant: () => setIsDragging(true),
                onPanResponderMove: (_, gestureState) => {
                    const r = element.rotation + (gestureState.dx / 2);
                    rotation.setValue(r);
                },
                onPanResponderRelease: (_, gestureState) => {
                    setIsDragging(false);
                    const newRotation = element.rotation + (gestureState.dx / 2);
                    updateElement(element.id, { rotation: newRotation });
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
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => {
                        setSelectedElementId(element.id);
                        setActiveEditTab('move');
                    }}
                >
                    <Animated.View
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
                        <View style={{ transform: [{ scaleX: element.isFlipped ? -1 : 1 }] }}>
                            {element.type === 'text' ? (
                                <Text style={[
                                    styles.elementText,
                                    {
                                        color: element.color,
                                        fontSize: element.fontSize,
                                        fontFamily: element.fontFamily,
                                        backgroundColor: element.backgroundColor || 'transparent',
                                        paddingHorizontal: element.backgroundColor && element.backgroundColor !== 'transparent' ? 8 : 0,
                                        paddingVertical: element.backgroundColor && element.backgroundColor !== 'transparent' ? 4 : 0,
                                        borderRadius: 4,
                                        overflow: 'hidden',
                                    }
                                ]}>
                                    {element.content}
                                </Text>
                            ) : (
                                <Image
                                    source={{ uri: element.content }}
                                    style={{
                                        width: element.imageWidth || 100,
                                        height: element.imageHeight || 100,
                                        borderWidth: element.borderWidth || 0,
                                        borderColor: element.borderColor || '#ffffff',
                                        borderRadius: element.borderRadius || 0,
                                    }}
                                    {...(Platform.OS === 'web' ? { crossOrigin: 'anonymous' } : {})}
                                />
                            )}
                        </View>
                    </Animated.View>
                </TouchableOpacity>
            </View>
        );
    };

    const selectedElement = elements.find(el => el.id === selectedElementId);

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <Ionicons name="close" size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{posterName}</Text>
                <TouchableOpacity
                    onPress={async () => {
                        try {
                            setSelectedElementId(null); // Deselect before capturing
                            await new Promise(resolve => setTimeout(resolve, 100));

                            if (Platform.OS === 'web') {
                                // Web: Use html2canvas for HD quality
                                const canvasElement = canvasRef.current as any;
                                if (!canvasElement) {
                                    Alert.alert('Error', 'Canvas not found');
                                    return;
                                }

                                // Dynamically load html2canvas if not available
                                if (typeof window !== 'undefined' && !(window as any).html2canvas) {
                                    const script = document.createElement('script');
                                    script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
                                    await new Promise((resolve, reject) => {
                                        script.onload = resolve;
                                        script.onerror = reject;
                                        document.head.appendChild(script);
                                    });
                                }

                                const html2canvas = (window as any).html2canvas;
                                const canvas = await html2canvas(canvasElement, {
                                    useCORS: true,
                                    allowTaint: false,
                                    backgroundColor: '#ffffff',
                                    scale: 4, // HD Quality - 4x resolution
                                    logging: false,
                                });

                                const uri = canvas.toDataURL('image/png');
                                setPreviewImageUri(uri);
                                setShowPreviewModal(true);
                            } else {
                                // Mobile: Use captureRef with HIGH QUALITY settings
                                const uri = await captureRef(canvasRef, {
                                    format: 'png',                    // PNG for maximum quality
                                    quality: 1,                       // No compression
                                    result: 'tmpfile',                // Better performance
                                    width: canvasSize.w,              // Original width
                                    height: canvasSize.h,             // Original height  
                                    pixelRatio: PixelRatio.get() * 2, // 🔥 Retina quality (2x device pixel ratio)
                                } as any);
                                setPreviewImageUri(uri);
                                setShowPreviewModal(true);
                            }
                        } catch (error) {
                            console.error('Preview generation error:', error);
                            Alert.alert('Error', 'Failed to generate preview');
                        }
                    }}
                    style={styles.saveButton}
                >
                    <MaterialCommunityIcons name="eye" size={18} color="#fff" style={{ marginRight: 4 }} />
                    <Text style={styles.saveButtonText}>Preview</Text>
                </TouchableOpacity>
            </View>

            {/* Main Canvas Area */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollViewContent, { justifyContent: 'flex-start', paddingTop: 10, alignItems: 'center' }]}
                scrollEnabled={!isDragging} // Disable scroll when dragging element
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
            >
                {/* Poster Container - Full Width */}
                <View style={{
                    width: width,
                    alignItems: 'center',
                    justifyContent: 'flex-start'
                }}>
                    {/* Scalable Canvas */}
                    <View
                        style={{
                            transform: [{ scale: zoomScale }],
                            transformOrigin: 'top center'
                        }}
                    >
                        <View
                            ref={canvasRef}
                            style={[
                                styles.canvas,
                                { height: canvasSize.h, width: canvasSize.w }
                            ]}
                        >
                            {/* Base Poster Image */}
                            <Image
                                source={{ uri: currentImage }}
                                style={[
                                    styles.baseImage,
                                    { height: canvasSize.h }
                                ]}
                                resizeMode="contain"
                                {...(Platform.OS === 'web' ? { crossOrigin: 'anonymous' } : {})}
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

                            {/* Dynamic Footer Bottom Bar - Positioned at Bottom */}
                            <View
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    minHeight: canvasSize.h * 0.12,
                                    maxHeight: canvasSize.h * 0.25,
                                    width: '100%',
                                    zIndex: 10,
                                }}>
                                <RenderBottomBar
                                    template={selectedBottomBarTemplate}
                                    details={bottomBarDetails}
                                    width={canvasSize.w}
                                    customization={frameCustomization}
                                    photoPosition={footerPhotoPosition}
                                    isPhotoFlipped={isPhotoFlipped}
                                />
                            </View>

                            {/* Added Elements - Rendered last with highest z-index */}
                            {elements.map((el, index) => (
                                <View key={el.id} style={{ zIndex: 100 + index }}>
                                    <DraggableItem element={el} />
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView >

            {/* Zoom Controls - Horizontal Layout */}
            <View style={styles.zoomControls}>
                <TouchableOpacity onPress={() => handleZoom(false)} style={styles.zoomButton}>
                    <Ionicons name="remove" size={22} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.zoomText}>{Math.round(zoomScale * 100)}%</Text>
                <TouchableOpacity onPress={() => handleZoom(true)} style={styles.zoomButton}>
                    <Ionicons name="add" size={22} color="#1e293b" />
                </TouchableOpacity>
                <View style={{ width: 1, height: 20, backgroundColor: '#cbd5e1', marginHorizontal: 6 }} />
                <TouchableOpacity
                    onPress={() => setZoomScale(1)}
                    style={[styles.zoomButton, { flexDirection: 'row', alignItems: 'center' }]}
                >
                    <Ionicons name="refresh" size={16} color="#1e293b" />
                    <Text style={{ fontSize: 10, color: '#64748b', marginLeft: 2 }}>Reset</Text>
                </TouchableOpacity>
            </View>

            {/* Bottom Toolbar - Safe from navbar */}
            < SafeAreaView edges={['bottom']} style={styles.toolbarContainer} >
                {selectedElement && selectedElement.type === 'text' ? (
                    // Text Editing Toolbar with Carousel
                    <View style={styles.textToolbar}>
                        {/* Text Input - Always visible above tabs */}
                        <TextInput
                            style={[styles.editTextInput, { marginBottom: 12 }]}
                            value={selectedElement.content}
                            onChangeText={(text) => updateElement(selectedElement.id, { content: text })}
                            placeholder="Type text here..."
                            placeholderTextColor="#94a3b8"
                        />

                        {/* Header with tabs */}
                        <View style={styles.textToolbarHeader}>
                            <View style={{ flexDirection: 'row', gap: 0 }}>
                                <TouchableOpacity
                                    onPress={() => setActiveEditTab('move')}
                                    style={{
                                        paddingHorizontal: 20,
                                        paddingVertical: 10,
                                        backgroundColor: activeEditTab === 'move' ? SP_RED : '#f1f5f9',
                                        borderTopLeftRadius: 25,
                                        borderBottomLeftRadius: 25,
                                        borderWidth: 1,
                                        borderColor: activeEditTab === 'move' ? SP_RED : '#e2e8f0',
                                    }}
                                >
                                    <Text style={{ color: activeEditTab === 'move' ? '#fff' : '#64748b', fontWeight: '600', fontSize: 13 }}>Move</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setActiveEditTab('typo')}
                                    style={{
                                        paddingHorizontal: 20,
                                        paddingVertical: 10,
                                        backgroundColor: activeEditTab === 'typo' ? SP_RED : '#f1f5f9',
                                        borderTopRightRadius: 25,
                                        borderBottomRightRadius: 25,
                                        borderWidth: 1,
                                        borderColor: activeEditTab === 'typo' ? SP_RED : '#e2e8f0',
                                        borderLeftWidth: 0,
                                    }}
                                >
                                    <Text style={{ color: activeEditTab === 'typo' ? '#fff' : '#64748b', fontWeight: '600', fontSize: 13 }}>Typo</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <TouchableOpacity onPress={deleteSelectedElement} style={{ padding: 6, backgroundColor: '#fef2f2', borderRadius: 8 }}>
                                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setSelectedElementId(null)} style={{ padding: 6, backgroundColor: '#f1f5f9', borderRadius: 8 }}>
                                    <Ionicons name="close" size={18} color="#64748b" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Move Tab Content */}
                        {activeEditTab === 'move' && (
                            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                                    <TouchableOpacity
                                        onPressIn={() => {
                                            const interval = setInterval(() => {
                                                setElements(prev => prev.map(el =>
                                                    el.id === selectedElement.id ? { ...el, x: el.x - 5 } : el
                                                ));
                                            }, 50);
                                            (global as any).moveInterval = interval;
                                        }}
                                        onPressOut={() => clearInterval((global as any).moveInterval)}
                                        style={{ backgroundColor: SP_RED, padding: 16, borderRadius: 14, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 }}
                                    >
                                        <Ionicons name="arrow-back" size={26} color="#fff" />
                                    </TouchableOpacity>
                                    <View style={{ flexDirection: 'column', gap: 10 }}>
                                        <TouchableOpacity
                                            onPressIn={() => {
                                                const interval = setInterval(() => {
                                                    setElements(prev => prev.map(el =>
                                                        el.id === selectedElement.id ? { ...el, y: el.y - 5 } : el
                                                    ));
                                                }, 50);
                                                (global as any).moveInterval = interval;
                                            }}
                                            onPressOut={() => clearInterval((global as any).moveInterval)}
                                            style={{ backgroundColor: SP_RED, padding: 16, borderRadius: 14, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 }}
                                        >
                                            <Ionicons name="arrow-up" size={26} color="#fff" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPressIn={() => {
                                                const interval = setInterval(() => {
                                                    setElements(prev => prev.map(el =>
                                                        el.id === selectedElement.id ? { ...el, y: el.y + 5 } : el
                                                    ));
                                                }, 50);
                                                (global as any).moveInterval = interval;
                                            }}
                                            onPressOut={() => clearInterval((global as any).moveInterval)}
                                            style={{ backgroundColor: SP_RED, padding: 16, borderRadius: 14, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 }}
                                        >
                                            <Ionicons name="arrow-down" size={26} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity
                                        onPressIn={() => {
                                            const interval = setInterval(() => {
                                                setElements(prev => prev.map(el =>
                                                    el.id === selectedElement.id ? { ...el, x: el.x + 5 } : el
                                                ));
                                            }, 50);
                                            (global as any).moveInterval = interval;
                                        }}
                                        onPressOut={() => clearInterval((global as any).moveInterval)}
                                        style={{ backgroundColor: SP_RED, padding: 16, borderRadius: 14, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 }}
                                    >
                                        <Ionicons name="arrow-forward" size={26} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* Typo Tab Content */}
                        {activeEditTab === 'typo' && (
                            <ScrollView
                                showsVerticalScrollIndicator={true}
                                style={{ maxHeight: 200 }}
                                contentContainerStyle={{ paddingVertical: 12, gap: 16 }}
                            >
                                {/* Font Size Card */}
                                <View style={{ backgroundColor: '#f8fafc', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#e2e8f0' }}>
                                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 10 }}>Font Size</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
                                        <TouchableOpacity
                                            onPress={() => updateElement(selectedElement.id, { fontSize: Math.max(8, (selectedElement.fontSize || 24) - 2) })}
                                            style={{ backgroundColor: '#fff', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' }}
                                        >
                                            <Ionicons name="remove" size={20} color="#1e293b" />
                                        </TouchableOpacity>
                                        <Text style={{ fontSize: 24, fontWeight: '700', color: '#1e293b', minWidth: 50, textAlign: 'center' }}>{selectedElement.fontSize}</Text>
                                        <TouchableOpacity
                                            onPress={() => updateElement(selectedElement.id, { fontSize: (selectedElement.fontSize || 24) + 2 })}
                                            style={{ backgroundColor: '#fff', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' }}
                                        >
                                            <Ionicons name="add" size={20} color="#1e293b" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Text Color Card */}
                                <View style={{ backgroundColor: '#f8fafc', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#e2e8f0' }}>
                                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 10 }}>Text Color</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <View style={{ flexDirection: 'row', gap: 10 }}>
                                            {COLORS.map(color => (
                                                <TouchableOpacity
                                                    key={color}
                                                    style={[
                                                        { width: 36, height: 36, borderRadius: 18, backgroundColor: color, justifyContent: 'center', alignItems: 'center' },
                                                        selectedElement.color === color && { borderWidth: 3, borderColor: '#1e293b' }
                                                    ]}
                                                    onPress={() => updateElement(selectedElement.id, { color })}
                                                >
                                                    {selectedElement.color === color && <Ionicons name="checkmark" size={18} color={color === '#ffffff' ? '#000' : '#fff'} />}
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </ScrollView>
                                </View>

                                {/* Background Color Card */}
                                <View style={{ backgroundColor: '#f8fafc', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#e2e8f0' }}>
                                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 10 }}>Background</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <View style={{ flexDirection: 'row', gap: 10 }}>
                                            <TouchableOpacity
                                                style={[
                                                    { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
                                                    selectedElement.backgroundColor === 'transparent' && { borderWidth: 3, borderColor: '#1e293b' }
                                                ]}
                                                onPress={() => updateElement(selectedElement.id, { backgroundColor: 'transparent' })}
                                            >
                                                <Ionicons name="close" size={16} color="#94a3b8" />
                                            </TouchableOpacity>
                                            {COLORS.map(color => (
                                                <TouchableOpacity
                                                    key={`bg-${color}`}
                                                    style={[
                                                        { width: 36, height: 36, borderRadius: 18, backgroundColor: color, justifyContent: 'center', alignItems: 'center' },
                                                        selectedElement.backgroundColor === color && { borderWidth: 3, borderColor: '#1e293b' }
                                                    ]}
                                                    onPress={() => updateElement(selectedElement.id, { backgroundColor: color })}
                                                >
                                                    {selectedElement.backgroundColor === color && <Ionicons name="checkmark" size={18} color={color === '#ffffff' ? '#000' : '#fff'} />}
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </ScrollView>
                                </View>

                                {/* Fonts Card */}
                                <View style={{ backgroundColor: '#f8fafc', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#e2e8f0' }}>
                                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 10 }}>Font Family</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <View style={{ flexDirection: 'row', gap: 8 }}>
                                            {FONTS.map(font => (
                                                <TouchableOpacity
                                                    key={font}
                                                    style={[
                                                        { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' },
                                                        selectedElement.fontFamily === font && { backgroundColor: SP_RED, borderColor: SP_RED }
                                                    ]}
                                                    onPress={() => updateElement(selectedElement.id, { fontFamily: font })}
                                                >
                                                    <Text style={[
                                                        { fontSize: 13, color: '#1e293b', fontWeight: '500' },
                                                        selectedElement.fontFamily === font && { color: '#fff' },
                                                        { fontFamily: font !== 'System' ? font : undefined }
                                                    ]}>{font}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </ScrollView>
                                </View>
                            </ScrollView>
                        )}
                    </View>
                ) : selectedElement && selectedElement.type === 'image' ? (
                    // Image Editing Toolbar with Carousel
                    <View style={styles.textToolbar}>
                        {/* Crop & Remove BG - Always visible above tabs */}
                        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                            <TouchableOpacity
                                onPress={async () => {
                                    const result = await ImagePicker.launchImageLibraryAsync({
                                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                        allowsEditing: true,
                                        aspect: [1, 1],
                                        quality: 1,
                                    });
                                    if (!result.canceled && result.assets[0]) {
                                        updateElement(selectedElement.id, { content: result.assets[0].uri });
                                    }
                                }}
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#f1f5f9',
                                    paddingVertical: 12,
                                    borderRadius: 10,
                                    gap: 8,
                                    borderWidth: 1,
                                    borderColor: '#e2e8f0',
                                }}
                            >
                                <Ionicons name="crop" size={20} color="#1e293b" />
                                <Text style={{ color: '#1e293b', fontWeight: '600', fontSize: 14 }}>Crop</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleRemoveBackground(selectedElement.id, selectedElement.content)}
                                disabled={isRemovingBg}
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: isRemovingBg ? '#94a3b8' : SP_RED,
                                    paddingVertical: 12,
                                    borderRadius: 10,
                                    gap: 8,
                                    opacity: isRemovingBg ? 0.8 : 1,
                                }}
                            >
                                {isRemovingBg ? (
                                    <>
                                        <ActivityIndicator size="small" color="#fff" />
                                        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>Removing...</Text>
                                    </>
                                ) : (
                                    <>
                                        <MaterialCommunityIcons name="image-remove" size={20} color="#fff" />
                                        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>Remove BG</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Header with tabs */}
                        <View style={styles.textToolbarHeader}>
                            <View style={{ flexDirection: 'row', gap: 0 }}>
                                <TouchableOpacity
                                    onPress={() => setActiveEditTab('move')}
                                    style={{
                                        paddingHorizontal: 20,
                                        paddingVertical: 10,
                                        backgroundColor: activeEditTab === 'move' ? SP_RED : '#f1f5f9',
                                        borderTopLeftRadius: 25,
                                        borderBottomLeftRadius: 25,
                                        borderWidth: 1,
                                        borderColor: activeEditTab === 'move' ? SP_RED : '#e2e8f0',
                                    }}
                                >
                                    <Text style={{ color: activeEditTab === 'move' ? '#fff' : '#64748b', fontWeight: '600', fontSize: 13 }}>Move</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setActiveEditTab('style')}
                                    style={{
                                        paddingHorizontal: 20,
                                        paddingVertical: 10,
                                        backgroundColor: activeEditTab === 'style' ? SP_RED : '#f1f5f9',
                                        borderTopRightRadius: 25,
                                        borderBottomRightRadius: 25,
                                        borderWidth: 1,
                                        borderColor: activeEditTab === 'style' ? SP_RED : '#e2e8f0',
                                        borderLeftWidth: 0,
                                    }}
                                >
                                    <Text style={{ color: activeEditTab === 'style' ? '#fff' : '#64748b', fontWeight: '600', fontSize: 13 }}>Style</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <TouchableOpacity onPress={deleteSelectedElement} style={{ padding: 6, backgroundColor: '#fef2f2', borderRadius: 8 }}>
                                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setSelectedElementId(null)} style={{ padding: 6, backgroundColor: '#f1f5f9', borderRadius: 8 }}>
                                    <Ionicons name="close" size={18} color="#64748b" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Move Tab Content */}
                        {activeEditTab === 'move' && (
                            <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <TouchableOpacity
                                        onPressIn={() => {
                                            const interval = setInterval(() => {
                                                setElements(prev => prev.map(el =>
                                                    el.id === selectedElement.id ? { ...el, x: el.x - 5 } : el
                                                ));
                                            }, 50);
                                            (global as any).moveInterval = interval;
                                        }}
                                        onPressOut={() => clearInterval((global as any).moveInterval)}
                                        style={{ backgroundColor: SP_RED, padding: 14, borderRadius: 12, elevation: 2 }}
                                    >
                                        <Ionicons name="arrow-back" size={24} color="#fff" />
                                    </TouchableOpacity>
                                    <View style={{ flexDirection: 'column', gap: 8 }}>
                                        <TouchableOpacity
                                            onPressIn={() => {
                                                const interval = setInterval(() => {
                                                    setElements(prev => prev.map(el =>
                                                        el.id === selectedElement.id ? { ...el, y: el.y - 5 } : el
                                                    ));
                                                }, 50);
                                                (global as any).moveInterval = interval;
                                            }}
                                            onPressOut={() => clearInterval((global as any).moveInterval)}
                                            style={{ backgroundColor: SP_RED, padding: 14, borderRadius: 12, elevation: 2 }}
                                        >
                                            <Ionicons name="arrow-up" size={24} color="#fff" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPressIn={() => {
                                                const interval = setInterval(() => {
                                                    setElements(prev => prev.map(el =>
                                                        el.id === selectedElement.id ? { ...el, y: el.y + 5 } : el
                                                    ));
                                                }, 50);
                                                (global as any).moveInterval = interval;
                                            }}
                                            onPressOut={() => clearInterval((global as any).moveInterval)}
                                            style={{ backgroundColor: SP_RED, padding: 14, borderRadius: 12, elevation: 2 }}
                                        >
                                            <Ionicons name="arrow-down" size={24} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity
                                        onPressIn={() => {
                                            const interval = setInterval(() => {
                                                setElements(prev => prev.map(el =>
                                                    el.id === selectedElement.id ? { ...el, x: el.x + 5 } : el
                                                ));
                                            }, 50);
                                            (global as any).moveInterval = interval;
                                        }}
                                        onPressOut={() => clearInterval((global as any).moveInterval)}
                                        style={{ backgroundColor: SP_RED, padding: 14, borderRadius: 12, elevation: 2 }}
                                    >
                                        <Ionicons name="arrow-forward" size={24} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* Style Tab Content */}
                        {activeEditTab === 'style' && (
                            <ScrollView
                                showsVerticalScrollIndicator={true}
                                style={{ maxHeight: 200 }}
                                contentContainerStyle={{ paddingVertical: 12, gap: 16 }}
                            >
                                {/* Image Size Card */}
                                <View style={{ backgroundColor: '#f8fafc', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#e2e8f0' }}>
                                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 10 }}>Image Size</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
                                        <TouchableOpacity
                                            onPress={() => updateElement(selectedElement.id, {
                                                imageWidth: Math.max(30, (selectedElement.imageWidth || 100) - 10),
                                                imageHeight: Math.max(30, (selectedElement.imageHeight || 100) - 10)
                                            })}
                                            style={{ backgroundColor: '#fff', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' }}
                                        >
                                            <Ionicons name="remove" size={20} color="#1e293b" />
                                        </TouchableOpacity>
                                        <Text style={{ fontSize: 24, fontWeight: '700', color: '#1e293b', minWidth: 60, textAlign: 'center' }}>{selectedElement.imageWidth || 100}px</Text>
                                        <TouchableOpacity
                                            onPress={() => updateElement(selectedElement.id, {
                                                imageWidth: (selectedElement.imageWidth || 100) + 10,
                                                imageHeight: (selectedElement.imageHeight || 100) + 10
                                            })}
                                            style={{ backgroundColor: '#fff', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' }}
                                        >
                                            <Ionicons name="add" size={20} color="#1e293b" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Border Card */}
                                <View style={{ backgroundColor: '#f8fafc', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#e2e8f0' }}>
                                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 10 }}>Border</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                        <TouchableOpacity
                                            onPress={() => updateElement(selectedElement.id, {
                                                borderWidth: (selectedElement.borderWidth || 0) > 0 ? 0 : 2
                                            })}
                                            style={[
                                                { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' },
                                                (selectedElement.borderWidth || 0) > 0 && { backgroundColor: SP_RED, borderColor: SP_RED }
                                            ]}
                                        >
                                            <Text style={[
                                                { fontSize: 13, fontWeight: '600', color: '#1e293b' },
                                                (selectedElement.borderWidth || 0) > 0 && { color: '#fff' }
                                            ]}>
                                                {(selectedElement.borderWidth || 0) > 0 ? '✓ On' : 'Off'}
                                            </Text>
                                        </TouchableOpacity>

                                        {/* Border Color - Only show if border is on */}
                                        {(selectedElement.borderWidth || 0) > 0 && (
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                <View style={{ flexDirection: 'row', gap: 8 }}>
                                                    {COLORS.map(color => (
                                                        <TouchableOpacity
                                                            key={`border-${color}`}
                                                            style={[
                                                                { width: 32, height: 32, borderRadius: 16, backgroundColor: color, justifyContent: 'center', alignItems: 'center' },
                                                                selectedElement.borderColor === color && { borderWidth: 3, borderColor: '#1e293b' }
                                                            ]}
                                                            onPress={() => updateElement(selectedElement.id, { borderColor: color })}
                                                        >
                                                            {selectedElement.borderColor === color && <Ionicons name="checkmark" size={16} color={color === '#ffffff' ? '#000' : '#fff'} />}
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </ScrollView>
                                        )}
                                    </View>
                                </View>

                                {/* Border Radius Card */}
                                <View style={{ backgroundColor: '#f8fafc', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#e2e8f0' }}>
                                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 10 }}>Corner Radius</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <View style={{ flexDirection: 'row', gap: 8 }}>
                                            {[
                                                { label: 'None', value: 0 },
                                                { label: 'Small', value: 8 },
                                                { label: 'Medium', value: 16 },
                                                { label: 'Large', value: 30 },
                                                { label: 'Circle', value: 999 },
                                            ].map(option => (
                                                <TouchableOpacity
                                                    key={option.label}
                                                    style={[
                                                        { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' },
                                                        selectedElement.borderRadius === option.value && { backgroundColor: SP_RED, borderColor: SP_RED }
                                                    ]}
                                                    onPress={() => updateElement(selectedElement.id, { borderRadius: option.value })}
                                                >
                                                    <Text style={[
                                                        { fontSize: 13, color: '#1e293b', fontWeight: '500' },
                                                        selectedElement.borderRadius === option.value && { color: '#fff' }
                                                    ]}>{option.label}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </ScrollView>
                                </View>
                            </ScrollView>
                        )}
                    </View>
                ) : (
                    // Main Tools
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.toolbarScroll}
                    >
                        {tools.map((tool) => (
                            <TouchableOpacity
                                key={tool.id}
                                style={styles.toolItem}
                                onPress={() => handleToolPress(tool.id)}
                            >
                                <View style={[
                                    styles.toolIconWrapper,
                                    selectedTool === tool.id && styles.selectedTool
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
                                ]}>
                                    {tool.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )
                }
            </SafeAreaView >

            {/* Layout Modal */}
            < Modal
                visible={showLayoutModal}
                transparent={true}
                animationType="slide"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Poster Layout</Text>
                            <TouchableOpacity onPress={() => setShowLayoutModal(false)}>
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Poster Name</Text>
                        <TextInput
                            style={styles.textInput}
                            value={posterName}
                            onChangeText={setPosterName}
                            placeholder="Enter poster name"
                        />

                        <Text style={styles.label}>Aspect Ratio</Text>
                        <View style={styles.ratioGrid}>
                            {['1:1', '4:5', '9:16', '16:9'].map((ratio) => (
                                <TouchableOpacity
                                    key={ratio}
                                    style={[
                                        styles.ratioButton,
                                        selectedRatio === ratio && styles.selectedRatio
                                    ]}
                                    onPress={() => setSelectedRatio(ratio)}
                                >
                                    <Text style={[
                                        styles.ratioText,
                                        selectedRatio === ratio && styles.selectedRatioText
                                    ]}>{ratio}</Text>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity
                                style={[
                                    styles.ratioButton,
                                    selectedRatio === 'custom' && styles.selectedRatio
                                ]}
                                onPress={() => setSelectedRatio('custom')}
                            >
                                <Text style={[
                                    styles.ratioText,
                                    selectedRatio === 'custom' && styles.selectedRatioText
                                ]}>Custom</Text>
                            </TouchableOpacity>
                        </View>

                        {selectedRatio === 'custom' && (
                            <View style={styles.customSizeContainer}>
                                <View style={styles.sizeInputWrapper}>
                                    <Text style={styles.sizeLabel}>Width</Text>
                                    <TextInput
                                        style={styles.sizeInput}
                                        value={customSize.w}
                                        onChangeText={(t) => setCustomSize(prev => ({ ...prev, w: t }))}
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View style={styles.sizeInputWrapper}>
                                    <Text style={styles.sizeLabel}>Height</Text>
                                    <TextInput
                                        style={styles.sizeInput}
                                        value={customSize.h}
                                        onChangeText={(t) => setCustomSize(prev => ({ ...prev, h: t }))}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                        )}

                        <TouchableOpacity
                            onPress={applyLayout}
                            style={styles.modalButtonAdd}
                        >
                            <Text style={styles.modalButtonTextAdd}>Apply Layout</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal >

            {/* Poster Selection Modal */}
            < Modal
                visible={showBannerModal}
                transparent={true}
                animationType="slide"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Poster</Text>
                            <TouchableOpacity onPress={() => setShowBannerModal(false)}>
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        {loadingAssets ? (
                            <ActivityIndicator size="large" color={SP_RED} style={{ padding: 20 }} />
                        ) : (
                            <ScrollView style={{ maxHeight: 400 }}>
                                <View style={styles.bannersGrid}>
                                    {/* Default Option (Original) */}
                                    <TouchableOpacity
                                        style={[
                                            styles.bannerItem,
                                            currentImage === imageUrl && styles.selectedBannerItem
                                        ]}
                                        onPress={() => handlePosterSelect(imageUrl as string)}
                                    >
                                        <Image
                                            source={{ uri: imageUrl as string }}
                                            style={styles.bannerPreview}
                                            resizeMode="cover"
                                        />
                                        <Text style={styles.bannerName}>Original</Text>
                                    </TouchableOpacity>

                                    {/* Database Posters */}
                                    {posterAssets.map((asset) => (
                                        <TouchableOpacity
                                            key={asset._id}
                                            style={[
                                                styles.bannerItem,
                                                currentImage === asset.imageUrl && styles.selectedBannerItem
                                            ]}
                                            onPress={() => handlePosterSelect(asset.imageUrl)}
                                        >
                                            <Image
                                                source={{ uri: asset.imageUrl }}
                                                style={styles.bannerPreview}
                                                resizeMode="cover"
                                            />
                                            <Text style={styles.bannerName} numberOfLines={1}>{asset.title}</Text>
                                        </TouchableOpacity>
                                    ))}

                                    {posterAssets.length === 0 && (
                                        <Text style={styles.noBannersText}>No posters found</Text>
                                    )}
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal >

            {/* Text Input Modal */}
            < Modal
                visible={showTextModal}
                transparent={true}
                animationType="slide"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add Text</Text>
                        <TextInput
                            style={styles.textInput}
                            value={newText}
                            onChangeText={setNewText}
                            placeholder="Enter text..."
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                onPress={() => setShowTextModal(false)}
                                style={styles.modalButtonCancel}
                            >
                                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    if (newText.trim()) {
                                        addElement('text', newText);
                                        setShowTextModal(false);
                                    }
                                }}
                                style={styles.modalButtonAdd}
                            >
                                <Text style={styles.modalButtonTextAdd}>Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal >

            {/* Image Processing Modal */}
            < Modal
                visible={showImageModal}
                transparent={true}
                animationType="slide"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Image</Text>
                            <TouchableOpacity onPress={() => setShowImageModal(false)}>
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.imagePreviewContainer}>
                            {processedImageUri ? (
                                <Image source={{ uri: processedImageUri }} style={styles.imagePreview} resizeMode="contain" />
                            ) : selectedImageUri ? (
                                <Image source={{ uri: selectedImageUri }} style={styles.imagePreview} resizeMode="contain" />
                            ) : (
                                <View style={styles.imagePlaceholder}>
                                    <Ionicons name="image-outline" size={48} color="#cbd5e1" />
                                    <Text style={styles.imagePlaceholderText}>No image selected</Text>
                                </View>
                            )}
                        </View>

                        {isProcessingBg && (
                            <View style={styles.processingOverlay}>
                                <ActivityIndicator size="large" color={SP_RED} />
                                <Text style={styles.processingText}>Removing Background...</Text>
                            </View>
                        )}

                        <View style={styles.actionButtonsGrid}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => pickImageForModal(false)}
                            >
                                <Ionicons name="images" size={20} color="#64748b" />
                                <Text style={styles.actionButtonText}>Select</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, !selectedImageUri && styles.disabledButton]}
                                onPress={() => pickImageForModal(true)}
                                disabled={!selectedImageUri}
                            >
                                <Ionicons name="crop" size={20} color={!selectedImageUri ? "#cbd5e1" : "#64748b"} />
                                <Text style={[styles.actionButtonText, !selectedImageUri && styles.disabledText]}>Crop</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, !selectedImageUri && styles.disabledButton]}
                                onPress={removeBackground}
                                disabled={!selectedImageUri}
                            >
                                <MaterialCommunityIcons name="eraser" size={20} color={!selectedImageUri ? "#cbd5e1" : "#64748b"} />
                                <Text style={[styles.actionButtonText, !selectedImageUri && styles.disabledText]}>Remove BG</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.modalButtonAdd, ((!selectedImageUri && !processedImageUri) || isProcessingBg) && styles.disabledButton]}
                            onPress={addImageToPoster}
                            disabled={(!selectedImageUri && !processedImageUri) || isProcessingBg}
                        >
                            <Text style={styles.modalButtonTextAdd}>Add to Poster</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal >

            {/* Bottom Bar Template Modal */}
            < Modal
                visible={showBottomBarModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowBottomBarModal(false)}
            >
                <View style={styles.modalOverlay2}>
                    <TouchableOpacity
                        style={styles.modalBackdrop2}
                        activeOpacity={1}
                        onPress={() => setShowBottomBarModal(false)}
                    />
                    <View style={[styles.bottomSheet2, { height: '75%' }]}>
                        <View style={styles.modalHeader2}>
                            <View>
                                <Text style={styles.modalTitle2}>Bottom Bar Frames</Text>
                                <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Select a Frame</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowBottomBarModal(false)} style={styles.closeButton2}>
                                <MaterialCommunityIcons name="close" size={24} color="#0f172a" />
                            </TouchableOpacity>
                        </View>
                        <Text style={{ fontSize: 12, color: '#94a3b8', paddingHorizontal: 20, marginBottom: 12 }}>Choose a template for your poster</Text>
                        <FlatList
                            data={TEMPLATES}
                            showsVerticalScrollIndicator={false}
                            keyExtractor={item => item.id}
                            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                            renderItem={({ item }) => {
                                const isSelected = selectedBottomBarTemplate === item.id;
                                const frameDescriptions: { [key: string]: string } = {
                                    'default': 'Traditional horizontal layout',
                                    'bold_strip': 'Blue gradient with golden accent',
                                    'minimal_white': 'Clean design with accent line',
                                    'red_accent': 'Creative split design',
                                    'gradient_wave': 'Modern glassmorphism',
                                    'stf_bold': 'Bold frame with cutout photo',
                                    'stf_rounded': 'Rounded elegant design',
                                    'stf_tabbed': 'Tabbed layout for professionals',
                                };
                                return (
                                    <TouchableOpacity
                                        style={{
                                            marginBottom: 16,
                                            borderRadius: 16,
                                            borderWidth: isSelected ? 2 : 1,
                                            borderColor: isSelected ? SP_RED : '#cbd5e1',
                                            backgroundColor: '#fff',
                                            // Shadow for card look
                                            shadowColor: '#64748b',
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: 0.1,
                                            shadowRadius: 8,
                                            elevation: 4,
                                            overflow: 'hidden',
                                        }}
                                        onPress={() => {
                                            setSelectedBottomBarTemplate(item.id);
                                            setShowBottomBarModal(false);
                                        }}
                                        activeOpacity={0.9}
                                    >
                                        {/* Gradient Preview Card */}
                                        <View style={{
                                            width: '100%',
                                            height: 100, // Compact height for gradient card
                                            backgroundColor: '#f1f5f9',
                                        }}>
                                            <LinearGradient
                                                colors={(item.gradient || ['#e2e8f0', '#cbd5e1']) as any}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                                style={{ width: '100%', height: '100%' }}
                                            />
                                            {/* Optional: Add icon overlay */}
                                            <View style={{ position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(255,255,255,0.2)', padding: 6, borderRadius: 8 }}>
                                                <MaterialCommunityIcons name="card-account-details-outline" size={24} color="#fff" />
                                            </View>
                                        </View>

                                        {/* Selected Checkmark Badge */}
                                        {isSelected && (
                                            <View style={{
                                                position: 'absolute',
                                                top: 10,
                                                right: 10,
                                                backgroundColor: SP_RED,
                                                borderRadius: 20,
                                                width: 28,
                                                height: 28,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderWidth: 2,
                                                borderColor: '#fff',
                                                zIndex: 100, // High z-index to be on top
                                                shadowColor: '#000',
                                                shadowOffset: { width: 0, height: 2 },
                                                shadowOpacity: 0.2,
                                                shadowRadius: 2,
                                            }}>
                                                <MaterialCommunityIcons name="check" size={16} color="#fff" />
                                            </View>
                                        )}

                                        {/* info section */}
                                        <View style={{ padding: 14, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                                <Text style={{ fontSize: 16, fontWeight: '700', color: '#1e293b' }}>
                                                    {item.name}
                                                </Text>
                                            </View>
                                            <Text style={{ fontSize: 13, color: '#64748b', lineHeight: 18 }}>
                                                {frameDescriptions[item.id] || 'Custom styled frame design'}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>
                </View>
            </Modal >

            {/* Bottom Bar Edit Form Modal */}
            < Modal
                visible={showBottomBarEditForm}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowBottomBarEditForm(false)}
            >
                <View style={styles.modalOverlay2}>
                    <TouchableOpacity
                        style={styles.modalBackdrop2}
                        activeOpacity={1}
                        onPress={() => setShowBottomBarEditForm(false)}
                    />
                    <View style={[styles.bottomSheet2, { height: '45%' }]}>
                        <View style={styles.modalHeader2}>
                            <Text style={styles.modalTitle2}>Edit Content</Text>
                            <TouchableOpacity
                                onPress={() => setShowBottomBarEditForm(false)}
                                style={{ backgroundColor: SP_RED, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}
                            >
                                <MaterialCommunityIcons name="check" size={18} color="#fff" />
                                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>Save</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={{ flex: 1, padding: 20 }} showsVerticalScrollIndicator={false}>
                            {/* Name Field */}
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

                            {/* Designation Field */}
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

                            {/* Mobile Field */}
                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Mobile Number</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={bottomBarDetails.mobile}
                                    onChangeText={(text) => setBottomBarDetails(prev => ({ ...prev, mobile: text }))}
                                    placeholder="+91 XXXXX XXXXX"
                                    keyboardType="phone-pad"
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>

                            {/* Social Platform Selector */}
                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Social Platform</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                    {SOCIAL_PLATFORMS.map((platform) => (
                                        <TouchableOpacity
                                            key={platform.id}
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                gap: 6,
                                                paddingHorizontal: 12,
                                                paddingVertical: 8,
                                                borderRadius: 8,
                                                borderWidth: 2,
                                                borderColor: bottomBarDetails.socialPlatform === platform.id ? SP_RED : '#e2e8f0',
                                                backgroundColor: bottomBarDetails.socialPlatform === platform.id ? '#fef2f2' : '#fff',
                                            }}
                                            onPress={() => setBottomBarDetails(prev => ({ ...prev, socialPlatform: platform.id }))}
                                        >
                                            <MaterialCommunityIcons
                                                name={platform.icon as any}
                                                size={18}
                                                color={bottomBarDetails.socialPlatform === platform.id ? SP_RED : '#64748b'}
                                            />
                                            <Text style={{
                                                fontSize: 12,
                                                fontWeight: bottomBarDetails.socialPlatform === platform.id ? '600' : '400',
                                                color: bottomBarDetails.socialPlatform === platform.id ? SP_RED : '#64748b'
                                            }}>{platform.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Social Handle Field */}
                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Social Handle</Text>
                                <TextInput
                                    style={styles.formInput}
                                    value={bottomBarDetails.social}
                                    onChangeText={(text) => setBottomBarDetails(prev => ({ ...prev, social: text }))}
                                    placeholder="@username"
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>

                            {/* Address Field */}
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

                            {/* Photo Upload */}
                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Profile Photo</Text>
                                <TouchableOpacity
                                    style={styles.photoUploadButton}
                                    onPress={async () => {
                                        const result = await ImagePicker.launchImageLibraryAsync({
                                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                            allowsEditing: true,
                                            aspect: [1, 1],
                                            quality: 1,
                                        });
                                        if (!result.canceled) {
                                            setBottomBarDetails(prev => ({ ...prev, photo: result.assets[0].uri, photoNoBg: null }));
                                        }
                                    }}
                                >
                                    {bottomBarDetails.photo || bottomBarDetails.photoNoBg ? (
                                        <Image source={{ uri: (bottomBarDetails.photoNoBg || bottomBarDetails.photo) as string }} style={styles.photoPreviewSmall} />
                                    ) : (
                                        <View style={styles.photoPlaceholderSmall}>
                                            <MaterialCommunityIcons name="camera-plus" size={32} color="#94a3b8" />
                                            <Text style={styles.photoPlaceholderText}>Tap to upload</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* Photo Controls - BG Removal, Flip, Position */}
                            {bottomBarDetails.photo && (
                                <View style={styles.formField}>
                                    <Text style={styles.formLabel}>Photo Controls</Text>

                                    {/* Remove Background & Flip Buttons */}
                                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                                        <TouchableOpacity
                                            style={{
                                                flex: 1,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: isRemovingFooterPhotoBg ? '#f1f5f9' : '#fff',
                                                borderWidth: 1,
                                                borderColor: '#e2e8f0',
                                                borderRadius: 8,
                                                paddingVertical: 10,
                                                gap: 6,
                                            }}
                                            onPress={handleRemoveFooterPhotoBg}
                                            disabled={isRemovingFooterPhotoBg}
                                        >
                                            {isRemovingFooterPhotoBg ? (
                                                <ActivityIndicator size="small" color={SP_RED} />
                                            ) : (
                                                <MaterialCommunityIcons name="eraser" size={18} color={SP_RED} />
                                            )}
                                            <Text style={{ fontSize: 12, color: SP_RED, fontWeight: '600' }}>
                                                {isRemovingFooterPhotoBg ? 'Removing...' : 'Remove BG'}
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={{
                                                flex: 1,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: isPhotoFlipped ? '#fef2f2' : '#fff',
                                                borderWidth: isPhotoFlipped ? 2 : 1,
                                                borderColor: isPhotoFlipped ? SP_RED : '#e2e8f0',
                                                borderRadius: 8,
                                                paddingVertical: 10,
                                                gap: 6,
                                            }}
                                            onPress={() => setIsPhotoFlipped(!isPhotoFlipped)}
                                        >
                                            <MaterialCommunityIcons
                                                name="flip-horizontal"
                                                size={18}
                                                color={isPhotoFlipped ? SP_RED : '#64748b'}
                                            />
                                            <Text style={{
                                                fontSize: 12,
                                                color: isPhotoFlipped ? SP_RED : '#64748b',
                                                fontWeight: isPhotoFlipped ? '600' : '400'
                                            }}>
                                                Flip Photo
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Position Controls */}
                                    <View style={{ gap: 10 }}>
                                        {/* X Position */}
                                        <View>
                                            <Text style={[styles.formLabel, { fontSize: 12, marginBottom: 6 }]}>
                                                Horizontal Position (X): {footerPhotoPosition.x}
                                            </Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <TouchableOpacity
                                                    onPress={() => setFooterPhotoPosition(prev => ({ ...prev, x: Math.max(0, prev.x - 5) }))}
                                                    style={{
                                                        backgroundColor: '#e2e8f0',
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: 8,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <MaterialCommunityIcons name="chevron-left" size={24} color="#0f172a" />
                                                </TouchableOpacity>
                                                <View style={{
                                                    flex: 1,
                                                    height: 40,
                                                    backgroundColor: '#f1f5f9',
                                                    borderRadius: 8,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}>
                                                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a' }}>
                                                        {footerPhotoPosition.x}px
                                                    </Text>
                                                </View>
                                                <TouchableOpacity
                                                    onPress={() => setFooterPhotoPosition(prev => ({ ...prev, x: Math.min(80, prev.x + 5) }))}
                                                    style={{
                                                        backgroundColor: '#e2e8f0',
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: 8,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <MaterialCommunityIcons name="chevron-right" size={24} color="#0f172a" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        {/* Y Position */}
                                        <View>
                                            <Text style={[styles.formLabel, { fontSize: 12, marginBottom: 6 }]}>
                                                Vertical Position (Y): {footerPhotoPosition.y}
                                            </Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <TouchableOpacity
                                                    onPress={() => setFooterPhotoPosition(prev => ({ ...prev, y: Math.max(-180, prev.y - 5) }))}
                                                    style={{
                                                        backgroundColor: '#e2e8f0',
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: 8,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <MaterialCommunityIcons name="chevron-up" size={24} color="#0f172a" />
                                                </TouchableOpacity>
                                                <View style={{
                                                    flex: 1,
                                                    height: 40,
                                                    backgroundColor: '#f1f5f9',
                                                    borderRadius: 8,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}>
                                                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a' }}>
                                                        {footerPhotoPosition.y}px
                                                    </Text>
                                                </View>
                                                <TouchableOpacity
                                                    onPress={() => setFooterPhotoPosition(prev => ({ ...prev, y: Math.min(-80, prev.y + 5) }))}
                                                    style={{
                                                        backgroundColor: '#e2e8f0',
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: 8,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <MaterialCommunityIcons name="chevron-down" size={24} color="#0f172a" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            )}

                            <View style={{ height: 20 }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal >

            {/* Filter Carousel Modal */}
            < Modal
                visible={showFilterModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowFilterModal(false)}
            >
                <View style={styles.modalOverlay2}>
                    <TouchableOpacity
                        style={styles.modalBackdrop2}
                        activeOpacity={1}
                        onPress={() => setShowFilterModal(false)}
                    />
                    <View style={[styles.bottomSheet2, { height: '50%' }]}>
                        <View style={styles.modalHeader2}>
                            <Text style={styles.modalTitle2}>Select Filter</Text>
                            <TouchableOpacity onPress={() => setShowFilterModal(false)} style={styles.closeButton2}>
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
                                    {/* Filter Preview */}
                                    <View style={styles.filterPreviewContainer}>
                                        <Image
                                            source={{ uri: currentImage }}
                                            style={styles.filterPreviewImage}
                                            resizeMode="cover"
                                            {...(Platform.OS === 'web' ? { crossOrigin: 'anonymous' } : {})}
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
            </Modal >

            {/* Preview Modal - Desktop-like preview with download */}
            <Modal
                visible={showPreviewModal}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowPreviewModal(false)}
            >
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 20,
                }}>
                    {/* Close Button */}
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            top: 50,
                            right: 20,
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            borderRadius: 20,
                            padding: 10,
                            zIndex: 10,
                        }}
                        onPress={() => setShowPreviewModal(false)}
                    >
                        <MaterialCommunityIcons name="close" size={24} color="#fff" />
                    </TouchableOpacity>

                    {/* Preview Title */}
                    <Text style={{
                        color: '#fff',
                        fontSize: 18,
                        fontWeight: '700',
                        marginBottom: 16,
                        textAlign: 'center',
                    }}>
                        Poster Preview (HD Quality)
                    </Text>

                    {/* Preview Image */}
                    <View style={{
                        backgroundColor: '#fff',
                        borderRadius: 12,
                        overflow: 'hidden',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.5,
                        shadowRadius: 20,
                        elevation: 20,
                        maxWidth: width * 0.9,
                        maxHeight: height * 0.6,
                    }}>
                        {previewImageUri ? (
                            <Image
                                source={{ uri: previewImageUri }}
                                style={{
                                    width: canvasSize.w * 0.8,
                                    height: canvasSize.h * 0.8,
                                    maxWidth: width * 0.85,
                                    maxHeight: height * 0.55,
                                }}
                                resizeMode="contain"
                            />
                        ) : (
                            <View style={{
                                width: canvasSize.w * 0.8,
                                height: canvasSize.h * 0.8,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                                <ActivityIndicator size="large" color={SP_RED} />
                                <Text style={{ marginTop: 10, color: '#64748b' }}>Generating HD Preview...</Text>
                            </View>
                        )}
                    </View>

                    {/* Action Buttons */}
                    <View style={{
                        flexDirection: 'row',
                        gap: 16,
                        marginTop: 24,
                    }}>
                        {/* Download Button - Direct HD Download */}
                        <TouchableOpacity
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: SP_RED,
                                borderRadius: 25,
                                paddingVertical: 14,
                                paddingHorizontal: 28,
                                gap: 8,
                            }}
                            onPress={() => {
                                if (previewImageUri) {
                                    if (Platform.OS === 'web') {
                                        // Web: Direct download of HD image
                                        const link = document.createElement('a');
                                        link.href = previewImageUri;
                                        link.download = `${posterName.replace(/\s+/g, '-').toLowerCase()}-hd.png`;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        Alert.alert('Success', 'HD Poster downloaded successfully!');
                                        setShowPreviewModal(false);
                                    } else {
                                        // Mobile: Save HD image
                                        (async () => {
                                            try {
                                                const { status } = await MediaLibrary.requestPermissionsAsync(true);
                                                if (status === 'granted') {
                                                    await MediaLibrary.saveToLibraryAsync(previewImageUri);
                                                    Alert.alert('Success', 'HD Poster saved to gallery!');
                                                    setShowPreviewModal(false);
                                                } else {
                                                    Alert.alert('Permission Required', 'Please grant permission to save photos.');
                                                }
                                            } catch (error) {
                                                console.error('Save error:', error);
                                                Alert.alert('Error', 'Failed to save poster');
                                            }
                                        })();
                                    }
                                }
                            }}
                            disabled={!previewImageUri}
                        >
                            <MaterialCommunityIcons name="download" size={20} color="#fff" />
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
                                Download HD
                            </Text>
                        </TouchableOpacity>

                        {/* Share Button */}
                        {Platform.OS !== 'web' && (
                            <TouchableOpacity
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    borderRadius: 25,
                                    paddingVertical: 14,
                                    paddingHorizontal: 28,
                                    gap: 8,
                                    borderWidth: 1,
                                    borderColor: 'rgba(255,255,255,0.3)',
                                }}
                                onPress={async () => {
                                    if (previewImageUri) {
                                        try {
                                            await Sharing.shareAsync(previewImageUri);
                                        } catch (error) {
                                            console.error('Share error:', error);
                                            Alert.alert('Error', 'Failed to share poster');
                                        }
                                    }
                                }}
                                disabled={!previewImageUri}
                            >
                                <MaterialCommunityIcons name="share-variant" size={20} color="#fff" />
                                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Share</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Frame Customization Modal */}
            <Modal
                visible={showCustomizationModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowCustomizationModal(false)}
            >
                <View style={styles.modalOverlay2}>
                    <TouchableOpacity
                        style={styles.modalBackdrop2}
                        activeOpacity={1}
                        onPress={() => setShowCustomizationModal(false)}
                    />
                    <View style={[styles.bottomSheet2, { height: '80%' }]}>
                        <View style={styles.modalHeader2}>
                            <Text style={styles.modalTitle2}>Customize Frame Style</Text>
                            <TouchableOpacity
                                onPress={() => setShowCustomizationModal(false)}
                                style={{ backgroundColor: SP_RED, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}
                            >
                                <MaterialCommunityIcons name="check" size={18} color="#fff" />
                                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>Done</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={{ flex: 1, padding: 20 }} showsVerticalScrollIndicator={false}>
                            {/* Gradient Presets */}
                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Background Gradient</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
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
                                            style={{
                                                alignItems: 'center',
                                                gap: 4,
                                                width: '30%',
                                                borderRadius: 8,
                                                borderWidth: JSON.stringify(frameCustomization.backgroundGradient) === JSON.stringify(preset.colors) ? 3 : 0,
                                                borderColor: SP_RED,
                                                padding: 4,
                                            }}
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

                            {/* Opacity */}
                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Opacity: {Math.round(frameCustomization.backgroundOpacity * 100)}%</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <TouchableOpacity
                                        onPress={() => setFrameCustomization(prev => ({ ...prev, backgroundOpacity: Math.max(0.3, prev.backgroundOpacity - 0.1) }))}
                                        style={{ backgroundColor: '#e2e8f0', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <Text style={{ fontSize: 20, fontWeight: '600' }}>-</Text>
                                    </TouchableOpacity>
                                    <View style={{ flex: 1, height: 6, backgroundColor: '#e2e8f0', borderRadius: 3 }}>
                                        <View style={{ width: `${frameCustomization.backgroundOpacity * 100}%`, height: '100%', backgroundColor: SP_RED, borderRadius: 3 }} />
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => setFrameCustomization(prev => ({ ...prev, backgroundOpacity: Math.min(1, prev.backgroundOpacity + 0.1) }))}
                                        style={{ backgroundColor: '#e2e8f0', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <Text style={{ fontSize: 20, fontWeight: '600' }}>+</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Image Size */}
                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Profile Photo Size: {frameCustomization.imageSize}px</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <TouchableOpacity
                                        onPress={() => setFrameCustomization(prev => ({ ...prev, imageSize: Math.max(30, prev.imageSize - 5) }))}
                                        style={{ backgroundColor: '#e2e8f0', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <Text style={{ fontSize: 20, fontWeight: '600' }}>-</Text>
                                    </TouchableOpacity>
                                    <View style={{ flex: 1, height: 6, backgroundColor: '#e2e8f0', borderRadius: 3 }}>
                                        <View style={{ width: `${((frameCustomization.imageSize - 30) / 70) * 100}%`, height: '100%', backgroundColor: SP_RED, borderRadius: 3 }} />
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => setFrameCustomization(prev => ({ ...prev, imageSize: Math.min(100, prev.imageSize + 5) }))}
                                        style={{ backgroundColor: '#e2e8f0', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <Text style={{ fontSize: 20, fontWeight: '600' }}>+</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Text Customization Sections */}
                            {(['name', 'designation', 'mobile', 'address', 'social'] as const).map((field) => (
                                <View key={field} style={styles.formField}>
                                    <Text style={styles.formLabel}>{field.charAt(0).toUpperCase() + field.slice(1)} Font Size: {frameCustomization[`${field}FontSize`]}px</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                        <TouchableOpacity
                                            onPress={() => setFrameCustomization(prev => ({ ...prev, [`${field}FontSize`]: Math.max(8, (prev as any)[`${field}FontSize`] - 1) }))}
                                            style={{ backgroundColor: '#e2e8f0', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <Text style={{ fontSize: 20, fontWeight: '600' }}>-</Text>
                                        </TouchableOpacity>
                                        <View style={{ flex: 1, height: 6, backgroundColor: '#e2e8f0', borderRadius: 3 }}>
                                            <View style={{ width: `${(((frameCustomization as any)[`${field}FontSize`] - 8) / 22) * 100}%`, height: '100%', backgroundColor: SP_RED, borderRadius: 3 }} />
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => setFrameCustomization(prev => ({ ...prev, [`${field}FontSize`]: Math.min(30, (prev as any)[`${field}FontSize`] + 1) }))}
                                            style={{ backgroundColor: '#e2e8f0', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <Text style={{ fontSize: 20, fontWeight: '600' }}>+</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <Text style={[styles.formLabel, { marginTop: 10 }]}>{field.charAt(0).toUpperCase() + field.slice(1)} Color</Text>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                        {['#ffffff', '#000000', '#E30512', '#16a34a', '#fbbf24', '#3b82f6', '#8b5cf6'].map(color => (
                                            <TouchableOpacity
                                                key={color}
                                                onPress={() => setFrameCustomization(prev => ({ ...prev, [`${field}Color`]: color }))}
                                                style={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius: 18,
                                                    backgroundColor: color,
                                                    borderWidth: (frameCustomization as any)[`${field}Color`] === color ? 3 : 1,
                                                    borderColor: (frameCustomization as any)[`${field}Color`] === color ? SP_RED : '#e2e8f0',
                                                }}
                                            />
                                        ))}
                                    </View>
                                </View>
                            ))}

                            <View style={{ height: 30 }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        zIndex: 10,
    },
    headerTitle: {
        color: '#1e293b',
        fontSize: 18,
        fontWeight: '700',
    },
    iconButton: {
        padding: 8,
    },
    saveButton: {
        backgroundColor: SP_RED,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 0,
        paddingBottom: 10,
    },
    canvas: {
        backgroundColor: SP_RED,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        position: 'relative',
    },
    baseImage: {
        width: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
    },
    bannerOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    bannerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    bannerLogo: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
    },
    bannerTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    bannerSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
    },
    element: {
        position: 'absolute',
        padding: 4,
    },
    elementText: {
        fontWeight: '700',
    },
    elementImage: {
        width: 100,
        height: 100,
    },
    zoomControls: {
        position: 'absolute',
        bottom: 150,
        left: '72%',
        transform: [{ translateX: -100 }],
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 25,
        paddingVertical: 8,
        paddingHorizontal: 12,
        gap: 8,
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    zoomButton: {
        padding: 4,
    },
    zoomText: {
        color: '#1e293b',
        fontSize: 12,
        fontWeight: '600',
    },
    toolbarContainer: {
        backgroundColor: '#ffffff',
        paddingVertical: 20,
        paddingBottom: Platform.OS === 'ios' ? 70 : 60,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        minHeight: 140,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 10,
    },
    toolbarScroll: {
        paddingHorizontal: 16,
        gap: 20,
    },
    toolItem: {
        alignItems: 'center',
        gap: 4,
    },
    toolIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedTool: {
        backgroundColor: SP_RED,
    },
    toolName: {
        color: '#64748b',
        fontSize: 11,
        fontWeight: '500',
    },
    selectedToolText: {
        color: '#1e293b',
        fontWeight: '600',
    },
    textToolbar: {
        paddingHorizontal: 16,
        gap: 16,
    },
    textToolbarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    textToolbarTitle: {
        color: '#1e293b',
        fontSize: 14,
        fontWeight: '600',
    },
    editTextInput: {
        backgroundColor: '#f1f5f9',
        color: '#1e293b',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    textOptionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    textOptionLabel: {
        color: '#64748b',
        fontSize: 12,
        width: 40,
    },
    sizeControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 20,
        padding: 4,
    },
    sizeButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sizeValue: {
        color: '#1e293b',
        fontSize: 14,
        fontWeight: '600',
        minWidth: 24,
        textAlign: 'center',
    },
    colorCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedColor: {
        borderColor: '#1e293b',
    },
    fontButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#f1f5f9',
        borderRadius: 16,
        marginRight: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    selectedFont: {
        borderColor: SP_RED,
        backgroundColor: '#e2e8f0',
    },
    fontButtonText: {
        color: '#1e293b',
        fontSize: 12,
    },
    selectedFontText: {
        color: SP_RED,
        fontWeight: '700',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '90%',
        alignSelf: 'center',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 24,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    modalButtonCancel: {
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    modalButtonTextCancel: {
        color: '#64748b',
        fontWeight: '600',
    },
    modalButtonAdd: {
        backgroundColor: SP_RED,
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    modalButtonTextAdd: {
        color: '#fff',
        fontWeight: '600',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 8,
    },
    ratioGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 24,
    },
    ratioButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    selectedRatio: {
        backgroundColor: SP_RED,
        borderColor: SP_RED,
    },
    ratioText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    selectedRatioText: {
        color: '#fff',
    },
    customSizeContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    sizeInputWrapper: {
        flex: 1,
    },
    sizeLabel: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 4,
    },
    sizeInput: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
    },
    bannersGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
    },
    bannerItem: {
        width: (width - 48) / 3, // 3 items per row with spacing
        aspectRatio: 0.8,
        marginBottom: 8,
        alignItems: 'center',
        padding: 4,
    },
    selectedBannerItem: {
        borderColor: SP_RED,
        borderWidth: 2,
        borderRadius: 8,
    },
    bannerPreview: {
        width: '100%',
        height: '80%',
        borderRadius: 6,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2,
    },
    bannerName: {
        fontSize: 9,
        color: '#64748b',
        textAlign: 'center',
    },
    noBannersText: {
        textAlign: 'center',
        color: '#94a3b8',
        width: '100%',
        padding: 20,
    },
    // Image Modal Styles
    imagePreviewContainer: {
        height: 250,
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        overflow: 'hidden',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        alignItems: 'center',
        gap: 8,
    },
    imagePlaceholderText: {
        color: '#94a3b8',
        fontSize: 14,
    },
    actionButtonsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#f8fafc',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        gap: 4,
    },
    actionButtonText: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.5,
    },
    disabledText: {
        color: '#cbd5e1',
    },
    processingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
        borderRadius: 16,
    },
    processingText: {
        marginTop: 10,
        color: SP_RED,
        fontWeight: '600',
    },
    controlBtn: {
        position: 'absolute',
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: SP_RED,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
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
    // Bottom Bar Modal Styles
    modalOverlay2: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalBackdrop2: {
        flex: 1,
    },
    bottomSheet2: {
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
    modalHeader2: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    modalTitle2: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    closeButton2: {
        padding: 4,
    },
    carouselContent2: {
        alignItems: 'center',
    },
    carouselItem2: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    framePreviewContainer2: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        overflow: 'hidden',
        padding: 12,
    },
    selectedFrameBorder2: {
        borderColor: SP_RED,
    },
    templateName2: {
        padding: 12,
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b',
        textAlign: 'center',
    },
    selectedTemplateName2: {
        color: SP_RED,
        fontWeight: 'bold',
    },
    // Form Styles
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
    photoUploadButton: {
        backgroundColor: '#f8fafc',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
        borderRadius: 12,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    photoPreviewSmall: {
        width: '100%',
        height: '100%',
    },
    photoPlaceholderSmall: {
        alignItems: 'center',
    },
    photoPlaceholderText: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 8,
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
});
