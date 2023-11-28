import Vue from 'vue'
import Vuex from 'vuex'

import { initializeApp } from 'firebase/app'
import {
  getDoc,
  getDocs, 
  collection, 
  doc, 
  getFirestore,
  setDoc,
  deleteDoc
} from 'firebase/firestore'

import {
  getAuth,
  // signOut,
  signInWithEmailAndPassword,
} from 'firebase/auth'


const APP = initializeApp({
  apiKey: "AIzaSyCS7B-j0VAWI7i8dkJiqwZX9rXqI2VIkac",
  authDomain: "lab5-3fe77.firebaseapp.com",
  projectId: "lab5-3fe77",
  storageBucket: "lab5-3fe77.appspot.com",
  messagingSenderId: "359207870091",
  appId: "1:359207870091:web:f49488d11a4dedc2de3e8e"
});

const DB = getFirestore(APP)
const AUTH = getAuth(APP)

function getDocFromDB(c, d){
  return getDoc(doc(DB, c, d));
}

function getCollectionFromDB(c){
  return getDocs(collection(DB, c));
}

function setLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getLS(key) {
  return JSON.parse(localStorage.getItem(key));
}
  
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    uid: null,
    board: { notes: [] },
    categories:[],
    filteredNotes: [],
    isLoggedIn: false,
  },
  getters: {
    getBoard(state){
      return state.board;
    },
    getCategories(state){
      return state.categories;
    },
    isLoggedIn(state){
      state.isLoggedIn = getLS('isLoggedIn');
      return state.isLoggedIn;
    },
    filteredNotes: (state) => (selectedFilters) => {
        return state.board.notes.filter(note => {
          if (selectedFilters.length > 0){
            return selectedFilters.includes(String(note.category));
          }
          console.log('filteredNotes');
         return state.board.notes;
       })
    },
  },
  actions: {
    addNote(context, note){
      console.log(note);
      context.state.board.notes.push(note);

      return context.dispatch('updateBoard', context.state.board)
    },
    updateBoard(context, data){
      const noteIndex = context.state.board.notes.findIndex(el => { return el.id === data.id; })
      context.state.board.notes.splice(noteIndex, 1, data);
      setDoc(doc(DB, 'Boards', data.uid), context.state.board);
    },
    deleteNote(context, data){
      const noteIndex = context.state.board.notes.findIndex(el => { return el.id === data.id; })
      context.state.board.notes.splice(noteIndex, 1);
      deleteDoc(doc(DB, 'Boards', data));
    },
    fetchNotes(context) {
      getDocFromDB('Boards', context.state.uid)
        .then(response => {
          context.state.board.notes = null;
          context.state.board.notes = response.data();
      });
    },
    fetchCategories(context) {
      getCollectionFromDB('Categories')
        .then(response => {
          context.state.categories = [];
          response.forEach(document => {
            context.state.categories.push(document.data());
        })
      });
    },
    login(context, userCred){
      if (userCred.email.length && userCred.password.length) {
        signInWithEmailAndPassword(AUTH, userCred.email, userCred.password)
          .then((cred) => {
            context.state.isLoggedIn = true;
            setLS('isLoggedIn', true)
            context.state.uid = cred.user.uid;
            console.log('login');
            context.dispatch('fetchNotes')
          })
          .catch((error) => {
            console.error(error)
          })
      }
    },
    // getLSloginState(){
    //   const loginState = getLS('isLoggedIn');
    //   console.log(loginState);
    //   return loginState;
    // }
  }
})
