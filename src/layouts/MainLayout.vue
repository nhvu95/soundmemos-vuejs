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

        <a target="_blank" href="">v.{{ version }}</a>
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
            @click="downloadAllSound"
          />
        </q-item-label>
        <div id="sound-list">
          <ListSoundItem
            v-for="sound in listSound"
            :key="sound.name"
            v-bind="sound"
            @selected="selectedSoundMemos"
            @downloadSound="downloadOneSound"
          />
        </div>
        <q-item-label footer id="footer-wrapper">
          <q-btn
            color="black"
            icon="delete"
            label="Delete"
            unelevated
            @click="deleteASound"
          />
          <q-btn
            color="red"
            icon="add"
            label="Add New"
            unelevated
            @click="createNewRecord"
          />
        </q-item-label>
      </q-list>
    </q-drawer>

    <q-page-container>
      <editor-component active></editor-component>
    </q-page-container>
  </q-layout>
  <q-dialog v-model="confirm" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="strikethrough_s" color="primary" text-color="white" />
        <span class="q-ml-sm">Turn off your ads block please...</span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          label="Ok"
          color="primary"
          v-close-popup
          @click="checkAdsBlock"
        />
        <q-btn
          flat
          label="Yes"
          color="primary"
          v-close-popup
          @click="checkAdsBlock"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { detectAnyAdblocker } from 'just-detect-adblock';
import EditorComponent from 'src/components/EditorComponent.vue';
import ListSoundItem from 'src/components/ListSoundItem.vue';
import { ISound } from 'src/shared/models';
import { Options, Vue } from 'vue-class-component';
import { emitter } from '../boot/event-bus';
import {
  deleteSound,
  downloadAll,
  downloadOne, getSoundList
} from '../shared/indexed-db';


/* eslint-disable */

const VERSION = +(process.env.VERSION ? process.env.VERSION : '');
const SOURCE = process.env.SOURCE;
interface ISoundItem extends Partial<ISound> {
  selected: boolean;
}

@Options({
  components: { ListSoundItem, EditorComponent },
})
export default class MainLayout extends Vue {
  leftDrawerOpen = false;
  version = VERSION;
  source = SOURCE;

  listSound: ISoundItem[] = [] as ISoundItem[];
  selectedId = '';
  confirm = false;

  mounted() {
    this.updateSoundList();
    void emitter.on('LIST_CHANGE', () => {
      void this.updateSoundList();
    });

    detectAnyAdblocker().then((detected) => {
      if (detected) {
        this.confirm = true;
      }
    });
  }
  /**
   * Check ads block
   */
  checkAdsBlock() {
    window.location.reload();
  }

  /**
   * Close/ open the tabs
   */
  toggleLeftDrawer() {
    this.leftDrawerOpen = !this.leftDrawerOpen;
    void emitter.emit('TAB_CHANGE', this.leftDrawerOpen);
  }
  /**
   * Select A sound to do an action
   */
  selectedSoundMemos(id: string) {
    this.listSound.forEach((sound) => {
      if (sound.id === id) {
        sound.selected = true;
        this.selectedId = id;
        void emitter.emit('SELECT_SOUND', sound.id);
      } else {
        sound.selected = false;
      }
    });
  }
  /**
   * Update Sound list on Init/Delet/Add new
   */
  updateSoundList() {
    void getSoundList().then((list) => {
      this.listSound = list as ISoundItem[];
      // console.log(this.listSound);
    });
  }
  /**
   * Download All Sound in DB
   */
  downloadAllSound() {
    downloadAll().then(() => {
      console.log('Download Success');
    });
  }
  /**
   * Download One Sound
   */
  downloadOneSound(id: string) {
    downloadOne(id).then(() => {
      console.log('Download scucess');
    });
  }
  /**
   * Delete A Sound
   */
  deleteASound() {
    deleteSound(this.selectedId).then(() => {
      this.updateSoundList();
    });
  }
  /**
   * Create new Record
   */
  createNewRecord() {
    void emitter.emit('CREATE_NEW', true);
    this.listSound.forEach((sound) => {
      sound.selected = false;
    });
  }
}
</script>
