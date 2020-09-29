import Vue from "vue";
import VueRouter from "vue-router";
import Home from "@/components/Home";
import Login from "@/components/Login";
import Subscription from "@/views/Subscription";
import Callback from "@/components/Callback";
import Pricing from "@/views/Pricing";
import Profile from "@/views/Profile";
import ErrorMsg from "@/components/ErrorMsg";
import store from "../store";

Vue.use(VueRouter);

const router = new VueRouter({
  mode: "history",
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
      meta: {
        title: "Home",
        auth: true,
      },
    },
    {
      path: "/login",
      name: "login",
      component: Login,
      meta: {
        title: "Login",
        auth: false,
      },
    },
    {
      path: "/profile",
      name: "profile",
      component: Profile,
      meta: {
        title: "Profile",
        auth: false,
      },
    },
    {
      path: "/subscription",
      name: "subscription",
      component: Subscription,
      meta: {
        title: "Subscription",
        auth: false,
      },
    },
    {
      path: "/pricing",
      name: "pricing",
      component: Pricing,
      meta: {
        title: "Pricing",
        auth: false,
      },
    },
    {
      path: "/callback",
      name: "callback",
      component: Callback,
      meta: {
        title: "Authenticating...",
        auth: false,
      },
    },
    {
      path: "/error",
      name: "error",
      component: ErrorMsg,
      props: true,
      meta: {
        title: "Error",
        auth: false,
      },
    },
  ],
});

router.beforeEach((to, from, next) => {
  // Use the page's router title to name the page
  if (to.meta && to.meta.title) {
    document.title = to.meta.title;
  }

  // Redirect to the login page if not authenticated
  // for pages that have 'auth: true' set
  if (to.meta && to.meta.auth !== undefined) {
    if (to.meta.auth) {
      if (store.getters.isAuthenticated) {
        next();
      } else {
        router.push({ name: "login" });
      }
    } else {
      if (store.getters.isAuthenticated) {
        router.push({ name: "home" });
      } else {
        next();
      }
    }
  } else {
    next();
  }
});

export default router;
