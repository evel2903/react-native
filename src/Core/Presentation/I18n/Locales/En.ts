// src/core/presentation/i18n/locales/en.ts
export default {
    common: {
        close: 'Close',
    },
    core: {
        screens: {
            NotFound: {
                goHome: 'Go to home screen',
            },
        },
        errors: {
            screenNotFound: 'Screen not found',
            contextNotProvided: '{{contextName}} is not provided.',
        },
    },
    home: {
        title: 'Home',
        welcome: 'Welcome, {{name}}!',
        welcomeDescription: 'What would you like to do today?',
        welcomeDefault: 'Welcome!',
        menu: 'Menu',
        menuItems: {
            posts: 'Posts',
            postsDescription: 'View and manage your posts',
            profile: 'Profile',
            profileDescription: 'View and edit your profile',
            settings: 'Settings',
            settingsDescription: 'Configure app settings',
            stockIn: 'Stock In',
            stockInDescription: 'Stock In Feature',
            stockOut: 'Stock Out',
            stockOutDescription: 'Stock Out Feature',
            inventory: 'Inventory',
            inventoryDescription: 'Inventory Feature',
        },
    },
    auth: {
        screens: {
            Auth: {
                welcomeBack: 'Welcome Back',
                createAccount: 'Create Account',
                signInContinue: 'Sign in to continue to the app',
                registerGetStarted: 'Register to get started with the app',
                login: 'Login',
                register: 'Register',
                fullName: 'Full Name',
                email: 'Email',
                username: 'Username',
                password: 'Password',
                confirmPassword: 'Confirm Password',
                forgotPassword: 'Forgot Password?',
                orContinueWith: 'or continue with',
            },
        },
        errors: {
            passwordsDoNotMatch: 'Passwords do not match',
            invalidCredentials: 'Invalid username or password',
            usernameRequired: 'Username is required',
            usernameTooShort: 'Username must be at least 3 characters long',
            invalidUsername:
                'Username can only contain letters, numbers, and . _ -',
            passwordRequired: 'Password is required',
            passwordTooShort: 'Password must be at least 6 characters long',
            serverError: 'Server error occurred. Please try again later.',
            networkError: 'Network error. Please check your connection.',
        },
    },
    post: {
        screens: {
            Posts: {
                loading: 'Loading...',
            },
            Post: {
                loading: 'Loading...',
            },
        },
    },
}
