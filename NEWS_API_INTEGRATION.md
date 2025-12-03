# News API Integration Guide

## ✅ What's Already Done:

1. **API Service Created**: `services/newsAPI.ts`
   - Functions to fetch all news: `newsAPI.getAllNews()`
   - Function to fetch single news: `newsAPI.getNewsById(id)`

2. **Environment Config**: `.env` file created
   - API URL: `http://localhost:5000/api`
   - Environment variable: `EXPO_PUBLIC_API_URL`

3. **Backend Ready**: 
   - News model: `backend/models/News.js`
   - News controller: `backend/controllers/newsController.js`
   - News routes: `backend/routes/news.js`
   - API endpoint: `GET /api/news`

## 📝 What You Need To Do:

### Step 1: Add News to Database
First, make sure you have news in your database. Use your admin panel or API to create some news items.

### Step 2: Update news.tsx (Manual Edit)
The file is currently showing demo/hardcoded data. To integrate the API, you need to:

1. Add the import at the top:
```typescript
import { newsAPI } from '@/services/newsAPI';
import { ActivityIndicator } from 'react-native';
```

2. Replace the hardcoded `newsData` and `trendingNews` arrays with state:
```typescript
const [newsData, setNewsData] = useState<any[]>([]);
const [trendingNews, setTrendingNews] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
```

3. Add a fetch function:
```typescript
const fetchNews = async () => {
  try {
    setLoading(true);
    const response = await newsAPI.getAllNews();
    
    if (response.success) {
      const transformed = response.data.map((item: any) => ({
        id: item._id,
        title: item.title,
        description: item.excerpt,
        category: 'News',
        time: new Date(item.createdAt).toLocaleDateString(),
        image: item.coverImage !== 'no-photo.jpg' ? item.coverImage : null,
        likes: item.views || 0,
        comments: 0,
        featured: item.status === 'Published'
      }));
      
      setNewsData(transformed);
      setTrendingNews(transformed.slice(0, 3).map(n => ({
        id: n.id,
        title: n.title,
        category: n.category,
        source: 'Samajwadi Party',
        image: n.image || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800'
      })));
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setLoading(false);
  }
};
```

4. Call it in useEffect:
```typescript
useEffect(() => {
  fetchNews();
}, []);
```

## 🔍 Testing:

1. **Check Backend**: Make sure backend is running on port 5000
2. **Check Database**: Verify you have news items with status "Published"
3. **Check Network**: In Expo, check if API calls are reaching the backend
4. **Check Console**: Look for any error messages

## ⚠️ Important Notes:

- The `.env` file uses `localhost`, which may not work on physical devices
- For physical devices, use your computer's IP address instead
- Restart Expo after changing `.env` file
- Make sure both backend and Expo app are running

## 🚀 Quick Test:

To test if the API is working, you can temporarily add this to your news.tsx:

```typescript
useEffect(() => {
  newsAPI.getAllNews().then(res => {
    console.log('API Response:', res);
  }).catch(err => {
    console.error('API Error:', err);
  });
}, []);
```

Check Expo console for the output.
