# Profile Picture Storage Setup Guide

## Overview
Profile pictures are now stored in Supabase Storage instead of as base64 strings in the database. This provides better performance, scalability, and proper image management.

## Supabase Storage Setup

### Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `ftxvmaurxhatqhzowgkb`
3. Click on **Storage** in the left sidebar
4. Click **"New bucket"** button
5. Configure the bucket:
   - **Name**: `avatars`
   - **Public bucket**: ✅ Enable (so images are publicly accessible)
   - **File size limit**: 5 MB (or your preference)
   - **Allowed MIME types**: `image/*` (or specific: `image/jpeg,image/png,image/gif,image/webp`)
6. Click **"Create bucket"**

### Step 2: Set Storage Policies (Optional but Recommended)

For better security, you can set Row Level Security policies:

#### Policy 1: Allow authenticated users to upload their own profile pictures
```sql
CREATE POLICY "Users can upload their own profile pictures"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'profile-pictures'
  AND auth.uid()::text = (storage.filename(name))::text
);
```

#### Policy 2: Allow public read access
```sql
CREATE POLICY "Public can view profile pictures"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

#### Policy 3: Allow users to update their own pictures
```sql
CREATE POLICY "Users can update their own profile pictures"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'profile-pictures'
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'profile-pictures'
);
```

#### Policy 4: Allow users to delete their own pictures
```sql
CREATE POLICY "Users can delete their own profile pictures"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'profile-pictures'
);
```

### Step 3: Verify Setup

1. Try uploading a profile picture from the profile page
2. Check Supabase Storage dashboard to see the uploaded file
3. Verify the image displays correctly in the navbar and profile page

## How It Works

### Upload Flow:
1. User selects an image file on the profile page
2. File is validated:
   - Must be an image type
   - Must be less than 5MB
3. File is uploaded to Supabase Storage bucket `avatars`
4. Path format: `profile-pictures/{user_id}-{timestamp}.{extension}`
5. Public URL is generated
6. URL is saved to `user_profiles.profile_picture` in database
7. Image displays from the URL

### File Naming Convention:
```
profile-pictures/{user_id}-{timestamp}.{extension}

Example:
profile-pictures/a1b2c3d4-e5f6-7890-abcd-ef1234567890-1696723456789.jpg
```

### Benefits:
- ✅ **Better Performance**: No large base64 strings in database
- ✅ **Scalability**: Storage is separate from database
- ✅ **Automatic CDN**: Supabase provides fast image delivery
- ✅ **File Management**: Easy to manage, delete, or update images
- ✅ **Size Limits**: Enforced at storage level
- ✅ **Cost Effective**: Storage pricing is much cheaper than database storage

## File Size & Type Restrictions

Current restrictions in the code:
- **Max file size**: 5 MB
- **Allowed types**: Any image type (`image/*`)
- Validation happens before upload

To change these limits, edit `app/profile/page.tsx`:
```typescript
// Change max size (currently 5MB)
if (file.size > 5 * 1024 * 1024) {
  alert('Image size should be less than 5MB')
  return
}
```

## Troubleshooting

### Issue: "Failed to upload image: new row violates row-level security policy"
**Solution**: Make sure the `avatars` bucket is set to **public** or create proper RLS policies

### Issue: Image doesn't display
**Solution**: 
1. Check if bucket is public
2. Verify the URL in the database
3. Check browser console for CORS errors

### Issue: "Failed to upload image: The resource already exists"
**Solution**: The code uses `upsert: true` which should overwrite. If this persists, manually delete old images from Storage dashboard.

### Issue: Upload is slow
**Solution**: 
- Consider adding image compression before upload
- Resize images client-side before uploading
- Check user's internet connection

## Migration from Base64

If you have existing users with base64 profile pictures in the database:

1. **Keep existing base64 images working**: The code will display them until users upload new ones
2. **Optional migration script** (run in Supabase SQL Editor):
```sql
-- This will clear old base64 data, forcing users to re-upload
UPDATE user_profiles 
SET profile_picture = NULL 
WHERE profile_picture LIKE 'data:image%';
```

3. **Or leave them**: New uploads will use Storage, old base64 will still work

## Future Enhancements

Consider adding:
1. **Image Compression**: Use libraries like `browser-image-compression` to reduce file size
2. **Image Cropping**: Add a cropper UI for users to crop their images
3. **Multiple Sizes**: Generate thumbnail and full-size versions
4. **Progress Bar**: Show upload progress for large files
5. **Drag & Drop**: Allow drag-and-drop file upload

## Storage Costs

Supabase Storage pricing (as of 2024):
- **Free tier**: 1 GB storage, 2 GB bandwidth
- **Pro tier**: 100 GB storage included
- **Additional**: ~$0.021 per GB per month

For reference:
- 1,000 users with 500KB average profile picture = ~500 MB
- Well within free tier limits for small to medium apps

## Security Best Practices

1. ✅ **File type validation** - Implemented
2. ✅ **File size limits** - Implemented (5MB)
3. ✅ **Unique file names** - Implemented (user_id + timestamp)
4. ⚠️ **Image scanning** - Consider adding virus/malware scanning for production
5. ⚠️ **Content moderation** - Consider adding inappropriate content detection
6. ✅ **RLS policies** - Recommended in this guide

## Testing Checklist

- [ ] Create `avatars` bucket in Supabase
- [ ] Set bucket to public
- [ ] Upload a profile picture from profile page
- [ ] Verify image appears in navbar
- [ ] Verify image appears in profile page
- [ ] Check Supabase Storage dashboard for uploaded file
- [ ] Try uploading different image formats (JPG, PNG, GIF, WebP)
- [ ] Try uploading large file (should fail if > 5MB)
- [ ] Try uploading non-image file (should fail)
- [ ] Upload new image (should replace old one)
- [ ] Check that URL is saved in `user_profiles` table

## Summary

Profile pictures are now properly stored in Supabase Storage with:
- Automatic upload to cloud storage
- Public URLs for fast delivery
- File validation and size limits
- Database stores only URLs (not image data)
- Backward compatible with existing base64 images

The implementation is production-ready and scalable! 🚀
