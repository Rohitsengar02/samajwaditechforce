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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { captureRef } from 'react-native-view-shot';
import { removeBackground as imglyRemoveBackground } from '../../utils/backgroundRemoval';
import { getApiUrl } from '../../utils/api';

const { width, height } = Dimensions.get('window');
const SP_RED = '#E30512';
const BANNER_HEIGHT = 80;
const API_URL = getApiUrl();

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

const FONTS = ['System', 'Roboto', 'serif', 'monospace'];
const COLORS = ['#000000', '#FFFFFF', '#E30512', '#1e293b', '#2563eb', '#16a34a', '#d97706', '#dc2626'];

export default function DesktopPosterEditor() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { imageUrl, title } = params;

    const canvasRef = useRef(null);
    const [elements, setElements] = useState<EditorElement[]>([]);
    const [selectedTool, setSelectedTool] = useState<ToolType | null>(null);
    const [canvasSize, setCanvasSize] = useState({ w: 600, h: 750 }); // Default desktop canvas size
    const [bannerText, setBannerText] = useState('Samajwadi Party');

    // Selection State
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [currentImage, setCurrentImage] = useState(imageUrl as string);
    const [zoomScale, setZoomScale] = useState(1);

    // Tools Configuration
    const tools = [
        { id: 'layout', name: 'Layout', icon: 'aspect-ratio' },
        { id: 'banner', name: 'Posters', icon: 'image-multiple' },
        { id: 'text', name: 'Add Text', icon: 'format-text' },
        { id: 'image', name: 'Add Image', icon: 'image-plus' },
        { id: 'music', name: 'Music', icon: 'music-note' },
        { id: 'filter', name: 'Filters', icon: 'filter-variant' },
        { id: 'sticker', name: 'Stickers', icon: 'sticker-emoji' },
        { id: 'shape', name: 'Shapes', icon: 'shape' },
        { id: 'draw', name: 'Draw', icon: 'draw' },
        { id: 'bg', name: 'Background', icon: 'format-color-fill' },
    ];

    useEffect(() => {
        if (imageUrl) {
            Image.getSize(imageUrl as string, (w, h) => {
                const aspectRatio = h / w;
                setCanvasSize({ w: 600, h: 600 * aspectRatio + BANNER_HEIGHT });
            }, (error) => {
                console.error('Error getting image size:', error);
            });
        }
    }, [imageUrl]);

    const handleToolPress = (toolId: string) => {
        const tool = toolId as ToolType;
        setSelectedTool(tool);
        setSelectedElementId(null);

        switch (tool) {
            case 'text':
                addElement('text', 'Double tap to edit');
                break;
            case 'image':
                pickImage();
                break;
            case 'music':
                Alert.alert('Coming Soon', 'Music feature will be available in the next update!');
                break;
            default:
                break;
        }
    };

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
                const uri = await captureRef(canvasRef, {
                    format: 'jpg',
                    quality: 0.9,
                });

                const link = document.createElement('a');
                link.href = uri;
                link.download = `poster-${Date.now()}.jpg`;
                link.click();
            }, 100);
        } catch (error) {
            console.error('Save error:', error);
            Alert.alert('Error', 'Failed to save poster');
        }
    };

    // Draggable Item Component (Simplified for Desktop)
    const DraggableItem = ({ element }: { element: EditorElement }) => {
        // Note: PanResponder might be tricky on web/desktop. 
        // For now, we'll use simple positioning and maybe click-to-select.
        // A full drag-drop implementation on web requires different handling or libraries like react-draggable.
        // However, react-native-web's PanResponder usually works okay-ish.

        const pan = useRef(new Animated.ValueXY({ x: element.x, y: element.y })).current;

        const panResponder = useRef(
            PanResponder.create({
                onStartShouldSetPanResponder: () => true,
                onPanResponderGrant: () => {
                    setIsDragging(true);
                    setSelectedElementId(element.id);
                    pan.setOffset({
                        x: element.x,
                        y: element.y
                    });
                    pan.setValue({ x: 0, y: 0 });
                },
                onPanResponderMove: Animated.event(
                    [null, { dx: pan.x, dy: pan.y }],
                    { useNativeDriver: false }
                ),
                onPanResponderRelease: (_, gestureState) => {
                    pan.flattenOffset();
                    setIsDragging(false);
                    updateElement(element.id, {
                        x: element.x + gestureState.dx,
                        y: element.y + gestureState.dy
                    });
                }
            })
        ).current;

        const isSelected = selectedElementId === element.id;

        return (
            <Animated.View
                {...panResponder.panHandlers}
                style={[
                    styles.element,
                    {
                        transform: pan.getTranslateTransform(),
                        borderColor: isSelected ? SP_RED : 'transparent',
                        borderWidth: isSelected ? 1 : 0,
                    }
                ]}
            >
                {element.type === 'text' ? (
                    <Text style={{
                        color: element.color,
                        fontSize: element.fontSize,
                        fontFamily: element.fontFamily
                    }}>
                        {element.content}
                    </Text>
                ) : (
                    <Image source={{ uri: element.content }} style={{ width: 100, height: 100 }} resizeMode="contain" />
                )}

                {isSelected && (
                    <TouchableOpacity style={styles.deleteBtn} onPress={deleteSelectedElement}>
                        <MaterialCommunityIcons name="close" size={12} color="#fff" />
                    </TouchableOpacity>
                )}
            </Animated.View>
        );
    };

    const selectedElement = elements.find(el => el.id === selectedElementId);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#1e293b" />
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Poster Editor</Text>
                <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Download</Text>
                </TouchableOpacity>
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
                    <View
                        ref={canvasRef}
                        style={[
                            styles.canvas,
                            { width: canvasSize.w, height: canvasSize.h }
                        ]}
                    >
                        <Image
                            source={{ uri: currentImage }}
                            style={[styles.baseImage, { height: canvasSize.h - BANNER_HEIGHT }]}
                            resizeMode="stretch"
                        />

                        <LinearGradient
                            colors={[SP_RED, '#b91c1c']}
                            style={[styles.bannerOverlay, { height: BANNER_HEIGHT }]}
                        >
                            <View style={styles.bannerContent}>
                                <View>
                                    <Text style={styles.bannerTitle}>{bannerText}</Text>
                                    <Text style={styles.bannerSubtitle}>Samajwadi Tech Force</Text>
                                </View>
                            </View>
                        </LinearGradient>

                        {elements.map((el) => (
                            <DraggableItem key={el.id} element={el} />
                        ))}
                    </View>
                </View>

                {/* Right Properties Panel */}
                <View style={styles.rightPanel}>
                    <Text style={styles.panelTitle}>Properties</Text>
                    {selectedElement ? (
                        <View>
                            {selectedElement.type === 'text' && (
                                <>
                                    <Text style={styles.propLabel}>Text</Text>
                                    <TextInput
                                        style={styles.propInput}
                                        value={selectedElement.content}
                                        onChangeText={(text) => updateElement(selectedElement.id, { content: text })}
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
                                                style={[styles.colorDot, { backgroundColor: c }]}
                                                onPress={() => updateElement(selectedElement.id, { color: c })}
                                            />
                                        ))}
                                    </View>
                                </>
                            )}
                            <TouchableOpacity style={styles.deleteButtonFull} onPress={deleteSelectedElement}>
                                <Text style={{ color: '#fff' }}>Delete Element</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <Text style={styles.emptyState}>Select an element to edit properties</Text>
                    )}
                </View>
            </View>
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
    bannerOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    bannerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bannerTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    bannerSubtitle: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
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
        position: 'absolute',
    },
    deleteBtn: {
        position: 'absolute',
        top: -10,
        right: -10,
        backgroundColor: 'red',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
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
});
