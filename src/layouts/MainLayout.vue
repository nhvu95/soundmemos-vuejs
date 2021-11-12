<template>
  <q-layout view="lHh Lpr lFf" style="cursor: default">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> Sound Memos </q-toolbar-title>

        <div>v{{ version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list id="all-your-record-wrapper">
        <q-item-label header id="all-your-record-header">
          <span>All your records</span>
          <q-btn
            class="record-btn"
            size="md"
            unelevated
            :icon="'system_update_alt'"
            @click="downloadAll"
          />
        </q-item-label>
        <div>
          <ListSoundItem
            v-for="sound in listSound"
            :key="sound.name"
            v-bind="sound"
            @selected="selectedSoundMemos"
            @downloadSound="downloadSound"
          />
        </div>
        <q-item-label footer id="delete-wrapper">
          <q-btn color="black" icon="delete" label="Delete" unelevated />
        </q-item-label>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import ListSoundItem from 'src/components/ListSoundItem.vue';
import { ISound } from 'src/components/models';

import { Vue, Options } from 'vue-class-component';
import { emitter } from '../boot/event-bus';
import { getSoundList } from '../components/indexed-db';

const VERSION = +(process.env.VERSION ? process.env.VERSION : '');

interface ISoundItem extends Partial<ISound> {
  selected: boolean;
}

@Options({
  components: { ListSoundItem },
})
export default class MainLayout extends Vue {
  leftDrawerOpen = false;
  version = VERSION;
  listSound: ISoundItem[] = [] as ISoundItem[];
  mounted() {
    this.updateSoundList();
    void emitter.on('LIST_CHANGE', () => {
      void this.updateSoundList();
    });
  }
  toggleLeftDrawer() {
    this.leftDrawerOpen = !this.leftDrawerOpen;
    /* eslint-disable */
    void emitter.emit('TAB_CHANGE', this.leftDrawerOpen);
  }

  selectedSoundMemos(id: string) {
    this.listSound.forEach((sound) => {
      if (sound.id === id) sound.selected = true;
      else {
        sound.selected = false;
      }
    });
  }
  downloadSound(id: string) {
    console.log('downloadSound', id);
  }
  updateSoundList() {
    void getSoundList().then((list) => {
      this.listSound = list as ISoundItem[];
      console.log(this.listSound[0]);
    });
  }
  downloadAll() {
    console.log('downloadAll');
  }
}
</script>
