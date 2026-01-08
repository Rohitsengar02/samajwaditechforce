import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Modal, ActivityIndicator, Animated, Platform, Alert } from 'react-native';
import { Title, Text, Card } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import IDCardPreview from '../../components/idcards/IDCardPreview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

const SP_RED = '#E30512';
const SP_GREEN = '#009933';

export default function IDCardTab() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const isDesktop = width > 900;

    const [isVerified, setIsVerified] = useState<boolean | null>(null);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [userInfo, setUserInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isCardGenerated, setIsCardGenerated] = useState(false);
    const [showGeneratingModal, setShowGeneratingModal] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const scaleAnim = useRef(new Animated.Value(0.3)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    // Check verification status every time page comes into focus
    useFocusEffect(
        React.useCallback(() => {
            checkVerificationStatus();
        }, [])
    );

    useEffect(() => {
        if (showGeneratingModal) {
            // Reset animations
            scaleAnim.setValue(0.3);
            rotateAnim.setValue(0);

            // Start animations
            Animated.parallel([
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(scaleAnim, {
                            toValue: 1,
                            duration: 1000,
                            useNativeDriver: true,
                        }),
                        Animated.timing(scaleAnim, {
                            toValue: 0.3,
                            duration: 1000,
                            useNativeDriver: true,
                        }),
                    ])
                ),
                Animated.loop(
                    Animated.timing(rotateAnim, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: true,
                    })
                ),
            ]).start();
        }
    }, [showGeneratingModal]);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const checkVerificationStatus = async () => {
        try {
            const userInfoStr = await AsyncStorage.getItem('userInfo');
            if (userInfoStr) {
                const userData = JSON.parse(userInfoStr);
                setUserInfo(userData);

                // Check if user is verified AND has all required fields
                const hasAllRequiredFields = userData.district && userData.vidhanSabha && userData.qualification;
                const isVerifiedStatus = userData.verificationStatus === 'Verified';

                if (isVerifiedStatus && hasAllRequiredFields) {
                    setIsVerified(true);
                    setShowVerificationModal(false);
                } else {
                    setIsVerified(false);
                    setShowVerificationModal(true);
                }
            } else {
                setIsVerified(false);
                setShowVerificationModal(true);
            }
        } catch (error) {
            console.error('Error checking verification:', error);
            setIsVerified(false);
            setShowVerificationModal(true);
        } finally {
            setLoading(false);
        }
    };

    // Calculate age from DOB
    const calculateAge = (dob: string) => {
        if (!dob) return '';

        let birthDate;
        // Check if date is in DD/MM/YYYY format (e.g. "20/12/2002")
        if (dob.includes('/')) {
            const parts = dob.split('/');
            if (parts.length === 3) {
                // parts[0] is day, parts[1] is month, parts[2] is year
                // new Date(year, monthIndex, day) - month is 0-indexed
                birthDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            } else {
                birthDate = new Date(dob);
            }
        } else {
            birthDate = new Date(dob);
        }

        if (isNaN(birthDate.getTime())) return ''; // Handle invalid date

        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age.toString();
    };

    // Prepare member data for ID card
    const memberData = {
        _id: userInfo?._id || '',
        uniqueId: userInfo?._id || `SP-TF-${Date.now().toString().slice(-6)}`,
        fullName: userInfo?.name || 'Member Name',
        mobile: userInfo?.phone || userInfo?.mobile || '',
        district: userInfo?.district || '',
        vidhanSabha: userInfo?.vidhanSabha || '',
        age: calculateAge(userInfo?.dob) || userInfo?.age || '',
        qualification: userInfo?.qualification || '',
        photo: userInfo?.profilePhoto || userInfo?.profileImage || "https://cdn.7boats.com/academy/wp-content/uploads/2022/02/avatar-new.png",
        email: userInfo?.email || '',
        partyRole: userInfo?.partyRole || 'Member',
        memberSince: userInfo?.partyJoiningDate || userInfo?.createdAt?.substring(0, 4) || '2024',
        socialMedia: userInfo?.socialMedia || [],
        verificationStatus: userInfo?.verificationStatus || 'Not Applied'
    };

    const handleGenerateCard = () => {
        setShowGeneratingModal(true);

        // Show animation for 3 seconds before displaying card
        setTimeout(() => {
            setShowGeneratingModal(false);
            setIsCardGenerated(true);
        }, 3000);
    };

    const handleDownloadPDF = async () => {
        if (isDownloading) return;

        try {
            setIsDownloading(true);
            console.log('Starting PDF download...');

            let photoBase64 = '';
            const photoSource = memberData.photo;

            if (photoSource) {
                try {
                    if (photoSource.startsWith('data:')) {
                        photoBase64 = photoSource;
                    } else if (photoSource.startsWith('http')) {
                        console.log('Fetching remote image to convert to base64...');
                        const response = await fetch(photoSource);
                        const blob = await response.blob();

                        await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                photoBase64 = reader.result as string;
                                resolve(null);
                            };
                            reader.onerror = reject;
                            reader.readAsDataURL(blob);
                        });
                        console.log('Converted remote image to base64 successfully');
                    } else {
                        if (Platform.OS !== 'web') {
                            const base64 = await FileSystem.readAsStringAsync(photoSource, { encoding: 'base64' });
                            photoBase64 = `data:image/jpeg;base64,${base64}`;
                        } else {
                            photoBase64 = photoSource;
                        }
                    }
                } catch (e) {
                    console.error('Photo processing error:', e);
                    photoBase64 = 'https://cdn.7boats.com/academy/wp-content/uploads/2022/02/avatar-new.png';
                }
            } else {
                photoBase64 = 'https://cdn.7boats.com/academy/wp-content/uploads/2022/02/avatar-new.png';
            }

            const fullID = memberData.uniqueId || memberData._id || `SP-TF-${Date.now().toString().slice(-6)}`;
            const IDNumber = fullID.slice(0, 6).toUpperCase();

            const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;600;700;900&display=swap');
    @page { size: A4; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Roboto', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { width: 210mm; height: 297mm; display: flex; justify-content: center; align-items: center; background: white; }
    .page:first-child { page-break-after: always; }
    .card { width: 330px; height: 600px; border-radius: 18px; overflow: hidden; background: #F8FAFC; position: relative; display: flex; flex-direction: column; }
    .header { background: linear-gradient(135deg, #E30512 0%, #B00410 100%); color: white; padding: 20px; text-align: right; position: relative; overflow: hidden; }
    .header-pattern { position: absolute; width: 100%; height: 100%; top: 0; left: 0; }
    .pattern-circle { position: absolute; width: 80px; height: 80px; border-radius: 40px; background: rgba(255,255,255,0.1); }
    .pattern-circle-1 { top: -20px; right: -20px; }
    .pattern-circle-2 { bottom: -30px; left: -30px; }
    .header-logo { position: absolute; left: 16px; top: 16px; width: 70px; height: 70px; object-fit: contain; z-index: 3; }
    .header-text { position: relative; z-index: 2; }
    .party-name { font-size: 22px; font-weight: 900; letter-spacing: 0.5px; margin-bottom: 14px; margin-top: -14px; }
    .tech-force-badge { display: inline-flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.2); padding: 3px 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.3); }
    .tech-force { font-size: 14px; letter-spacing: 2px; text-align: center; margin-top: -4px; font-weight: 700; }
    .card-body { flex: 1; padding: 16px; padding-top: 20px; padding-bottom: 8px; }
    .profile-card { display: flex; flex-direction: column; border-radius: 12px; padding: 12px; margin-bottom: 12px; align-items: center; gap: 8px; }
    .photo-container { position: relative; flex-shrink: 0; }
    .member-photo { width: 100px; height: 100px; border-radius: 50px; object-fit: cover; }
    .photo-border { position: absolute; top: -3px; left: -3px; width: 106px; height: 106px; border-radius: 53px; border: 2.5px solid #E30512; pointer-events: none; }
    .info-list { background: #fff; border-radius: 12px; padding: 8px 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #F1F5F9; }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-size: 13px; color: #64748B; font-weight: 600; }
    .info-value { font-size: 13px; color: #0F172A; font-weight: 700; text-align: right; }
    .qr-container { border-radius: 12px; padding: 10px; margin-top: 10px; text-align: center; flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; }
    .qr-wrapper { padding: 8px; background: #fff; border-radius: 8px; border: 2px solid #F1F5F9; display: inline-block; }
    .qr-text { font-size: 11px; color: #64748B; font-weight: 600; margin-top: 8px; }
    .qr-id-text { font-size: 9px; color: #94A3B8; font-weight: 700; letter-spacing: 0.5px; margin-top: 4px; }
    .footer-gradient { background: linear-gradient(90deg, #E30512 0%, #B00410 100%); padding: 12px 16px; }
    .footer-content { display: flex; align-items: center; justify-content: center; gap: 8px; }
    .footer-text-white { color: #fff; font-size: 12px; font-weight: 700; }
    .web-icon { width: 14px; height: 14px; fill: #fff; }
    .card-footer { padding: 12px 16px; text-align: center; background: #E30512; }
    .social-icons { display: flex; gap: 12px; justify-content: center; margin-bottom: 8px; }
    .social-icon { width: 28px; height: 28px; border-radius: 14px; background: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
    .footer-text { font-size: 11px; color: #fff; font-weight: 600; }
  </style>
</head>
<body>
  <div class="page">
    <div class="card">
      <div class="header">
        <div class="header-pattern">
          <div class="pattern-circle pattern-circle-1"></div>
          <div class="pattern-circle pattern-circle-2"></div>
        </div>
        <img src="https://res.cloudinary.com/dssmutzly/image/upload/v1763543757/928c21d2-4d75-46a6-9265-0531d5433c29_txhwun.png" class="header-logo" crossorigin="anonymous" />
        <div class="header-text">
          <div class="party-name">समाजवादी टेक फोर्स</div>
          <div class="tech-force-badge"><span class="tech-force">MEMBER DETAILS</span></div>
        </div>
      </div>
      <div class="card-body">
        <div class="profile-card">
          <div class="photo-container">
            <img src="${photoBase64}" class="member-photo" crossorigin="anonymous" />
            <div class="photo-border"></div>
          </div>
        </div>
        <div class="info-list">
          <div class="info-row"><span class="info-label">Name:</span><span class="info-value">${memberData.fullName || 'नाम'}</span></div>
          <div class="info-row"><span class="info-label">Mobile:</span><span class="info-value">+91 ${memberData.mobile || '----------'}</span></div>
          <div class="info-row"><span class="info-label">District:</span><span class="info-value">${memberData.district || 'जिला'}</span></div>
          <div class="info-row"><span class="info-label">Vidhan Sabha:</span><span class="info-value">${memberData.vidhanSabha || 'विधानसभा'}</span></div>
          <div class="info-row"><span class="info-label">Age:</span><span class="info-value">${memberData.age ? `${memberData.age} वर्ष` : '-- वर्ष'}</span></div>
          <div class="info-row"><span class="info-label">Qualification:</span><span class="info-value">${memberData.qualification || 'योग्यता'}</span></div>
        </div>
      </div>
      <div class="footer-gradient">
        <div class="footer-content">
          <svg class="web-icon" viewBox="0 0 24 24"><path d="M16.36,14C16.44,13.34 16.5,12.68 16.5,12C16.5,11.32 16.44,10.66 16.36,10H19.74C19.9,10.64 20,11.31 20,12C20,12.69 19.9,13.36 19.74,14M14.59,19.56C15.19,18.45 15.65,17.25 15.97,16H18.92C17.96,17.65 16.43,18.93 14.59,19.56M14.34,14H9.66C9.56,13.34 9.5,12.68 9.5,12C9.5,11.32 9.56,10.65 9.66,10H14.34C14.43,10.65 14.5,11.32 14.5,12C14.5,12.68 14.43,13.34 14.34,14M12,19.96C11.17,18.76 10.5,17.43 10.09,16H13.91C13.5,17.43 12.83,18.76 12,19.96M8,8H5.08C6.03,6.34 7.57,5.06 9.4,4.44C8.8,5.55 8.35,6.75 8,8M5.08,16H8C8.35,17.25 8.8,18.45 9.4,19.56C7.57,18.93 6.03,17.65 5.08,16M4.26,14C4.1,13.36 4,12.69 4,12C4,11.31 4.1,10.64 4.26,10H7.64C7.56,10.66 7.5,11.32 7.5,12C7.5,12.68 7.56,13.34 7.64,14M12,4.03C12.83,5.23 13.5,6.57 13.91,8H10.09C10.5,6.57 11.17,5.23 12,4.03M18.92,8H15.97C15.65,6.75 15.19,5.55 14.59,4.44C16.43,5.07 17.96,6.34 18.92,8M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" /></svg>
          <span class="footer-text-white">www.samajwaditechforce.com</span>
        </div>
      </div>
    </div>
  </div>
  <div class="page">
    <div class="card">
      <div class="header">
        <div class="header-pattern">
          <div class="pattern-circle pattern-circle-1"></div>
          <div class="pattern-circle pattern-circle-2"></div>
        </div>
        <img src="https://res.cloudinary.com/dssmutzly/image/upload/v1763543757/928c21d2-4d75-46a6-9265-0531d5433c29_txhwun.png" class="header-logo" />
        <div class="header-text">
          <div class="party-name">समाजवादी टेक फोर्स</div>
          <div class="tech-force-badge"><span class="tech-force">MEMBER DETAILS</span></div>
        </div>
      </div>
      <div class="card-body">
        <div class="info-list">
          <div class="info-row"><span class="info-label">Email:</span><span class="info-value" style="font-size: 11px;">${memberData.email || 'Not Provided'}</span></div>
          <div class="info-row"><span class="info-label">Party Role:</span><span class="info-value">${memberData.partyRole || 'Member'}</span></div>
          <div class="info-row"><span class="info-label">Member Since:</span><span class="info-value">${memberData.memberSince || '2024'}</span></div>
        </div>
        <div class="qr-container">
          <div class="qr-wrapper">
            <svg viewBox="0 0 24 24" width="80" height="80">
              <path fill="#000" d="M3,11H5V13H3V11M11,5H13V9H11V5M9,11H13V15H11V13H9V11M15,11H17V13H19V11H21V13H19V15H21V19H19V21H17V19H13V21H11V17H15V15H17V13H15V11M19,19V15H17V19H19M15,3H21V9H15V3M17,5V7H19V5H17M3,3H9V9H3V3M5,5V7H7V5H5M3,15H9V21H3V15M5,17V19H7V17H5Z" />
            </svg>
          </div>
          <div class="qr-text">Scan for verification</div>
          <div class="qr-id-text">UID:- ${IDNumber}</div>
        </div>
      </div>
      <div class="card-footer">
        <div class="social-icons">
          <div class="social-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#3B82F6">
              <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
            </svg>
          </div>
          <div class="social-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#1DA1F2">
              <path d="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 3,4.79C2.63,5.42 2.42,6.16 2.42,6.94C2.42,8.43 3.17,9.75 4.33,10.5C3.62,10.5 2.96,10.3 2.38,10C2.38,10 2.38,10 2.38,10.03C2.38,12.11 3.86,13.85 5.82,14.24C5.46,14.34 5.08,14.39 4.69,14.39C4.42,14.39 4.15,14.36 3.89,14.31C4.43,16 6,17.26 7.89,17.29C6.43,18.45 4.58,19.13 2.56,19.13C2.22,19.13 1.88,19.11 1.54,19.07C3.44,20.29 5.70,21 8.12,21C16,21 20.33,14.46 20.33,8.79C20.33,8.6 20.33,8.42 20.32,8.23C21.16,7.63 21.88,6.87 22.46,6Z" />
            </svg>
          </div>
          <div class="social-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#E4405F">
              <path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" />
            </svg>
          </div>
          <div class="social-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF0000">
              <path d="M10,15L15.19,12L10,9V15M21.56,7.17C21.69,7.64 21.78,8.27 21.84,9.07C21.91,9.87 21.94,10.56 21.94,11.16L22,12C22,14.19 21.84,15.8 21.56,16.83C21.31,17.73 20.73,18.31 19.83,18.56C19.36,18.69 18.5,18.78 17.18,18.84C15.88,18.91 14.69,18.94 13.59,18.94L12,19C7.81,19 5.2,18.84 4.17,18.56C3.27,18.31 2.69,17.73 2.44,16.83C2.31,16.36 2.22,15.73 2.16,14.93C2.09,14.13 2.06,13.44 2.06,12.84L2,12C2,9.81 2.16,8.2 2.44,7.17C2.69,6.27 3.27,5.69 4.17,5.44C4.64,5.31 5.5,5.22 6.82,5.16C8.12,5.09 9.31,5.06 10.41,5.06L12,5C16.19,5 18.8,5.16 19.83,5.44C20.73,5.69 21.31,6.27 21.56,7.17Z" />
            </svg>
          </div>
        </div>
        <div class="footer-text">samajwaditechforce.com</div>
      </div>
    </div>
  </div>
</body>
</html>`;

            if (Platform.OS === 'web') {
                const html2pdf = (await import('html2pdf.js')).default;
                const element = document.createElement('div');
                element.innerHTML = htmlContent;

                const opt = {
                    margin: 0,
                    filename: `SP-ID-Card-${memberData.fullName || 'member'}-${Date.now()}.pdf`,
                    image: { type: 'jpeg' as const, quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
                    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
                };

                await html2pdf().set(opt).from(element).save();
                Alert.alert('Success!', 'ID Card PDF downloaded!');
            } else {
                const { uri } = await Print.printToFileAsync({ html: htmlContent, base64: false });
                await Sharing.shareAsync(uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Save ID Card PDF',
                    UTI: 'com.adobe.pdf'
                });
                Alert.alert('Success!', 'ID Card PDF shared!');
            }
        } catch (error) {
            console.error('PDF Error:', error);
            Alert.alert('Error', `PDF download failed: ${error}`);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#ffffff', '#f0fdf4']} style={styles.background} />

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={SP_RED} />
                    <Text style={styles.loadingText}>जाँच हो रही है...</Text>
                </View>
            ) : (
                <>
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <View style={[styles.contentContainer, isDesktop && styles.desktopContainer]}>
                            {/* Header */}
                            <View style={styles.pageHeader}>
                                <MaterialCommunityIcons name="card-account-details" size={48} color={SP_RED} />
                                <Title style={styles.pageTitle}>Your Digital ID Card</Title>
                                <Text style={styles.pageSubtitle}>सदस्य पहचान पत्र</Text>
                            </View>

                            {/* Show Generate Button or ID Card */}
                            {!isCardGenerated ? (
                                <View style={styles.generateContainer}>
                                    <Card style={styles.welcomeCard}>
                                        <Card.Content style={styles.welcomeContent}>
                                            <MaterialCommunityIcons name="card-account-details-star" size={80} color={SP_RED} />
                                            <Text style={styles.welcomeTitle}>Ready to Get Your ID Card?</Text>
                                            <Text style={styles.welcomeMessage}>
                                                Generate your personalized digital ID card with all your verification details
                                            </Text>
                                        </Card.Content>
                                    </Card>

                                    <TouchableOpacity
                                        style={styles.generateButton}
                                        onPress={handleGenerateCard}
                                        activeOpacity={0.9}
                                    >
                                        <LinearGradient
                                            colors={[SP_RED, '#b91c1c', '#7f1d1d']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={styles.generateButtonGradient}
                                        >
                                            <MaterialCommunityIcons name="card-plus" size={28} color="#fff" />
                                            <Text style={styles.generateButtonText}>Generate My ID Card</Text>
                                            <MaterialCommunityIcons name="star-four-points" size={24} color="#fbbf24" />
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <>
                                    {/* ID Card Preview */}
                                    <View style={styles.cardPreviewContainer}>
                                        <IDCardPreview memberData={memberData} showBack={false} />
                                    </View>

                                    {/* Action Buttons */}
                                    {isVerified && (
                                        <View style={styles.actionsContainer}>
                                            <TouchableOpacity style={styles.actionButton} activeOpacity={0.8} onPress={handleDownloadPDF} disabled={isDownloading}>
                                                <LinearGradient
                                                    colors={[SP_RED, '#b91c1c']}
                                                    style={styles.actionButtonGradient}
                                                >
                                                    <MaterialCommunityIcons name="download" size={20} color="#fff" />
                                                    <Text style={styles.actionButtonText}>{isDownloading ? 'Downloading...' : 'Download Card'}</Text>
                                                </LinearGradient>
                                            </TouchableOpacity>

                                            <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
                                                <LinearGradient
                                                    colors={[SP_GREEN, '#15803d']}
                                                    style={styles.actionButtonGradient}
                                                >
                                                    <MaterialCommunityIcons name="share-variant" size={20} color="#fff" />
                                                    <Text style={styles.actionButtonText}>Share Card</Text>
                                                </LinearGradient>
                                            </TouchableOpacity>
                                        </View>
                                    )}

                                    {/* Info Card */}
                                    <Card style={styles.infoCard}>
                                        <Card.Content>
                                            <View style={styles.infoRow}>
                                                <MaterialCommunityIcons name="information" size={20} color={SP_RED} />
                                                <Text style={styles.infoText}>
                                                    {isVerified
                                                        ? 'Your ID card is ready! You can download or share it anytime.'
                                                        : 'Complete verification to activate your ID card.'}
                                                </Text>
                                            </View>
                                        </Card.Content>
                                    </Card>
                                </>
                            )}
                        </View>
                    </ScrollView>

                    {/* Generating Animation Modal */}
                    <Modal
                        visible={showGeneratingModal}
                        transparent
                        animationType="fade"
                        onRequestClose={() => { }}
                    >
                        <View style={styles.generatingOverlay}>
                            <View style={styles.generatingModal}>
                                <Animated.View style={[styles.cardIconContainer, { transform: [{ scale: scaleAnim }, { rotate: spin }] }]}>
                                    <LinearGradient
                                        colors={[SP_RED, '#b91c1c', '#7f1d1d']}
                                        style={styles.cardIconGradient}
                                    >
                                        <MaterialCommunityIcons name="card-account-details" size={60} color="#fff" />
                                    </LinearGradient>
                                </Animated.View>

                                <Text style={styles.generatingTitle}>Generating Your ID Card</Text>
                                <Text style={styles.generatingMessage}>
                                    Sit back and relax...{'\n'}
                                    We're creating your personalized ID card
                                </Text>

                                <View style={styles.dotsContainer}>
                                    <View style={[styles.dot, styles.dot1]} />
                                    <View style={[styles.dot, styles.dot2]} />
                                    <View style={[styles.dot, styles.dot3]} />
                                </View>
                            </View>
                        </View>
                    </Modal>

                    {/* Verification Modal */}
                    <Modal
                        visible={showVerificationModal}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setShowVerificationModal(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.verificationModal}>
                                {/* Close Button */}
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={() => {
                                        setShowVerificationModal(false);
                                        router.back();
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <MaterialCommunityIcons name="close" size={24} color="#64748b" />
                                </TouchableOpacity>

                                <View style={styles.modalIconContainer}>
                                    <MaterialCommunityIcons name="shield-alert" size={60} color={SP_RED} />
                                </View>

                                <Text style={styles.modalTitle}>प्रोफ़ाइल पूर्ण करें</Text>
                                <Text style={styles.modalMessage}>
                                    ID कार्ड देखने के लिए:{'\n\n'}
                                    1. सभी आवश्यक जानकारी भरें (जिला, विधानसभा, योग्यता){'\n'}
                                    2. प्रोफ़ाइल सत्यापन पूर्ण करें{'\n\n'}
                                    कृपया अपनी प्रोफ़ाइल पूर्ण करें और सत्यापन के लिए आवेदन करें।
                                </Text>

                                <TouchableOpacity
                                    style={styles.primaryButton}
                                    onPress={() => {
                                        setShowVerificationModal(false);
                                        router.push('/verified-member');
                                    }}
                                >
                                    <LinearGradient
                                        colors={[SP_RED, '#b91c1c']}
                                        style={styles.buttonGradient}
                                    >
                                        <MaterialCommunityIcons name="account-check" size={20} color="#fff" />
                                        <Text style={styles.primaryButtonText}>प्रोफ़ाइल पूर्ण करें</Text>
                                    </LinearGradient>
                                </TouchableOpacity>

                                {userInfo?.verificationStatus && (
                                    <View style={styles.statusBadge}>
                                        <Text style={styles.statusText}>
                                            वर्तमान स्थिति: {
                                                userInfo.verificationStatus === 'Verified' ? '✓ सत्यापित' :
                                                    userInfo.verificationStatus === 'Pending' ? '⏳ लंबित' :
                                                        userInfo.verificationStatus === 'Rejected' ? '❌ अस्वीकृत' :
                                                            '✗ सत्यापित नहीं'
                                            }
                                        </Text>
                                    </View>
                                )}

                                <Text style={styles.warningNote}>
                                    नोट: पूर्ण सत्यापन के बिना आप ID कार्ड नहीं देख सकते
                                </Text>
                            </View>
                        </View>
                    </Modal>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
    scrollContent: { flexGrow: 1, paddingVertical: 20 },

    contentContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    desktopContainer: {
        maxWidth: 1200,
        marginHorizontal: 'auto',
        paddingHorizontal: 60,
    },

    pageHeader: {
        alignItems: 'center',
        marginBottom: 40,
        paddingTop: 20,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#1e293b',
        marginTop: 16,
    },
    pageSubtitle: {
        fontSize: 18,
        color: '#64748b',
        marginTop: 8,
    },

    // Generate Button Section
    generateContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    welcomeCard: {
        width: '100%',
        maxWidth: 500,
        borderRadius: 24,
        elevation: 4,
        marginBottom: 32,
    },
    welcomeContent: {
        alignItems: 'center',
        padding: 32,
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1e293b',
        marginTop: 24,
        marginBottom: 12,
        textAlign: 'center',
    },
    welcomeMessage: {
        fontSize: 15,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 22,
    },
    generateButton: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: SP_RED,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
    },
    generateButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        paddingHorizontal: 32,
        gap: 12,
    },
    generateButtonText: {
        fontSize: 18,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 0.5,
    },

    cardPreviewContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },

    // Action Buttons
    actionsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
        flexWrap: 'wrap',
    },
    actionButton: {
        flex: 1,
        minWidth: 150,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
    },
    actionButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        gap: 10,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },

    // Info Card
    infoCard: {
        borderRadius: 16,
        backgroundColor: '#fff',
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
    },

    // Loading State
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#64748b',
        fontWeight: '600',
    },

    // Generating Animation Modal
    generatingOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    generatingModal: {
        backgroundColor: '#fff',
        borderRadius: 32,
        padding: 48,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.5,
        shadowRadius: 30,
        elevation: 20,
    },
    cardIconContainer: {
        marginBottom: 32,
    },
    cardIconGradient: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: SP_RED,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 10,
    },
    generatingTitle: {
        fontSize: 26,
        fontWeight: '900',
        color: '#1e293b',
        marginBottom: 16,
        textAlign: 'center',
    },
    generatingMessage: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: SP_RED,
    },
    dot1: {
        opacity: 0.4,
    },
    dot2: {
        opacity: 0.7,
    },
    dot3: {
        opacity: 1,
    },

    // Verification Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 100,
    },
    verificationModal: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 32,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    modalIconContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1e293b',
        textAlign: 'center',
        marginBottom: 16,
    },
    modalMessage: {
        fontSize: 15,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    primaryButton: {
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        marginBottom: 16,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 10,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#fff',
    },
    statusBadge: {
        marginTop: 20,
        padding: 12,
        backgroundColor: '#fef2f2',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#fecaca',
        marginBottom: 12,
    },
    statusText: {
        fontSize: 13,
        color: '#991b1b',
        fontWeight: '600',
        textAlign: 'center',
    },
    warningNote: {
        fontSize: 12,
        color: '#dc2626',
        textAlign: 'center',
        fontWeight: '600',
        fontStyle: 'italic',
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
});