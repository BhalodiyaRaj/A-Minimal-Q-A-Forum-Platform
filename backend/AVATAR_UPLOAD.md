# Avatar Upload Implementation

## Overview
This implementation provides avatar upload functionality using Cloudinary for image storage and processing.

## Features
- Upload avatar images (JPG, JPEG, PNG, GIF)
- Automatic image optimization (300x300, face detection)
- Delete old avatars when updating
- File size limit: 5MB
- Cloudinary integration for reliable storage

## API Endpoints

### 1. Upload Avatar
**POST** `/api/auth/avatar`
- **Access**: Private (requires authentication)
- **Content-Type**: `multipart/form-data`
- **Body**: 
  - `avatar`: Image file

**Response**:
```json
{
  "status": "success",
  "message": "Avatar uploaded successfully",
  "data": {
    "user": {
      "id": "user_id",
      "username": "username",
      "email": "email@example.com",
      "avatar": "https://res.cloudinary.com/...",
      "bio": "user bio",
      "role": "user",
      "reputation": 0,
      "badges": [],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 2. Delete Avatar
**DELETE** `/api/auth/avatar`
- **Access**: Private (requires authentication)

**Response**:
```json
{
  "status": "success",
  "message": "Avatar deleted successfully",
  "data": {
    "user": {
      "id": "user_id",
      "username": "username",
      "email": "email@example.com",
      "avatar": "",
      "bio": "user bio",
      "role": "user",
      "reputation": 0,
      "badges": [],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 3. Update Profile (with avatar)
**PUT** `/api/auth/profile`
- **Access**: Private (requires authentication)
- **Content-Type**: `multipart/form-data`
- **Body**: 
  - `bio`: String (optional)
  - `avatar`: Image file (optional)

## File Upload Details

### Supported Formats
- JPG/JPEG
- PNG
- GIF

### Image Processing
- Automatic resizing to 300x300 pixels
- Face detection and cropping
- Quality optimization
- Format conversion to JPG

### File Size Limit
- Maximum: 5MB per file

## Error Handling

### File Size Exceeded
```json
{
  "status": "error",
  "message": "File size too large. Maximum size is 5MB."
}
```

### Invalid File Type
```json
{
  "status": "error",
  "message": "Only image files are allowed!"
}
```

### No File Provided
```json
{
  "status": "error",
  "message": "No avatar file provided"
}
```

## Frontend Integration

### Using FormData
```javascript
const formData = new FormData();
formData.append('avatar', fileInput.files[0]);

fetch('/api/auth/avatar', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

### Using Axios
```javascript
const formData = new FormData();
formData.append('avatar', fileInput.files[0]);

axios.post('/api/auth/avatar', formData, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'
  }
})
.then(response => console.log(response.data));
```

## Database Schema Update

The User model has been updated to store avatar information:

```javascript
avatar: {
  url: {
    type: String,
    default: ''
  },
  public_id: {
    type: String,
    default: ''
  }
}
```

## Environment Variables

Make sure these are set in your `.env` file:
```
CLOUDINARY_NAME=dtgh7jqxp
CLOUDINARY_API_KEY=897655428869549
CLOUDINARY_SECRET_KEY=CA1OWzzGFPK88kWsgJW7GKzZ4tY
```

## Security Features
- File type validation
- File size limits
- Authentication required
- Automatic cleanup of old avatars
- Secure Cloudinary integration 