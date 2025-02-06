<script setup lang="ts">
import { useUsersStore } from '@/stores/users';



    const store = useUsersStore()


    store.findAll()




</script>

<template>

    Listado de usuarios
    <div v-for="user in store.users">
        {{ user.name }} {{ user.surname }}
    </div>
</template>