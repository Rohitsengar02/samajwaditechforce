export const RESOURCE_CATEGORIES = [
    {
        id: 'social-media',
        title: 'Social Media Management',
        description: 'Master the art of digital presence',
        icon: 'facebook',
        color: '#1877F2'
    },
    {
        id: 'editing-tutorials',
        title: 'Poster & Media Editing',
        description: 'Learn to create stunning visuals',
        icon: 'image-edit',
        color: '#E1306C'
    },
    {
        id: 'templates',
        title: 'Poster Templates',
        description: 'Ready-to-use political templates',
        icon: 'view-grid-plus',
        color: '#009933'
    },
    {
        id: 'reels-guide',
        title: 'Reels Editing Guides',
        description: 'Create viral short-form content',
        icon: 'video-vintage',
        color: '#C13584'
    },
    {
        id: 'communication',
        title: 'Political Communication',
        description: 'Enhance your public speaking skills',
        icon: 'microphone-variant',
        color: '#F59E0B'
    },
    {
        id: 'downloads',
        title: 'Download Center',
        description: 'Official posters, speeches & scripts',
        icon: 'download-multiple',
        color: '#E30512'
    },
];

const PLACEHOLDER_IMG = 'https://via.placeholder.com/300x200/E30512/FFFFFF?text=Samajwadi+Resource';

export const RESOURCES: Record<string, any[]> = {
    'social-media': [
        { id: 'sm-1', title: 'Facebook Page Optimization', type: 'Video', duration: '10 min', thumbnail: PLACEHOLDER_IMG },
        { id: 'sm-2', title: 'Twitter Trends Analysis', type: 'Article', duration: '5 min read', thumbnail: PLACEHOLDER_IMG },
        { id: 'sm-3', title: 'WhatsApp Group Management', type: 'Video', duration: '15 min', thumbnail: PLACEHOLDER_IMG },
    ],
    'editing-tutorials': [
        { id: 'et-1', title: 'Canva Basics for Politics', type: 'Video', duration: '20 min', thumbnail: PLACEHOLDER_IMG },
        { id: 'et-2', title: 'Remove Backgrounds Easily', type: 'Video', duration: '5 min', thumbnail: PLACEHOLDER_IMG },
    ],
    'templates': [
        { id: 'tp-1', title: 'Election Rally Poster', type: 'Template', format: 'PSD/Canva', thumbnail: PLACEHOLDER_IMG },
        { id: 'tp-2', title: 'Festival Greeting', type: 'Template', format: 'PNG', thumbnail: PLACEHOLDER_IMG },
        { id: 'tp-3', title: 'Membership Drive', type: 'Template', format: 'CDR', thumbnail: PLACEHOLDER_IMG },
    ],
    'reels-guide': [
        { id: 'rg-1', title: 'Trending Audio Selection', type: 'Video', duration: '8 min', thumbnail: PLACEHOLDER_IMG },
        { id: 'rg-2', title: 'Transitions Masterclass', type: 'Video', duration: '12 min', thumbnail: PLACEHOLDER_IMG },
    ],
    'communication': [
        { id: 'pc-1', title: 'Public Speaking 101', type: 'Video', duration: '25 min', thumbnail: PLACEHOLDER_IMG },
        { id: 'pc-2', title: 'Handling Media Queries', type: 'Article', duration: '10 min read', thumbnail: PLACEHOLDER_IMG },
    ],
    'downloads': [
        { id: 'dl-1', title: 'Party Manifesto 2025', type: 'Document', format: 'PDF', thumbnail: PLACEHOLDER_IMG },
        { id: 'dl-2', title: 'Official Logo Pack', type: 'Asset', format: 'ZIP', thumbnail: PLACEHOLDER_IMG },
        { id: 'dl-3', title: 'Sample Speech: Youth', type: 'Document', format: 'PDF', thumbnail: PLACEHOLDER_IMG },
    ],
};
