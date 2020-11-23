<template>
  <div id="app">
    <div>
      <nav class="navbar navbar-inverse">
        <div class="container-fluid">
          <div class="navbar-header">
            <div class="navbar-left">
              <Slide class="bm-burger-button-notifier">
                <a id="home" href="/">
                  <icon name="home" color="white"></icon>
                  <span>Home</span>
                </a>
                <a id="about" href="/about">
                  <icon name="address-book" color="white"></icon>
                  <span>About</span>
                </a>
                <a id="pricing" href="/pricing">
                  <icon name="dollar" color="white"></icon>
                  <span>Pricing</span>
                </a>
                <a id="profile" href="/subscription">
                  <icon name="subscript" color="white"></icon>
                  <span>Subscription</span>
                </a>
                <a id="today" href="/today">
                  <icon name="today" color="white"></icon>
                  <span>Today</span>
                </a>
                <a id="logout" href="/logout">
                  <icon name="sign-out" color="white"></icon>
                  <span>Logout</span>
                </a>
              </Slide>
            </div>
            <a class="navbar-left" href="/">
              <img src="./assets/logo.png" />
            </a>
            <div class="navbar-brand navbar-text d-none d-sm-inline">
              <a class="navbar-brand" href="/">Energy Notifier</a>
            </div>
          </div>
          <ul class="nav navbar-nav navbar-right">
            <profile></profile>
          </ul>
        </div>
      </nav>
    </div>
    <main id="page-wrap">
      <div class="container-fluid">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script>
import Profile from "@/views/Profile";
import { Slide } from "vue-burger-menu";
import "vue-awesome/icons/home";
import "vue-awesome/icons/address-book";
import "vue-awesome/icons/dollar";
import "vue-awesome/icons/subscript";
import "vue-awesome/icons/sign-out";

export default {
  name: "app",
  components: {
    Profile,
    Slide,
  },
};
</script>

<style>
.bm-burger-button-notifier {
  position: fixed;
  width: 36px;
  height: 30px;
  left: -25px;
  top: -22px;
  cursor: pointer;
}
.bm-burger-bars {
  background-color: white;
}
.line-style {
  position: absolute;
  height: 20%;
  left: 0;
  right: 0;
}
.cross-style {
  position: absolute;
  top: 12px;
  right: 2px;
  cursor: pointer;
}
.bm-cross {
  background: #bdc3c7;
}
.bm-cross-button {
  height: 24px;
  width: 24px;
}
.bm-menu {
  height: 100%; /* 100% Full-height */
  width: 0; /* 0 width - change this with JavaScript */
  position: fixed; /* Stay in place */
  z-index: 1000; /* Stay on top */
  top: 0;
  left: 0;
  background-color: rgb(63, 63, 65); /* Black*/
  overflow-x: hidden; /* Disable horizontal scroll */
  padding-top: 60px; /* Place content 60px from the top */
  transition: 0.5s; /*0.5 second transition effect to slide in the sidenav*/
}

.bm-overlay {
  background: rgba(0, 0, 0, 0.5);
}
.bm-item-list {
  color: #b8b7ad;
  margin-left: 10%;
  font-size: 20px;
}
.bm-item-list > * {
  display: flex;
  text-decoration: none;
  padding: 0.7em;
}
.bm-item-list > * > span {
  margin-left: 10px;
  font-weight: 700;
  color: white;
}

body {
  margin: 0px;
}
main .container-fluid {
  padding: 16px;
}
main h1,
main h2 {
  font-weight: normal;
  margin-top: 8px;
  margin-bottom: 16px;
}
/* Small devices (landscape phones, 576px and up) */
@media (min-width: 576px) {
  main .container-fluid {
    padding: 24px;
  }
  main h1 {
    margin-top: 12px;
    margin-bottom: 24px;
  }
}
/* Medium devices (tablets, 768px and up) */
@media (min-width: 768px) {
  main .container-fluid {
    padding: 36px;
  }
  main h1 {
    margin-top: 0px;
    margin-bottom: 24px;
  }
}
/* Large devices (desktops, 992px and up) */
@media (min-width: 992px) {
}
/* Extra large devices (large desktops, 1200px and up) */
@media (min-width: 1200px) {
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.fa-icon {
  width: auto;
  height: 1em; /* or any other relative font sizes */
  /* You would have to include the following two lines to make this work in Safari */
  max-width: 100%;
  max-height: 100%;
}
a {
  color: #35495e;
}
nav {
  margin: 0;
  height: 56px;
  padding: 0 16px 0 24px;
  background-color: #252f3e;
  color: #ffffff;
}

.navbar-left {
  margin-left: 27px;
}

.navbar-brand {
  color: #ffffff;
}
nav a:hover {
  color: inherit; /* Inherits color property from its parent */
}
nav img {
  display: inline-block;
  vertical-align: middle;
  height: 28px;
  margin-right: 16px;
}
pre {
  font-size: 10px !important;
  white-space: pre-wrap; /* Since CSS 2.1 */
  white-space: -moz-pre-wrap; /* Mozilla, since 1999 */
  white-space: -pre-wrap; /* Opera 4-6 */
  white-space: -o-pre-wrap; /* Opera 7 */
  word-wrap: break-word; /* Internet Explorer 5.5+ */
}
.btn {
  vertical-align: middle;
  margin: 4px;
}
.btn .fa-icon {
  vertical-align: middle;
  margin-right: 0.5rem;
}
.btn .fa-icon:last-child {
  vertical-align: middle;
  margin-right: 8px;
}
</style>
