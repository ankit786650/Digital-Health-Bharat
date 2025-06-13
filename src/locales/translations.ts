
export const translations = {
  en: {
    // LanguageToggle
    english: 'English',
    hindi: 'हिंदी (Hindi)',
    toggleLanguage: 'Toggle language',
    // AppShell
    kishan: 'Kishan',
    dashboard: 'Dashboard',
    appointments: 'Appointments',
    medicationReminder: 'Medication Reminder',
    medicalDocuments: 'Medical Documents',
    analytics: 'Analytics',
    nearbyFacility: 'Nearby Facility',
    healthQrCode: 'Health QR Code', // New
    profile: 'Profile',
    settings: 'Settings',
    logOut: 'Log Out',
    monitor: 'Monitor', 
    // HomePage
    welcomeBack: 'Welcome back, Kishan',
    welcomeMessage: 'Your personal assistant for managing health records, medication reminders, and tracking your health journey effectively.',
    upcomingMedications: 'Upcoming Medications',
    recentAppointments: 'Recent Appointments',
    documents: 'Documents',
    healthProgramAlerts: 'Health Program Alerts',
    viewAllMedications: 'View All Medications',
    viewAllAppointments: 'View All Appointments',
    viewAllDocuments: 'View All Documents',
    viewAllAlerts: 'View All Alerts',
  },
  hi: {
    // LanguageToggle
    english: 'English', 
    hindi: 'हिंदी (Hindi)', 
    toggleLanguage: 'भाषा टॉगल करें',
    // AppShell
    kishan: 'किशन',
    dashboard: 'डैशबोर्ड',
    appointments: 'मुलाकातें',
    medicationReminder: 'दवा अनुस्मारक',
    medicalDocuments: 'चिकित्सा दस्तावेज़',
    analytics: 'विश्लेषिकी',
    nearbyFacility: 'आस-पास की सुविधा',
    healthQrCode: 'स्वास्थ्य क्यूआर कोड', // New
    profile: 'प्रोफ़ाइल',
    settings: 'समायोजन',
    logOut: 'लॉग आउट',
    monitor: 'निगरानी', 
    // HomePage
    welcomeBack: 'वापस स्वागत है, किशन',
    welcomeMessage: 'स्वास्थ्य रिकॉर्ड, दवा अनुस्मारक, और आपकी स्वास्थ्य यात्रा को प्रभावी ढंग से ट्रैक करने के लिए आपका व्यक्तिगत सहायक।',
    upcomingMedications: 'आगामी दवाएं',
    recentAppointments: 'हाल की मुलाकातें',
    documents: 'दस्तावेज़',
    healthProgramAlerts: 'स्वास्थ्य कार्यक्रम अलर्ट',
    viewAllMedications: 'सभी दवाएं देखें',
    viewAllAppointments: 'सभी मुलाकातें देखें',
    viewAllDocuments: 'सभी दस्तावेज़ देखें',
    viewAllAlerts: 'सभी अलर्ट देखें',
  },
};

export type Locale = keyof typeof translations;
export type TranslationKey = keyof typeof translations['en'];
