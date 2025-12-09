import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Hero1 from './heroTemplates/Hero1';
import Hero2 from './heroTemplates/Hero2';
import Hero3 from './heroTemplates/Hero3';
import Hero4 from './heroTemplates/Hero4';
import Hero5 from './heroTemplates/Hero5';
import Gallery1 from './galleryTemplates/Gallery1';
import Gallery2 from './galleryTemplates/Gallery2';

const { width } = Dimensions.get('window');

// Component Mappings
const HERO_COMPONENTS: { [key: number]: any } = {
    1: Hero1,
    2: Hero2,
    3: Hero3,
    4: Hero4,
    5: Hero5,
};

const GALLERY_COMPONENTS: { [key: number]: any } = {
    1: Gallery1,
    2: Gallery2,
};

// Fallback component for missing templates
const FallbackComponent = ({ type, templateId }: any) => (
    <View style={{ padding: 20, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#6b7280' }}>
            Component not implemented: {type} (Template {templateId})
        </Text>
    </View>
);

export default function PageRenderer({ sections, viewport = 'mobile' }: { sections: any[], viewport?: 'mobile' | 'desktop' }) {
    if (!sections || !Array.isArray(sections)) {
        return null;
    }

    return (
        <View style={{ width: '100%' }}>
            {sections.map((section, index) => (
                <View key={section.id || index} style={{ marginBottom: 0 }}>

                    {/* Hero Handler */}
                    {section.type === 'hero' && section.templateId && (
                        HERO_COMPONENTS[section.templateId] ? (
                            React.createElement(HERO_COMPONENTS[section.templateId], {
                                ...section.content,
                                viewport
                            })
                        ) : (
                            <FallbackComponent type="hero" templateId={section.templateId} />
                        )
                    )}

                    {/* Heading Handler */}
                    {section.type === 'heading' && (
                        <View style={{ paddingHorizontal: 24, paddingVertical: 12 }}>
                            <Text style={{
                                fontSize: section.content.fontSize || 32,
                                fontWeight: section.content.fontWeight || 'bold',
                                color: section.content.color || '#111827',
                                textAlign: section.content.align || 'left',
                                lineHeight: (section.content.fontSize || 32) * (section.content.lineHeight || 1.2),
                                letterSpacing: section.content.letterSpacing || 0,
                                textTransform: section.content.textTransform || 'none',
                                fontFamily: section.content.fontFamily,
                            }}>
                                {section.content.text}
                            </Text>
                        </View>
                    )}

                    {/* Paragraph Handler */}
                    {section.type === 'paragraph' && (
                        <View style={{ paddingHorizontal: 24, paddingVertical: 12 }}>
                            <Text style={{
                                fontSize: section.content.fontSize || 16,
                                fontWeight: section.content.fontWeight || 'normal',
                                color: section.content.color || '#374151',
                                textAlign: section.content.align || 'left',
                                lineHeight: (section.content.fontSize || 16) * (section.content.lineHeight || 1.6),
                                letterSpacing: section.content.letterSpacing || 0,
                                fontFamily: section.content.fontFamily,
                            }}>
                                {section.content.text}
                            </Text>
                        </View>
                    )}

                    {/* Gallery Handler */}
                    {section.type === 'gallery' && section.templateId && (
                        GALLERY_COMPONENTS[section.templateId] ? (
                            React.createElement(GALLERY_COMPONENTS[section.templateId], {
                                ...section.content,
                                viewport
                            })
                        ) : (
                            <FallbackComponent type="gallery" templateId={section.templateId} />
                        )
                    )}

                </View>
            ))}
        </View>
    );
}
