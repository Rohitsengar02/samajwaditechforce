import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import MemberIDCardScreen from '@/components/idcards/MemberIDCardScreen';

export default function MemberIDCard() {
    const params = useLocalSearchParams();
    const memberData = params.memberData ? JSON.parse(params.memberData as string) : {};

    return <MemberIDCardScreen route={{ params: { memberData } }} navigation={null} />;
}
