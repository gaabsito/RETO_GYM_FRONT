export const API_URL = 'http://localhost:5288'

export default {
    api: {
        baseURL: API_URL,
        endpoints: {
            auth: {
                login: '/auth/login',
                register: '/auth/register',
                verify: '/auth/verify'
            },
            workouts: {
                base: '/entrenamientos',
                public: '/entrenamientos/public'
            },
            exercises: {
                base: '/ejercicios'
            }
        }
    }
}