import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTranslation } from '../context/LanguageContext';

interface TranslatedTextProps extends TextProps {
    text?: string;
    children?: React.ReactNode;
}

export const TranslatedText: React.FC<TranslatedTextProps> = ({ text, children, style, ...props }) => {
    const sourceText = text || (typeof children === 'string' ? children : '');
    const translated = useTranslation(sourceText);

    const content = sourceText ? translated : children;

    return <Text style={style} {...props}>{content}</Text>;
};
