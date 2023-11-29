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
  // deleteDoc
} from 'firebase/firestore'

import {
  createUserWithEmailAndPassword,
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
    isLoggedIn: false
  },
  getters: {
    getBoard(state){
      return state.board;
    },
    getNotes(state){
      return state.board.notes;
    },
    getCategories(state){
      return state.categories;
    },
    isLoggedIn(state){
      state.isLoggedIn = getLS('isLoggedIn');
      return state.isLoggedIn;
    },
    uid(state){
      state.uid = getLS('uid')
      return state.uid
    },
    filteredNotes: (state) => (selectedFilters) => {
      return state.board.notes.filter(note => {
        if (selectedFilters.length > 0){
          return selectedFilters.includes(String(note.category));
        }
       return state.board.notes;
     })
    },
  },
  actions: {
    addNote(context, note){
      context.state.board.notes.push(note);
      return setDoc(doc(DB, 'Boards', note.uid), context.state.board)
    },
    updateBoard(context, note){
      const noteIndex = context.state.board.notes.findIndex(el => { return el.id === note.id; })
      context.state.board.notes.splice(noteIndex, 1, note);
      setDoc(doc(DB, 'Boards', note.uid), context.state.board);
    },
    deleteNote(context, note){
      const noteIndex = context.state.board.notes.findIndex(el => { return el.id === note.id; })
      context.state.board.notes.splice(noteIndex, 1);
      setDoc(doc(DB, 'Boards', note.uid), context.state.board);
    },
    fetchNotes(context) {
      context.state.board.notes = [];
      getDocFromDB('Boards', context.state.uid)
        .then(response => {
          if (response.data()){
            context.state.board.notes = response.data().notes;
          }
          else {
            context.state.board.notes = [];
          }

      });
    },
    fetchCategories(context) {
      context.state.categories = [];
      getCollectionFromDB('Categories')
        .then(response => {
          response.forEach(document => {
            context.state.categories.push(document.data());
        })
      });
    },
    signIn(context, userCred){
      if (userCred.email.length && userCred.password.length) {
        signInWithEmailAndPassword(AUTH, userCred.email, userCred.password)
          .then((cred) => {
            context.state.isLoggedIn = true;
            setLS('isLoggedIn', true)
            context.state.uid = cred.user.uid;
            setLS('uid', cred.user.uid)
            context.dispatch('fetchNotes')
          })
          .catch((error) => {
            console.log(error.code);
          })
      }
    },
    signUp(context, userCred){
      if (userCred.email.length && userCred.password.length) {
        createUserWithEmailAndPassword(AUTH, userCred.email, userCred.password)
          .then((cred) => {
            context.state.isLoggedIn = true;
            setLS('isLoggedIn', true)
            context.state.uid = cred.user.uid;
            setLS('uid', cred.user.uid)
            context.dispatch('fetchNotes')
          })
          .catch((error) => {
            console.error(error)
          })
      }
    },
    signOut(context){
      if (context.state.isLoggedIn){
        context.state.isLoggedIn = false;
        context.state.uid = null;
        context.state.board.notes = [];
        context.state.filteredNotes = null;
        localStorage.removeItem('uid')
        setLS('isLoggedIn', false)
      }
    },
    getDataFromLS(context){
      context.state.uid = getLS('uid')
      context.state.isLoggedIn = getLS('isLoggedIn')
    }
  }
})
