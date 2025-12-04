import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

import DesktopHeader from '../../components/DesktopHeader';

export default function DesktopTraining() {
    const router = useRouter();

    const courses = [
        { id: 1, title: 'Political Leadership 101', duration: '6 weeks', students: 245, level: 'Beginner', image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400', progress: 0 },
        { id: 2, title: 'Community Organizing', duration: '4 weeks', students: 189, level: 'Intermediate', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400', progress: 35 },
        { id: 3, title: 'Social Media Campaign Management', duration: '3 weeks', students: 312, level: 'Advanced', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400', progress: 100 },
        { id: 4, title: 'Public Speaking Skills', duration: '5 weeks', students: 276, level: 'Beginner', image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400', progress: 0 },
        { id: 5, title: 'Electoral Strategy & Planning', duration: '8 weeks', students: 156, level: 'Advanced', image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=400', progress: 60 },
        { id: 6, title: 'Grassroots Mobilization', duration: '4 weeks', students: 203, level: 'Intermediate', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400', progress: 0 },
    ];

    return (
        <View style={styles.container}>
            <DesktopHeader />
            <ScrollView>
                <View style={styles.hero}>
                    <View style={styles.badge}><MaterialCommunityIcons name="school" size={18} color={SP_RED} /><Text style={styles.badgeText}>Training Center</Text></View>
                    <Text style={styles.heroTitle}>Learn & Lead</Text>
                    <Text style={styles.heroSubtitle}>Build skills to become effective leaders and changemakers</Text>
                </View>

                <View style={styles.coursesSection}>
                    <Text style={styles.sectionTitle}>Available Courses</Text>
                    <View style={styles.coursesGrid}>
                        {courses.map((course) => (
                            <Pressable key={course.id} style={styles.courseCard}>
                                <Image source={{ uri: course.image }} style={styles.courseImage} resizeMode="cover" />
                                <View style={styles.levelBadge}><Text style={styles.levelText}>{course.level}</Text></View>
                                <View style={styles.courseContent}>
                                    <Text style={styles.courseTitle}>{course.title}</Text>
                                    <View style={styles.courseStats}>
                                        <View style={styles.courseStat}>
                                            <MaterialCommunityIcons name="clock-outline" size={16} color="#64748b" />
                                            <Text style={styles.courseStatText}>{course.duration}</Text>
                                        </View>
                                        <View style={styles.courseStat}>
                                            <MaterialCommunityIcons name="account-group" size={16} color="#64748b" />
                                            <Text style={styles.courseStatText}>{course.students} students</Text>
                                        </View>
                                    </View>
                                    {course.progress > 0 ? (
                                        <View style={styles.progressSection}>
                                            <View style={styles.progressBar}>
                                                <View style={[styles.progressFill, { width: `${course.progress}%` }]} />
                                            </View>
                                            <Text style={styles.progressText}>{course.progress}% Complete</Text>
                                        </View>
                                    ) : (
                                        <Pressable style={styles.enrollBtn}>
                                            <Text style={styles.enrollBtnText}>Enroll Now</Text>
                                        </Pressable>
                                    )}
                                </View>
                            </Pressable>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 60, paddingVertical: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', zIndex: 100 },
    headerLogo: { fontSize: 24, fontWeight: '900', color: SP_RED },
    navMenu: { flexDirection: 'row', alignItems: 'center', gap: 32 },
    navItem: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    langSwitch: { fontSize: 14, fontWeight: '600', color: '#64748b', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#f1f5f9' },
    loginBtn: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
    signupBtn: { backgroundColor: SP_RED, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
    signupBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    hero: { backgroundColor: '#fef2f2', paddingHorizontal: 60, paddingVertical: 80 },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 20 },
    badgeText: { fontSize: 14, color: SP_RED, fontWeight: '600' },
    heroTitle: { fontSize: 48, fontWeight: '900', color: '#1e293b', marginBottom: 16 },
    heroSubtitle: { fontSize: 18, color: '#64748b' },
    coursesSection: { padding: 60 },
    sectionTitle: { fontSize: 32, fontWeight: '800', color: '#1e293b', marginBottom: 32 },
    coursesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 24 },
    courseCard: { width: '31%', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
    courseImage: { width: '100%', height: 180 },
    levelBadge: { position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
    levelText: { fontSize: 12, fontWeight: '600', color: '#fff' },
    courseContent: { padding: 20 },
    courseTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 16, lineHeight: 24 },
    courseStats: { gap: 12, marginBottom: 20 },
    courseStat: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    courseStatText: { fontSize: 14, color: '#64748b' },
    progressSection: { gap: 8 },
    progressBar: { height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: SP_GREEN, borderRadius: 3 },
    progressText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
    enrollBtn: { backgroundColor: SP_RED, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    enrollBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
