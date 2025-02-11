export const API_URL = 'https://localhost:7087'

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
                base: '/api/entrenamiento',
                public: '/api/entrenamiento/public'
            },
            exercises: {
                base: '/ejercicios'
            }
        }
    }
}