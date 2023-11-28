<template>
  <div id="app">
    <div class="login-window" v-if="!isLoggedIn">
      <div class="login-box">
        <h3 class="title">Login</h3>
        <div class="form">
          <input type="text" placeholder="Email" v-model="userCred.email">
          <input type="text" placeholder="Password" v-model="userCred.password">
        </div>
        <div class="login-actions">
          <button @click="login()" class="btn">Login</button>
        </div>
      </div>
    </div>
    <template v-else>
      <div class="filtering">
        <div class="filter-by-category">
          <a>Filter by category:</a>
          <div class="drop-list">
            <ul class="filters-list">
              <li class="filters-item" v-for="category in categories" :key="category.id">
                <input type="checkbox"
                :id="'fc' + category.id"
                @input="filterTrigger({id: category.id, name: category.name})">
                <label :for="'fc' + category.id">{{ category.name }}</label>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="area" @mousedown="mousedown" @mousemove="mousemove" @mouseup="mouseup">
        <template v-if="board">
          <NoteBox v-for="(note, index) in filteredNotes" 
          :key="note.id" 
          :note-index="index" 
          :note="note" 
          :style="'left: ' + note.coords.x + 'px; top: ' + note.coords.y + 'px;'"/>
        </template>
      </div>
      <div class="actions">
        <button class="btn" @click=addNote()>Add note</button>
      </div>
    </template>
  </div>
</template>

<script>

import NoteBox from './components/NoteBox.vue'

export default{
  data(){
    return {
      userCred:{
        email: '',
        password: '',
      },
      startCoords: {
        x: 0,
        y: 0
      },
      currentCoords: {
        x: 0,
        y: 0
      },
      currentNoteIndex: null,
      action: false,
      selectedFilters: []
    }
  },
  components:{
    NoteBox
  },
  computed:{
    getNotes(){
      return this.$store.getters['getNotes']
    },
    filteredNotes(){
      return this.$store.getters['filteredNotes'](this.selectedFilters)
    },
    categories(){
      return this.$store.getters['getCategories']
    },
    isLoggedIn(){
      return this.$store.getters['isLoggedIn']
    },
    
  },
  methods:{
    addNote() {
      this.$store.dispatch('addNote', {
        coords: {
          x: 0,
          y: 0
        },
        text: '',
        id: Date.now().toString(),
        category: "0001"
      })
    },
    login(){
      this.$store.dispatch('login', this.userCred)
    },
    mousedown(event){
      if (event.target.classList.contains('move-trigger')){
        this.action = true;
        this.currentNoteIndex = event.target.parentNode.getAttribute('note-index')
        this.startCoords.x = event.pageX;
        this.startCoords.y = event.pageY;
      }
    },
    mouseup(){
      if (this.action) {
        this.action = false;
        this.notes[this.currentNoteIndex].coords.x = this.currentCoords.x
        this.notes[this.currentNoteIndex].coords.y = this.currentCoords.y
        this.$store.dispatch('updateNotes', this.notes[this.currentNoteIndex])
      }
    },
    mousemove(event){
      if (this.action){
        this.currentCoords.x = this.notes[this.currentNoteIndex].coords.x + (event.pageX - this.startCoords.x)
        this.currentCoords.y = this.notes[this.currentNoteIndex].coords.y + (event.pageY - this.startCoords.y)

        if (this.currentCoords.x <= 0) this.currentCoords.x = 0;
        if (this.currentCoords.y <= 0) this.currentCoords.y = 0;
        
        document.querySelector('.note[note-index="' + this.currentNoteIndex + '"]').style.left = this.currentCoords.x + 'px';
        document.querySelector('.note[note-index="' + this.currentNoteIndex + '"]').style.top = this.currentCoords.y  + 'px';
      }
    },
    filterTrigger(category){
      let elIndex = this.selectedFilters.indexOf(category.id);
      if (elIndex != (-1)) {
        this.selectedFilters.splice(elIndex, 1);
        document.querySelector('#fc' + category.id).checked = false;
      } else {
        this.selectedFilters.push(category.id)
      }
    }
  },
  created(){
    this.$store.dispatch('fetchCategories');
    this.$store.dispatch('fetchNotes');
  }
}
</script>

<style lang="less">
  @import './assets/less/index.less';
</style>
