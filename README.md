# UrbanBook - Online Tutoring & Class Booking Platform

A comprehensive multi-platform solution for connecting teachers and students through online class booking, featuring real-time communication, payment integration, and seamless scheduling.

## 🚀 Features

### For Students
- **Class Booking**: Browse and book available time slots with teachers
- **Real-time Notifications**: Instant updates on booking confirmations and changes
- **Payment Integration**: Secure payments through Razorpay
- **Schedule Management**: View and manage booked classes
- **Progress Tracking**: Monitor learning progress and session history
- **Multi-platform Access**: Web and mobile applications

### For Teachers
- **Slot Management**: Create and manage teaching availability
- **Booking Oversight**: View and manage student bookings
- **Schedule Visualization**: Calendar view of all teaching sessions
- **Student Progress**: Track individual student performance
- **Real-time Communication**: Instant notifications for new bookings

### Platform Features
- **Real-time WebSocket Communication**: Live updates for booking changes
- **Automated Time Zone Detection**: Seamless scheduling across time zones
- **Conflict-free Booking**: Intelligent scheduling to prevent overlaps
- **Responsive Design**: Optimized for all device sizes
- **Secure Authentication**: JWT-based authentication system

## 🏗️ Architecture

```
UrbanBook/
├── frontend/
│   ├── web/          # React + Vite web application
│   ├── mobile/       # React Native mobile application
│   └── codeforces2/  # Codeforces integration features
├── backend/          # Django REST API with WebSocket support
└── README.md         # This file
```

## 🛠️ Technology Stack

### Frontend Web
- **Framework**: React 19.1.0
- **Build Tool**: Vite 6.3.5
- **Styling**: Tailwind CSS 3.4.1
- **Animation**: Framer Motion 11.18.2
- **HTTP Client**: Axios 1.9.0
- **Calendar**: React Big Calendar 1.18.0
- **WebSocket**: React Use WebSocket 4.13.0
- **Routing**: React Router DOM 6.30.1

### Frontend Mobile
- **Framework**: React Native 0.79.1
- **Navigation**: React Navigation 7.x
- **Authentication**: OTPless integration
- **WebSocket**: React Native Reconnecting WebSocket
- **UI Components**: Custom components with Linear Gradient

### Backend
- **Framework**: Django 4.2.7
- **API**: Django REST Framework 3.14.0
- **Authentication**: JWT (djangorestframework-simplejwt 5.3.0)
- **WebSocket**: Django Channels 4.1.0 with Redis
- **Database**: SQLite (development) / PostgreSQL (production)
- **Payment**: Razorpay 1.4.2
- **Real-time**: Agora Token Builder for video calls
- **Deployment**: WhiteNoise 6.6.0 for static files

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **Git**
- **Redis** (for WebSocket support)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd UrbanBook
   ```

2. **Set up Python virtual environment**
   ```bash
   cd backend
   python -m venv venv_backend
   
   # On Windows
   venv_backend\Scripts\activate
   
   # On macOS/Linux
   source venv_backend/bin/activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   # Create .env file in backend directory
   cp .env.example .env
   
   # Add your configuration:
   # - SECRET_KEY
   # - RAZORPAY_KEY_ID
   # - RAZORPAY_KEY_SECRET
   # - REDIS_URL (if using external Redis)
   ```

5. **Run database migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start the development server**
   ```bash
   python manage.py runserver
   ```

The backend will be available at `http://localhost:8000`

### Frontend Web Setup

1. **Navigate to web frontend**
   ```bash
   cd frontend/web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file in frontend/web directory
   cp .env.example .env
   
   # Add your configuration:
   # VITE_API_BASE_URL=http://localhost:8000
   # VITE_WS_BASE_URL=ws://localhost:8000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The web application will be available at `http://localhost:5173`

### Frontend Mobile Setup

1. **Navigate to mobile frontend**
   ```bash
   cd frontend/mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **iOS Setup** (macOS only)
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Run on Android**
   ```bash
   npm run android
   ```

5. **Run on iOS** (macOS only)
   ```bash
   npm run ios
   ```

## 📡 WebSocket Communication

The platform uses Django Channels with Redis for real-time communication:

### WebSocket Endpoints
- **Booking Updates**: `/ws/booking/<user_id>/`
- **General Notifications**: `/ws/notifications/<user_id>/`

### Message Types
- `booking_update`: Real-time booking confirmations/cancellations
- `slots_count`: Live slot availability updates
- `payment_update`: Payment status changes
- `schedule_change`: Schedule modifications

## 💳 Payment Integration

### Razorpay Configuration
1. **Get Razorpay credentials**
   - Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
   - Get API Key ID and Key Secret

2. **Configure environment variables**
   ```bash
   RAZORPAY_KEY_ID=your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret
   ```

3. **Payment Flow**
   - Student selects time slot
   - Payment order created via backend
   - Razorpay checkout handles payment
   - Backend verifies payment and confirms booking

## 🗃️ Database Structure

### Key Models
- **User**: Extended Django user model with roles (Teacher/Student)
- **TimeSlot**: Available teaching time slots
- **Booking**: Student bookings for time slots
- **Payment**: Payment transaction records

### Relationships
```
User (Teacher) -> TimeSlot -> Booking <- User (Student)
Booking -> Payment
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
# Web
cd frontend/web
npm run lint

# Mobile
cd frontend/mobile
npm test
```

## 🚀 Production Deployment

### Backend (Django)
1. **Environment Setup**
   ```bash
   # Set production environment variables
   DEBUG=False
   ALLOWED_HOSTS=your-domain.com
   DATABASE_URL=your-production-db-url
   REDIS_URL=your-production-redis-url
   ```

2. **Collect Static Files**
   ```bash
   python manage.py collectstatic
   ```

3. **Use Production WSGI/ASGI**
   - WSGI: `urb_backend.wsgi:application`
   - ASGI: `urb_backend.asgi:application` (for WebSocket support)

### Frontend Web
1. **Build for production**
   ```bash
   cd frontend/web
   npm run build
   ```

2. **Deploy `dist/` directory** to your static hosting service

### Frontend Mobile
1. **Build Android APK**
   ```bash
   cd frontend/mobile
   cd android
   ./gradlew assembleRelease
   ```

2. **Build iOS** (macOS only)
   ```bash
   cd ios
   xcodebuild -workspace UrbanBookk.xcworkspace -scheme UrbanBookk -configuration Release
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/login/` - User login
- `POST /api/auth/register/` - User registration
- `POST /api/auth/refresh/` - Token refresh

### Booking Endpoints
- `GET /api/booking/slots/` - List available slots
- `POST /api/booking/book/` - Create booking
- `GET /api/booking/my-bookings/` - User's bookings

### Payment Endpoints
- `POST /api/payment/create-order/` - Create payment order
- `POST /api/payment/verify/` - Verify payment

