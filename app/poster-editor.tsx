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
    Animated
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { captureRef } from 'react-native-view-shot';
import { removeBackground as imglyRemoveBackground } from '../utils/backgroundRemoval';
import { getApiUrl } from '../utils/api';
import { TEMPLATES, RenderBottomBar } from '../components/posteredit/BottomBarTemplates';
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
type ToolType = 'text' | 'image' | 'music' | 'layout' | 'banner' | 'filter' | 'sticker' | 'shape' | 'draw' | 'bg';

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
    const [canvasSize, setCanvasSize] = useState({ w: width * 0.85, h: Math.min(width * 0.85, MAX_CANVAS_HEIGHT) });
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

    // Zoom State - Start at 80% to fit in view
    const [zoomScale, setZoomScale] = useState(0.8);

    // Bottom Bar Template Modal State
    const [showBottomBarModal, setShowBottomBarModal] = useState(false);
    const [selectedBottomBarTemplate, setSelectedBottomBarTemplate] = useState(TEMPLATES[0].id);
    const [bottomBarDetails, setBottomBarDetails] = useState({
        name: 'Your Name',
        designation: 'Designation',
        mobile: '+91 XXXXX XXXXX',
        social: '@username',
        address: 'Your Address',
        photo: null as string | null,
    });
    const [showBottomBarEditForm, setShowBottomBarEditForm] = useState(false);

    // Filter State
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('none');

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
        { id: 'banner', name: 'Posters', icon: 'image-multiple' },
        { id: 'text', name: 'Add Text', icon: 'format-text' },
        { id: 'image', name: 'Add Image', icon: 'image-plus' },
        { id: 'filter', name: 'Filters', icon: 'filter-variant' },
        { id: 'sticker', name: 'Stickers', icon: 'sticker-emoji' },
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
                    address: fullAddress,
                    photo: user.profileImage || null,
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
            let newWidth = width * 0.85;
            let newHeight = (newWidth * aspectRatio) + BANNER_HEIGHT;

            // If height exceeds max, scale down to fit
            if (newHeight > MAX_CANVAS_HEIGHT) {
                newHeight = MAX_CANVAS_HEIGHT;
                newWidth = (newHeight - BANNER_HEIGHT) / aspectRatio;
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

    const handleToolPress = (toolId: string) => {
        const tool = toolId as ToolType;
        setSelectedTool(tool);
        setSelectedElementId(null); // Deselect element when switching main tools

        switch (tool) {
            case 'text':
                setNewText('');
                setShowTextModal(true);
                break;
            case 'image':
                // Open Image Processing Modal instead of direct pick
                setSelectedImageUri(null);
                setProcessedImageUri(null);
                setShowImageModal(true);
                break;
            case 'layout':
                setShowLayoutModal(true);
                break;
            case 'banner':
                setShowBannerModal(true);
                break;
            case 'sticker':
                setShowBottomBarModal(true);
                break;
            case 'filter':
                setShowFilterModal(true);
                break;
            case 'music':
                Alert.alert('Coming Soon', 'Music feature will be available in the next update!');
                break;
            default:
                break;
        }
    };

    const applyLayout = () => {
        let newWidth = width * 0.85;
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

    const handleSave = async () => {
        try {
            setSelectedElementId(null); // Deselect before saving to hide border
            // Wait a tick for state to update
            setTimeout(async () => {
                try {
                    let uri: string;

                    if (Platform.OS === 'web') {
                        // For web, use canvas.toDataURL instead of captureRef
                        const canvasElement = canvasRef.current as any;
                        if (!canvasElement) {
                            throw new Error('Canvas ref not found');
                        }

                        // Try using html2canvas if available, otherwise use a manual canvas approach
                        if (typeof window !== 'undefined' && (window as any).html2canvas) {
                            const html2canvas = (window as any).html2canvas;
                            const canvas = await html2canvas(canvasElement, {
                                useCORS: true,
                                allowTaint: true,
                                backgroundColor: null,
                            });
                            uri = canvas.toDataURL('image/jpeg', 0.9);
                        } else {
                            // Fallback: create a manual download link
                            // This is a simpler approach that just saves the current view
                            const link = document.createElement('a');
                            link.download = `${posterName.replace(/\s+/g, '-').toLowerCase()}.jpg`;

                            // Try to get the image from the canvas if it's a simple image view
                            const imgElement = canvasElement.querySelector('img');
                            if (imgElement) {
                                const canvas = document.createElement('canvas');
                                canvas.width = canvasSize.w;
                                canvas.height = canvasSize.h;
                                const ctx = canvas.getContext('2d');
                                if (ctx) {
                                    ctx.drawImage(imgElement, 0, 0, canvasSize.w, canvasSize.h);
                                    uri = canvas.toDataURL('image/jpeg', 0.9);
                                } else {
                                    throw new Error('Could not get canvas context');
                                }
                            } else {
                                Alert.alert('Info', 'Please use the desktop version for better download support on web');
                                return;
                            }
                        }

                        const link = document.createElement('a');
                        link.href = uri;
                        link.download = `${posterName.replace(/\s+/g, '-').toLowerCase()}.jpg`;
                        link.click();
                    } else {
                        // For mobile, use captureRef
                        uri = await captureRef(canvasRef, {
                            format: 'jpg',
                            quality: 0.9,
                        });
                        await Sharing.shareAsync(uri);
                    }
                } catch (innerError) {
                    console.error('Capture error:', innerError);
                    Alert.alert('Error', 'Failed to capture poster. Please try using the desktop editor for web downloads.');
                }
            }, 100);
        } catch (error) {
            console.error('Save error:', error);
            Alert.alert('Error', 'Failed to save poster');
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
                    onPress={() => setSelectedElementId(element.id)}
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
                                        fontFamily: element.fontFamily
                                    }
                                ]}>
                                    {element.content}
                                </Text>
                            ) : (
                                <Image source={{ uri: element.content }} style={styles.elementImage} />
                            )}
                        </View>

                        {isSelected && (
                            <>
                                {/* Top Left - Delete */}
                                <TouchableOpacity
                                    style={[styles.controlBtn, styles.controlBtnTL]}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        deleteSelectedElement();
                                    }}
                                >
                                    <MaterialCommunityIcons name="close" size={16} color="#fff" />
                                </TouchableOpacity>

                                {/* Top Right - Rotate 90deg */}
                                <TouchableOpacity
                                    style={[styles.controlBtn, styles.controlBtnTR]}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        const newRotation = (element.rotation + 90) % 360;
                                        updateElement(element.id, { rotation: newRotation });
                                    }}
                                >
                                    <MaterialCommunityIcons name="rotate-right" size={16} color="#fff" />
                                </TouchableOpacity>

                                {/* Bottom Left - Move/Drag Handle */}
                                <View
                                    {...panResponder.panHandlers}
                                    style={[styles.controlBtn, styles.controlBtnBL]}
                                >
                                    <MaterialCommunityIcons name="cursor-move" size={16} color="#fff" />
                                </View>

                                {/* Bottom Right - Resize by dragging */}
                                <View
                                    {...resizeResponder.panHandlers}
                                    style={[styles.controlBtn, styles.controlBtnBR]}
                                >
                                    <MaterialCommunityIcons name="arrow-expand-all" size={16} color="#fff" />
                                </View>
                            </>
                        )}
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
                <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
            </View>

            {/* Main Canvas Area */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollViewContent, { justifyContent: 'flex-start', paddingTop: 10 }]}
                scrollEnabled={!isDragging} // Disable scroll when dragging element
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
            >
                {/* Zoom Wrapper */}
                <View style={{
                    width: canvasSize.w * zoomScale,
                    height: canvasSize.h * zoomScale,
                    alignItems: 'center',
                    justifyContent: 'flex-start' // Position at top
                }}>
                    {/* Entire canvas is movable */}
                    <View
                        {...posterPanResponder.panHandlers}
                        style={{
                            transform: [
                                { scale: zoomScale },
                                { translateX: posterOffset.x },
                                { translateY: posterOffset.y }
                            ]
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

                            {/* Added Elements */}
                            {elements.map((el) => (
                                <DraggableItem key={el.id} element={el} />
                            ))}

                            {/* Dynamic Footer Bottom Bar - Positioned at Bottom */}
                            <View style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: BANNER_HEIGHT,
                                width: '100%'
                            }}>
                                <RenderBottomBar
                                    template={selectedBottomBarTemplate}
                                    details={bottomBarDetails}
                                    width={canvasSize.w}
                                />
                                {/* Edit Button Overlay */}
                                <TouchableOpacity
                                    style={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        backgroundColor: 'rgba(0,0,0,0.6)',
                                        borderRadius: 20,
                                        padding: 8,
                                        zIndex: 10,
                                    }}
                                    onPress={() => setShowBottomBarEditForm(true)}
                                >
                                    <MaterialCommunityIcons name="pencil" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Zoom Controls */}
            <View style={styles.zoomControls}>
                <TouchableOpacity onPress={() => handleZoom(false)} style={styles.zoomButton}>
                    <Ionicons name="remove" size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.zoomText}>{Math.round(zoomScale * 100)}%</Text>
                <TouchableOpacity onPress={() => handleZoom(true)} style={styles.zoomButton}>
                    <Ionicons name="add" size={24} color="#1e293b" />
                </TouchableOpacity>
                <View style={{ width: 1, height: 20, backgroundColor: '#cbd5e1', marginHorizontal: 8 }} />
                <TouchableOpacity
                    onPress={() => {
                        setPosterOffset({ x: 0, y: 0 });
                        posterOffsetRef.current = { x: 0, y: 0 };
                        setZoomScale(1); // Reset to 100%
                    }}
                    style={[styles.zoomButton, { paddingHorizontal: 8 }]}
                >
                    <Ionicons name="refresh" size={18} color="#1e293b" />
                    <Text style={{ fontSize: 10, color: '#64748b', marginLeft: 4 }}>Reset</Text>
                </TouchableOpacity>
            </View>

            {/* Bottom Toolbar */}
            <View style={styles.toolbarContainer}>
                {selectedElement && selectedElement.type === 'text' ? (
                    // Text Editing Toolbar
                    <View style={styles.textToolbar}>
                        <View style={styles.textToolbarHeader}>
                            <Text style={styles.textToolbarTitle}>Edit Text</Text>
                            <View style={{ flexDirection: 'row', gap: 16 }}>
                                <TouchableOpacity onPress={deleteSelectedElement}>
                                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setSelectedElementId(null)}>
                                    <Ionicons name="close" size={20} color="#64748b" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Text Content Input */}
                        <TextInput
                            style={styles.editTextInput}
                            value={selectedElement.content}
                            onChangeText={(text) => updateElement(selectedElement.id, { content: text })}
                            placeholder="Type text here..."
                            placeholderTextColor="#94a3b8"
                        />

                        {/* Font Size */}
                        <View style={styles.textOptionRow}>
                            <Text style={styles.textOptionLabel}>Size</Text>
                            <View style={styles.sizeControls}>
                                <TouchableOpacity
                                    onPress={() => updateElement(selectedElement.id, { fontSize: (selectedElement.fontSize || 24) - 2 })}
                                    style={styles.sizeButton}
                                >
                                    <Ionicons name="remove" size={16} color="#1e293b" />
                                </TouchableOpacity>
                                <Text style={styles.sizeValue}>{selectedElement.fontSize}</Text>
                                <TouchableOpacity
                                    onPress={() => updateElement(selectedElement.id, { fontSize: (selectedElement.fontSize || 24) + 2 })}
                                    style={styles.sizeButton}
                                >
                                    <Ionicons name="add" size={16} color="#1e293b" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Colors */}
                        <View style={styles.textOptionRow}>
                            <Text style={styles.textOptionLabel}>Color</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {COLORS.map(color => (
                                    <TouchableOpacity
                                        key={color}
                                        style={[
                                            styles.colorCircle,
                                            { backgroundColor: color },
                                            selectedElement.color === color && styles.selectedColor
                                        ]}
                                        onPress={() => updateElement(selectedElement.id, { color })}
                                    />
                                ))}
                            </ScrollView>
                        </View>

                        {/* Fonts */}
                        <View style={styles.textOptionRow}>
                            <Text style={styles.textOptionLabel}>Font</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {FONTS.map(font => (
                                    <TouchableOpacity
                                        key={font}
                                        style={[
                                            styles.fontButton,
                                            selectedElement.fontFamily === font && styles.selectedFont
                                        ]}
                                        onPress={() => updateElement(selectedElement.id, { fontFamily: font })}
                                    >
                                        <Text style={[
                                            styles.fontButtonText,
                                            selectedElement.fontFamily === font && styles.selectedFontText,
                                            { fontFamily: font !== 'System' ? font : undefined }
                                        ]}>{font}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
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
                )}
            </View>

            {/* Layout Modal */}
            <Modal
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
            </Modal>

            {/* Poster Selection Modal */}
            <Modal
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
            </Modal>

            {/* Text Input Modal */}
            <Modal
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
            </Modal>

            {/* Image Processing Modal */}
            <Modal
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
                            style={[styles.modalButtonAdd, (!selectedImageUri && !processedImageUri) && styles.disabledButton]}
                            onPress={addImageToPoster}
                            disabled={!selectedImageUri && !processedImageUri}
                        >
                            <Text style={styles.modalButtonTextAdd}>Add to Poster</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Bottom Bar Template Modal */}
            <Modal
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
                    <View style={styles.bottomSheet2}>
                        <View style={styles.modalHeader2}>
                            <Text style={styles.modalTitle2}>Select Bottom Bar Frame</Text>
                            <TouchableOpacity onPress={() => setShowBottomBarModal(false)} style={styles.closeButton2}>
                                <MaterialCommunityIcons name="close" size={24} color="#0f172a" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={TEMPLATES}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={item => item.id}
                            contentContainerStyle={styles.carouselContent2}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.carouselItem2,
                                        { width: width }
                                    ]}
                                    onPress={() => {
                                        setSelectedBottomBarTemplate(item.id);
                                        setShowBottomBarModal(false);
                                        setShowBottomBarEditForm(true);
                                    }}
                                >
                                    <View style={{ paddingHorizontal: 40, width: '100%' }}>
                                        <View style={[
                                            styles.framePreviewContainer2,
                                            selectedBottomBarTemplate === item.id && styles.selectedFrameBorder2
                                        ]}>
                                            <RenderBottomBar
                                                template={item.id}
                                                details={bottomBarDetails}
                                                width={width - 80 - 28}
                                            />
                                        </View>
                                        <Text style={[
                                            styles.templateName2,
                                            selectedBottomBarTemplate === item.id && styles.selectedTemplateName2
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
                <View style={styles.modalOverlay2}>
                    <TouchableOpacity
                        style={styles.modalBackdrop2}
                        activeOpacity={1}
                        onPress={() => setShowBottomBarEditForm(false)}
                    />
                    <View style={[styles.bottomSheet2, { height: '70%' }]}>
                        <View style={styles.modalHeader2}>
                            <Text style={styles.modalTitle2}>Edit Bottom Bar Details</Text>
                            <TouchableOpacity onPress={() => setShowBottomBarEditForm(false)} style={styles.closeButton2}>
                                <MaterialCommunityIcons name="close" size={24} color="#0f172a" />
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
                                            setBottomBarDetails(prev => ({ ...prev, photo: result.assets[0].uri }));
                                        }
                                    }}
                                >
                                    {bottomBarDetails.photo ? (
                                        <Image source={{ uri: bottomBarDetails.photo }} style={styles.photoPreviewSmall} />
                                    ) : (
                                        <View style={styles.photoPlaceholderSmall}>
                                            <MaterialCommunityIcons name="camera-plus" size={32} color="#94a3b8" />
                                            <Text style={styles.photoPlaceholderText}>Tap to upload</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
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

            {/* Filter Carousel Modal */}
            <Modal
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
        </View>
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
        padding: 10,
        paddingBottom: 10, // Reduced to fit in one view
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
