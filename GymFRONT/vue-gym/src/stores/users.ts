import { defineStore } from "pinia";
import { ref } from "vue";
import type UserDto from "./dtos/user.dto";

export const useUsersStore = defineStore( 'users', () =>{


         const users = ref(new Array<UserDto>())



        function findAll(){
            //fetch()
            //res.json()
            //data

            let data = [

                { id: 0, name: 'test', surname: 'test'},
                { id: 1, name: 'test', surname: 'second'}
            ]
            users.value.splice(0, users.value.length, ...data)
        }
      
            function createUser(){}
            function deleteUser(){}
            function updateUser(){}

            return{
                users,
                findAll,
                createUser,
                deleteUser,
                updateUser
            }
})