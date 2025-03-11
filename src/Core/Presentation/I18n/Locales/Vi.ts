// src/core/presentation/i18n/locales/vi.ts
export default {
    common: {
        close: 'Đóng',
    },
    core: {
        screens: {
            NotFound: {
                goHome: 'Về trang chủ',
            },
        },
        errors: {
            screenNotFound: 'Không tìm thấy trang',
            contextNotProvided: '{{contextName}} không được cung cấp.',
        },
    },
    home: {
        title: 'Trang chủ',
        welcome: 'Xin chào, {{name}}!',
        welcomeDescription: 'Hôm nay bạn muốn làm gì?',
        welcomeDefault: 'Xin chào!',
        menu: 'Menu',
        menuItems: {
            posts: 'Bài viết',
            postsDescription: 'Xem và quản lý bài viết của bạn',
            profile: 'Hồ sơ',
            profileDescription: 'Xem và chỉnh sửa hồ sơ của bạn',
            settings: 'Cài đặt',
            settingsDescription: 'Cấu hình ứng dụng',
            stockIn: 'Nhập kho',
            stockInDescription: 'Tính năng nhập kho',
            stockOut: 'Xuất kho',
            stockOutDescription: 'Tính năng xuất kho',
            inventory: 'Kiểm kê',
            inventoryDescription: 'Tính năng kiểm kê hàng tồn kho',
        },
    },
    auth: {
        screens: {
            Auth: {
                welcomeBack: 'Chào mừng trở lại',
                createAccount: 'Tạo tài khoản',
                signInContinue: 'Đăng nhập để tiếp tục sử dụng ứng dụng',
                registerGetStarted: 'Đăng ký để bắt đầu sử dụng ứng dụng',
                login: 'Đăng nhập',
                register: 'Đăng ký',
                fullName: 'Họ và tên',
                email: 'Email',
                username: 'Tên đăng nhập',
                password: 'Mật khẩu',
                confirmPassword: 'Xác nhận mật khẩu',
                forgotPassword: 'Quên mật khẩu?',
                orContinueWith: 'hoặc tiếp tục với',
            },
        },
        errors: {
            passwordsDoNotMatch: 'Mật khẩu không khớp',
            invalidCredentials: 'Tên đăng nhập hoặc mật khẩu không đúng',
            usernameRequired: 'Yêu cầu nhập tên đăng nhập',
            usernameTooShort: 'Tên đăng nhập phải có ít nhất 3 ký tự',
            invalidUsername:
                'Tên đăng nhập chỉ có thể chứa chữ cái, số và các ký tự . _ -',
            passwordRequired: 'Yêu cầu nhập mật khẩu',
            passwordTooShort: 'Mật khẩu phải có ít nhất 6 ký tự',
            serverError: 'Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.',
            networkError:
                'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối của bạn.',
        },
    },
    post: {
        screens: {
            Posts: {
                loading: 'Đang tải...',
            },
            Post: {
                loading: 'Đang tải...',
            },
        },
    },
}
