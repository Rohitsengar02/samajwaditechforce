import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { RenderBottomBar } from '../components/posteredit/BottomBarTemplates';

export default function ExportMaster() {
    const params = useLocalSearchParams();
    const [config, setConfig] = useState<any>(null);

    useEffect(() => {
        if (params.data) {
            try {
                const decoded = JSON.parse(params.data as string);
                setConfig(decoded);
            } catch (e) {
                console.error("Failed to parse export data", e);
            }
        }
    }, [params.data]);

    if (!config) return null;

    // Fixed High-Resolution dimensions for capture
    const MASTER_WIDTH = 1200;
    const MASTER_HEIGHT = 1500; // Standard SP Poster Ratio

    return (
        <View style={{ width: MASTER_WIDTH, height: MASTER_HEIGHT, backgroundColor: '#fff', position: 'relative', overflow: 'hidden' }}>
            {/* 1. Main Background Template */}
            {/* 1. Main Background Template - Use HTML img for Web/Puppeteer to support CORS */}
            <img
                src={config.currentImage}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                }}
                crossOrigin="anonymous"
                alt="Poster Background"
            />

            {/* 2. Custom Layers */}
            {config.elements?.map((el: any) => (
                <View
                    key={el.id}
                    style={{
                        position: 'absolute',
                        left: el.x * (MASTER_WIDTH / config.canvasWidth),
                        top: el.y * (MASTER_HEIGHT / config.canvasHeight),
                        transform: [
                            { scale: el.scale },
                            { rotate: `${el.rotation}deg` }
                        ],
                        zIndex: 10
                    }}
                >
                    {el.type === 'text' && (
                        <Text style={{
                            color: el.color || '#000',
                            fontSize: el.fontSize || 20,
                            fontFamily: el.fontFamily || 'System',
                            fontWeight: 'bold',
                            backgroundColor: el.backgroundColor || 'transparent'
                        }}>
                            {el.content}
                        </Text>
                    )}
                    {el.type === 'image' && (
                        <img
                            src={el.content}
                            style={{
                                width: el.width,
                                height: el.height,
                                objectFit: 'contain'
                            }}
                            crossOrigin="anonymous"
                            alt="Sticker"
                        />
                    )}
                </View>
            ))}

            {/* 3. Bottom Bar Template */}
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 160, zIndex: 20 }}>
                <RenderBottomBar
                    templateId={config.selectedTemplate}
                    details={config.details}
                    width={MASTER_WIDTH}
                    customization={config.customization || {}}
                />
            </View>
        </View>
    );
}
