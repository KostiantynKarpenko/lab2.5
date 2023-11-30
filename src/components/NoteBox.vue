<template>
    <div class="note">
        <div class="move-trigger">
            <div class="remove" @click="deleteNote(note)">🗑</div>
            <select @change="updateNoteCategory">
                <option v-for="category in categories" 
                :key="category.id" 
                :value="category.id" 
                :selected="category.id === note.category"> {{ category.name }}</option>
            </select>
        </div>
        <textarea
        placeholder="Enter your text"
        :value="note.text"
        @input="updateNoteText"></textarea>
    </div>
</template>

<script>
export default {
    props: {
        note: {
            type: Object,
            required: true,
        },
    },
    methods: {
        deleteNote(note)
        {
            this.$store.dispatch("deleteNote", note);
        },
        updateNoteText(e){
            let changedNote = this.note
            changedNote.text = e.target.value
            this.$store.dispatch("updateBoard", changedNote)
        },
        updateNoteCategory(e){
            let changedNote = this.note
            changedNote.category = e.target.value
            this.$store.dispatch("updateBoard", changedNote)
        }
    },
    created(){
        this.categories = this.$store.getters['getCategories']
    }
}
</script>
