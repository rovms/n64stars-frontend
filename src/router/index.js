import { createRouter, createWebHistory } from 'vue-router'

// import isAuthenticated from '../auth'

import Home from '../components/Home.vue'
import Login from '../components/Login.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
        authRequried: true
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
        authRequried: false
    }
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
});

// router.beforeEach((to, from, next) => {
//     // console.debug('to >>>', { to } )
//     // console.debug('from >>>', { from } )
//     // console.debug('next >>>', { next } )
//     // if (to.authRequried && !isAuthenticated()) {
//     //     next( { name: 'Login' } )
//     // }
//     // else {
//     //     // next()
//     // }
// })

export default router;