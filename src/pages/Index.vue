<template>
  <q-page class="row items-center justify-evenly  main-component">
    <editor-component
      title="RECORD"
      active
    ></editor-component>
  </q-page>
</template>

<script lang="ts">
import EditorComponent from 'src/components/EditorComponent.vue';
import { Vue, Options } from 'vue-class-component'

@Options({
  components: { EditorComponent }
})
export default class PageIndex extends Vue {

};
</script>
