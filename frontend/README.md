# StackIt Frontend

A modern Q&A forum platform built with React, Vite, and Tailwind CSS.

## Features

### User Profile System
- **Comprehensive Profile Page**: View and edit your profile information
- **Avatar Management**: Upload, update, and delete profile pictures
- **Bio Editing**: Add and update your personal bio
- **Statistics Dashboard**: View your questions, answers, reputation, and badges
- **Activity Tabs**: Browse your questions, answers, and preferences
- **Notification Preferences**: Manage email and push notification settings

### Profile Features
- **Modern UI**: Beautiful glassmorphism design with smooth animations
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Real-time Updates**: Profile changes are reflected immediately
- **Error Handling**: Comprehensive error messages and loading states
- **File Validation**: Avatar upload with size and type validation

### Navigation
- Click the user icon in the navbar to access your profile
- Click your username/avatar in the top-right corner to go to profile
- Profile page is protected and requires authentication

### Profile Sections
1. **Overview Tab**: Recent activity and badges
2. **Questions Tab**: All your posted questions
3. **Answers Tab**: All your provided answers  
4. **Preferences Tab**: Notification settings

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
cd frontend
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

## Tech Stack

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icons
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls

## Project Structure

```
src/
├── components/
│   ├── UserProfile.jsx      # User profile page
│   ├── Navbar.jsx          # Navigation bar
│   ├── QuestionList.jsx    # Questions listing
│   ├── QuestionDetail.jsx  # Question details
│   ├── AskQuestion.jsx     # Ask question form
│   ├── Login.jsx          # Login modal
│   └── Register.jsx       # Register modal
├── api/
│   ├── apiService.js       # API service functions
│   └── apiEndpoint.js      # API endpoints
├── App.jsx                # Main app component
└── main.jsx              # App entry point
```

## API Integration

The frontend integrates with the backend API for:
- User authentication and profile management
- Question and answer operations
- File uploads (avatars)
- Real-time notifications

## Styling

The application uses Tailwind CSS with custom animations and glassmorphism effects:
- Custom CSS animations for smooth transitions
- Glass morphism effects for modern UI
- Responsive design for all screen sizes
- Dark/light theme support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
