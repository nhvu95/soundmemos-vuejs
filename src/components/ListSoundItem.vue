<template>
  <q-item
    tag="a"
    target="_blank"
    @click="selectAnItem"
    v-bind:style="selected ? { backgroundColor: '#bce5f2' } : ''"
    :select="selected"
  >
    <q-item-section avatar class="sound-item">
      <q-btn
        size="md"
        unelevated
        flat
        color="#757575"
        round
        :icon="actionIcon"
        @click="downloadSound"
      />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ name }}</q-item-label>
      <q-item-label caption style="height: 1rem">
        <div style="display: inline-block; width: 50%">{{ date }}</div>
        <div style="display: inline-block; width: 50%; text-align: right">
          {{ time }}
        </div>
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script lang="ts">
import { Vue, prop, Options } from 'vue-class-component';

class Props {
  readonly id = prop({ default: '#' });
  readonly name = prop({ default: 'sound_memos' });
  readonly selected = prop({ default: false });
  readonly date = prop({ default: '2021/11/10' });
  readonly time = prop({ default: '#' });
}

@Options({})
export default class ListSoundItem extends Vue.with(Props) {
  actionIcon = 'download';
  selectAnItem() {
    this.$emit('selected', this.id);
  }
  downloadSound($event: PointerEvent) {
    this.$emit('downloadSound', this.id);
    // $event.stopPropagation();
    $event.stopImmediatePropagation();
  }
}
</script>
