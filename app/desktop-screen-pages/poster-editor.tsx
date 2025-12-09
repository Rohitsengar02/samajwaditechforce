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
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { loadHtml2Canvas } from '../../utils/loadHtml2Canvas';

const { width, height } = Dimensions.get('window');
const SP_RED = '#E30512';
const BANNER_HEIGHT = 80;
const API_URL = getApiUrl();

import DesktopHeader from '../../components/DesktopHeader';

type ToolType = 'text' | 'image' | 'layout' | 'banner' | 'filter' | 'sticker';

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
        { id: 'layout', name: 'Layout', icon: 'aspect-ratio' },
        { id: 'banner', name: 'Posters', icon: 'image-multiple' },
        { id: 'text', name: 'Add Text', icon: 'format-text' },
        { id: 'image', name: 'Add Image', icon: 'image-plus' },
        { id: 'filter', name: 'Filters', icon: 'filter-variant' },
        { id: 'sticker', name: 'Stickers', icon: 'sticker-emoji' },
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
    }, []);

    const fetchPosters = async () => {
        setIsLoadingPosters(true);
        try {
            const response = await fetch(`${API_URL}/api/posters`);
            const data = await response.json();
            if (data.success) {
                setAvailablePosters(data.data);
            }
        } catch (error) {
            console.error('Error fetching posters:', error);
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
        setSelectedElementId(newElement.id);
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
                        link.download = `poster-${Date.now()}.jpg`;
                        link.click();
                    } else {
                        // Fallback: Simple approach for basic images
                        Alert.alert('Info', 'For best results, please refresh the page. Using fallback download method.');

                        // Try to capture just the main image
                        const imgElement = canvasElement.querySelector('img');
                        if (imgElement) {
                            const link = document.createElement('a');
                            link.href = imgElement.src;
                            link.download = `poster-${Date.now()}.jpg`;
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
            setTimeout(async () => {
                try {
                    const canvasElement = canvasRef.current as any;
                    if (!canvasElement) {
                        Alert.alert('Error', 'Canvas not found');
                        return;
                    }

                    let uri: string;

                    // Use html2canvas if available
                    if (typeof window !== 'undefined' && (window as any).html2canvas) {
                        const html2canvas = (window as any).html2canvas;
                        const canvas = await html2canvas(canvasElement, {
                            useCORS: true,
                            allowTaint: true,
                            backgroundColor: '#ffffff',
                            scale: 2,
                        });
                        uri = canvas.toDataURL('image/png', 1);
                    } else {
                        Alert.alert('Error', 'PDF export requires html2canvas library. Please use JPG download instead.');
                        return;
                    }

                    const html = `
                        <html>
                            <head>
                                <style>
                                    body {
                                        margin: 0;
                                        padding: 0;
                                        display: flex;
                                        justify-content: center;
                                        align-items: center;
                                    }
                                    img {
                                        max-width: 100%;
                                        height: auto;
                                    }
                                </style>
                            </head>
                            <body>
                                <img src="${uri}" />
                            </body>
                        </html>
                    `;

                    const { uri: pdfUri } = await Print.printToFileAsync({ html });

                    const link = document.createElement('a');
                    link.href = pdfUri;
                    link.download = `poster-${Date.now()}.pdf`;
                    link.click();
                } catch (innerError) {
                    console.error('PDF error:', innerError);
                    Alert.alert('Error', 'Failed to create PDF. Try using JPG download instead.');
                }
            }, 100);
        } catch (error) {
            console.error('PDF error:', error);
            Alert.alert('Error', 'Failed to create PDF');
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
                onMoveShouldSetPanResponder: () => true,
                onPanResponderGrant: () => {
                    setIsDragging(true);
                    setSelectedElementId(element.id);
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
                                    { fontWeight: '700' },
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
            <DesktopHeader />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#1e293b" />
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Poster Editor</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity onPress={handleDownloadPDF} style={[styles.saveButton, { backgroundColor: '#16a34a' }]}>
                        <MaterialCommunityIcons name="file-pdf-box" size={18} color="#fff" />
                        <Text style={styles.saveButtonText}>PDF</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                        <MaterialCommunityIcons name="download" size={18} color="#fff" />
                        <Text style={styles.saveButtonText}>Download</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.workspace}>
                {/* Left Toolbar */}
                <View style={styles.leftToolbar}>
                    {tools.map((tool) => (
                        <TouchableOpacity
                            key={tool.id}
                            style={[
                                styles.toolItem,
                                selectedTool === tool.id && styles.selectedTool
                            ]}
                            onPress={() => handleToolPress(tool.id)}
                        >
                            <MaterialCommunityIcons
                                name={tool.icon as any}
                                size={24}
                                color={selectedTool === tool.id ? SP_RED : '#64748b'}
                            />
                            <Text style={[
                                styles.toolName,
                                selectedTool === tool.id && styles.selectedToolText
                            ]}>{tool.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Main Canvas */}
                <View style={styles.canvasArea}>
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

                    <View style={{ transform: [{ scale: zoomScale }] }}>
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

                            {/* Dynamic Bottom Bar */}
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

                {/* Right Properties Panel */}
                <View style={styles.rightPanel}>
                    <Text style={styles.panelTitle}>
                        {selectedElement ? 'Properties' : selectedTool ? tools.find(t => t.id === selectedTool)?.name : 'Options'}
                    </Text>

                    {selectedElement ? (
                        // Show element properties when element is selected
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {selectedElement.type === 'text' && (
                                <>
                                    <Text style={styles.propLabel}>Text</Text>
                                    <TextInput
                                        style={styles.propInput}
                                        value={selectedElement.content}
                                        onChangeText={(text) => updateElement(selectedElement.id, { content: text })}
                                        multiline
                                    />

                                    <Text style={styles.propLabel}>Size: {selectedElement.fontSize}</Text>
                                    <View style={styles.row}>
                                        <TouchableOpacity onPress={() => updateElement(selectedElement.id, { fontSize: (selectedElement.fontSize || 24) - 2 })} style={styles.propBtn}><Text>-</Text></TouchableOpacity>
                                        <TouchableOpacity onPress={() => updateElement(selectedElement.id, { fontSize: (selectedElement.fontSize || 24) + 2 })} style={styles.propBtn}><Text>+</Text></TouchableOpacity>
                                    </View>

                                    <Text style={styles.propLabel}>Color</Text>
                                    <View style={styles.colorGrid}>
                                        {COLORS.map(c => (
                                            <TouchableOpacity
                                                key={c}
                                                style={[styles.colorDot, { backgroundColor: c }, selectedElement.color === c && { borderWidth: 3, borderColor: SP_RED }]}
                                                onPress={() => updateElement(selectedElement.id, { color: c })}
                                            />
                                        ))}
                                    </View>
                                </>
                            )}

                            {selectedElement.type === 'image' && (
                                <>
                                    <TouchableOpacity
                                        style={[styles.toolActionButton, { backgroundColor: '#16a34a' }]}
                                        onPress={() => {
                                            setSelectedImageUri(selectedElement.content);
                                            setProcessedImageUri(null);
                                            setShowImageModal(true);
                                        }}
                                    >
                                        <MaterialCommunityIcons name="image-filter-center-focus" size={20} color="#fff" />
                                        <Text style={styles.toolActionText}>Remove Background</Text>
                                    </TouchableOpacity>
                                </>
                            )}

                            <TouchableOpacity style={styles.deleteButtonFull} onPress={deleteSelectedElement}>
                                <MaterialCommunityIcons name="delete" size={20} color="#fff" />
                                <Text style={{ color: '#fff', marginLeft: 8 }}>Delete Element</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    ) : selectedTool ? (
                        // Show tool options when a tool is selected
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {selectedTool === 'text' && (
                                <>
                                    <Text style={styles.sectionTitle}>Add Text</Text>
                                    <Text style={styles.helpText}>Click button below to add text to your poster</Text>
                                    <TouchableOpacity
                                        style={styles.toolActionButton}
                                        onPress={() => addElement('text', 'Double tap to edit')}
                                    >
                                        <MaterialCommunityIcons name="text-box-plus" size={24} color="#fff" />
                                        <Text style={styles.toolActionText}>Add Text Element</Text>
                                    </TouchableOpacity>
                                </>
                            )}

                            {selectedTool === 'image' && (
                                <>
                                    <Text style={styles.sectionTitle}>Add Image</Text>
                                    <Text style={styles.helpText}>Choose an image from your device</Text>
                                    <TouchableOpacity
                                        style={styles.toolActionButton}
                                        onPress={pickImage}
                                    >
                                        <MaterialCommunityIcons name="image-plus" size={24} color="#fff" />
                                        <Text style={styles.toolActionText}>Choose Image</Text>
                                    </TouchableOpacity>
                                </>
                            )}

                            {selectedTool === 'filter' && (
                                <>
                                    <Text style={styles.sectionTitle}>Filters</Text>
                                    <Text style={styles.helpText}>Apply filters to your poster</Text>
                                    <View style={{ gap: 12, marginTop: 16 }}>
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
                            )}

                            {selectedTool === 'banner' && (
                                <>
                                    <Text style={styles.sectionTitle}>Available Posters</Text>
                                    <Text style={styles.helpText}>Select a poster template to start editing</Text>

                                    {isLoadingPosters ? (
                                        <View style={{ padding: 40, alignItems: 'center' }}>
                                            <ActivityIndicator size="large" color={SP_RED} />
                                            <Text style={{ marginTop: 12, color: '#64748b' }}>Loading posters...</Text>
                                        </View>
                                    ) : (
                                        <ScrollView
                                            style={{ maxHeight: 500 }}
                                            showsVerticalScrollIndicator={false}
                                        >
                                            <View style={{ gap: 12 }}>
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
                                        </ScrollView>
                                    )}
                                </>
                            )}

                            {selectedTool === 'sticker' && (
                                <>
                                    <Text style={styles.sectionTitle}>Bottom Bar Frames</Text>
                                    <Text style={styles.helpText}>Add customizable bottom bar to your poster</Text>
                                    <TouchableOpacity
                                        style={styles.toolActionButton}
                                        onPress={() => setShowBottomBarModal(true)}
                                    >
                                        <MaterialCommunityIcons name="sticker-emoji" size={24} color="#fff" />
                                        <Text style={styles.toolActionText}>Choose Frame</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.toolActionButton, { backgroundColor: '#6366f1', marginTop: 12 }]}
                                        onPress={() => setShowBottomBarEditForm(true)}
                                    >
                                        <MaterialCommunityIcons name="pencil" size={24} color="#fff" />
                                        <Text style={styles.toolActionText}>Edit Details</Text>
                                    </TouchableOpacity>
                                </>
                            )}

                            {selectedTool === 'layout' && (
                                <>
                                    <Text style={styles.sectionTitle}>Canvas Size</Text>
                                    <Text style={styles.helpText}>Adjust poster dimensions</Text>
                                    <View style={{ gap: 12, marginTop: 16 }}>
                                        <TouchableOpacity style={styles.layoutOption}>
                                            <Text style={styles.layoutOptionText}>Portrait (3:4)</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.layoutOption}>
                                            <Text style={styles.layoutOptionText}>Square (1:1)</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.layoutOption}>
                                            <Text style={styles.layoutOptionText}>Landscape (4:3)</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                        </ScrollView>
                    ) : (
                        <Text style={styles.emptyState}>Select a tool or element to see options</Text>
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
                                    value={bottomBarDetails.social}
                                    onChangeText={(text) => setBottomBarDetails(prev => ({ ...prev, social: text }))}
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
                                style={[styles.toolActionButton, { backgroundColor: '#16a34a' }]}
                                onPress={handleRemoveBackground}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <MaterialCommunityIcons name="image-filter-center-focus" size={24} color="#fff" />
                                        <Text style={styles.toolActionText}>
                                            {processedImageUri ? 'Background Removed!' : 'Remove Background'}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>

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
        </View>
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
        width: 80,
        backgroundColor: '#fff',
        borderRightWidth: 1,
        borderRightColor: '#e2e8f0',
        paddingVertical: 20,
        alignItems: 'center',
        gap: 20,
    },
    toolItem: {
        alignItems: 'center',
        gap: 4,
        padding: 8,
        borderRadius: 8,
        width: 70,
    },
    selectedTool: {
        backgroundColor: '#fee2e2',
    },
    toolName: {
        fontSize: 10,
        color: '#64748b',
    },
    selectedToolText: {
        color: SP_RED,
        fontWeight: '600',
    },
    canvasArea: {
        flex: 1,
        backgroundColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
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
        width: 300,
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
});
