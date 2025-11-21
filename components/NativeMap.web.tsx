import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NativeMap = forwardRef((props: any, ref) => {
    return (
        <View style={[props.style, styles.container]}>
            <Text style={styles.text}>Map is not supported on Web</Text>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#666',
    },
});

export default NativeMap;
