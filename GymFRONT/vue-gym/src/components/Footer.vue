<template>
    <v-footer class="footer">
        <div class="footer__icons">
            <v-btn v-for="icon in ['mdi-facebook', 'mdi-twitter', 'mdi-instagram']" :key="icon" class="footer__icon"
                :icon="icon" variant="text"></v-btn>
        </div>

        <div class="footer__links">
            <v-btn v-for="link in ['Sobre Nosotros', 'Contacto', 'Términos de Uso']" :key="link" variant="text"
                class="footer__link">
                {{ link }}
            </v-btn>
        </div>

        <v-divider></v-divider>

        <div class="footer__text">
            {{ new Date().getFullYear() }} — ENTRÉNATE
        </div>
    </v-footer>
</template>