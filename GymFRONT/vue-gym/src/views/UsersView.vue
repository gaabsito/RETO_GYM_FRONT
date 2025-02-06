<script setup lang="ts">
import { useUsersStore } from '@/stores/users';



const store = useUsersStore()


store.findAll()

function insertUser() {

    store.createUser({
        id: -1,
        name: 'sample',
        surname: 'sample'
    })
}


</script>

<template>

    Listado de usuarios
    <div v-for="user in store.users">
        {{ user.name }} {{ user.surname }}
    </div>

    <v-btn @click="insertUser">Insertar usuario</v-btn>
</template>