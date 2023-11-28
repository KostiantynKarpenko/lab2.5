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
        deleteNote(data)
        {
            this.$store.dispatch("deleteNote", data);
        },
        updateNoteText(e){
            const updatableNote = {...this.note, text: e.target.value}
            this.$store.dispatch("updateNote", updatableNote)
        },
        updateNoteCategory(e){
            const updatableNote = {...this.note, category: e.target.value}
            this.$store.dispatch("updateNote", updatableNote)
        }
        
    },
    created(){
        this.categories = this.$store.getters['getCategories']
    }
}
</script>
