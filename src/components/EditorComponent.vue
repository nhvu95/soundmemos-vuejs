<template>
  <div class="editor-wrapper">
    <h2 class="title">{{ title }}</h2>
    <div @click="updateCurrentTime">
      <div id="waveform-timeline"></div>
      <div id="waveform"></div>
      <!-- <div id="waveform-recorder"></div> -->
      <div id="wave-minimap" ref="waveMinimap"></div>
    </div>
    <div class="info">
      <div class="time">
        <h4>
          <span style="position: relative"
            ><q-btn
              @click="onClickPlay"
              unelevated
              :icon="playButtonIcn"
              :disable="
                recordIcon === 'pause' ||
                (recordIcon === 'mic' && audioPlaySet.size == 0)
              "
              padding="none"
              round
              size="xs"
              style="
                font-size: 1.75rem;
                padding: 0px;
                min-width: 0px;
                min-height: 0px;
                position: absolute;
                margin: 0px;
                left: -55px;
                top: -4px;
              "
          /></span>
          {{ currentTime }}
        </h4>
      </div>
      <div class="file-name">
        <q-input
          standout
          v-model="onOpeningFileName"
          :dense="true"
          style="width: 400px; margin: auto; font-size: 1.75rem"
        />
      </div>
      <div class="date-name"><p>2021/10/24</p></div>
    </div>
    <div class="controls">
      <q-btn
        outline
        no-caps
        class="clear-btn"
        label="Clear"
        @click="onClickClear"
        :disable="recordIcon === 'pause' || title === 'PLAYING'"
      />
      <q-btn
        class="record-btn"
        size="lg"
        unelevated
        round
        :icon="recordIcon"
        @click="onClickRecord"
      />
      <q-btn
        outline
        no-caps
        class="done-btn"
        label="Done"
        @click="onClickDone"
        :disable="recordIcon === 'pause'"
      />
    </div>
    <audio ref="player" controls style="display: none"></audio>
  </div>
</template>

<script lang="ts">
import { Vue, prop } from 'vue-class-component';
import { ISound, IMeta } from '../shared/models';
import { emitter } from '../boot/event-bus';
import { audioBufferSlice } from 'audiobuffer-slice';
import { getDBInstance, addSoundToDB, getSound } from '../shared/indexed-db';
/* eslint-disable */
import { v1 as uuidv1 } from 'uuid';

declare const WaveSurfer: any;

class Props {
  readonly todos = prop<ISound[]>({ default: () => [] });
  readonly meta!: IMeta;
  readonly active!: boolean;
}

export default class EditorComponent extends Vue.with(Props) {
  clickCount = 0;
  recordIcon: 'pause' | 'mic' | 'play_arrow' = 'mic';
  playButtonIcn: 'play_arrow' | 'stop' = 'play_arrow';
  currentTime = '00:00.0';
  endOfRecord = 0;
  wavesurfer: any;
  audioBuffer?: AudioBuffer;
  audioPlaySet = new Set();
  onOpeningFileName = 'New Recording...';
  onOpeningId = uuidv1();
  // mediaRecorder?: MediaRecorder;
  title: 'PLAYING' | 'RECORD' = 'RECORD';

  mounted() {
    getDBInstance();
    this.initWavesurfer();
    this.waveSurferEventHandler();
    this.emmiterEventHandler();
  }
  /**
   * Init Wavesurfer
   */
  initWavesurfer() {
    this.wavesurfer = WaveSurfer.create({
      container: '#waveform',
      waveColor: 'white',
      progressColor: '#46f0d4',
      barRadius: 0,
      barWidth: 1,
      barGap: 3,
      height: 200,
      cursorWidth: 2,
      cursorColor: '#46f0d4',
      responsive: true,
      scrollParent: true,
      appendMode: true,
      fillParent: true,
      autoCenter: true,
      barMinHeight: 1,
      minPxPerSec: 30,
      plugins: [
        WaveSurfer.timeline.create({
          container: '#waveform-timeline',
          fontSize: '14',
          fillParent: true,
          scrollParent: true,

          // notchPercentHeight: 5,
          formatTimeCallback: (seconds: number) => {
            if (seconds / 60 >= 1) {
              // calculate minutes and seconds from seconds count
              let minutes = '00' + parseInt(`${seconds / 60}`, 10);
              seconds = parseInt(`${seconds % 60}`, 10);

              let lasSeconds = `00${seconds}`.slice(-2);
              return ''.concat(minutes.slice(-2), ':').concat(lasSeconds);
            }
            let sec = '00' + (Math.round(seconds * 1000) / 1000).toString();
            return `00:${sec.slice(-2)}`;
          },
        }),
        WaveSurfer.minimap.create({
          container: '#wave-minimap',
          waveColor: '#777',
          progressColor: 'white',
          height: 50,
        }),
        WaveSurfer.microphone.create({
          // container: '#wave-minimap',
        }),
      ],
    });
  }
  /**
   * Handle event from others components
   */
  emmiterEventHandler() {
    const self = this;
    emitter.on('SELECT_SOUND', (id: string) => {
      self.onClickClear();
      this.title = 'PLAYING';
      this.playButtonIcn = 'play_arrow';
      getSound(id).then((sound) => {
        console.log(sound);
        self.endOfRecord = sound.time;
        self.audioPlaySet.add(sound.id);
        self.onOpeningFileName = sound.name;
        self.wavesurfer.loadBlob(sound.blob);
      });
    });

    emitter.on('CREATE_NEW', () => {
      self.onClickClear();
      self.title = 'RECORD';
      self.onOpeningFileName = 'New Recording...';
    });
  }
  /**
   * Handle event Wavesurfer - call after init / reinit
   */
  waveSurferEventHandler() {
    const self = this;
    /* eslint-disable */
    this.wavesurfer.on('ready', function () {
      // self.wavesurfer.play();
    });
    this.wavesurfer.on('audioprocess', function () {
      let currentCursor = self.wavesurfer.getCurrentTime();
      self.currentTime = self.formatTime(currentCursor);
      console.log(currentCursor, self.endOfRecord);
      if (currentCursor + 0.1 >= self.endOfRecord) {
        self.playButtonIcn = 'play_arrow';
      }
    });

    this.wavesurfer.on('seek', function () {
      self.currentTime = self.formatTime(self.wavesurfer.getCurrentTime());
    });

    this.wavesurfer.microphone.on(
      'deviceReady',
      function (stream: MediaStream) {
        console.log('Device ready!', stream);
      }
    );
    this.wavesurfer.microphone.on('deviceError', function (code) {
      console.warn('Device error: ' + code);
    });
    emitter.on('TAB_CHANGE', (toogle: boolean) => {
      setTimeout(() => {
        self.wavesurfer.minimap._onZoom(0);
        setTimeout(() => {
          self.wavesurfer.zoom(0);
        }, 100);
      }, 100);
    });
  }

  formatTime(seconds: number) {
    let secondsFix = seconds.toFixed(1);
    if (seconds / 60 >= 1) {
      // calculate minutes and seconds from seconds count
      let minutes = parseInt(`${seconds / 60}`, 10);
      let replcStr = +secondsFix - minutes * 60;
      let lasSeconds = `0${replcStr.toFixed(1)}`.slice(-4);
      return '00'.concat(minutes.toString()).slice(-2).concat(':', lasSeconds);
    }
    let sec = '0' + secondsFix;
    return `00:${sec.slice(-4)}`;
  }

  updateCurrentTime() {
    this.currentTime = this.formatTime(this.wavesurfer.getCurrentTime());
  }
  onClickClear() {
    this.recordIcon === 'mic';
    this.wavesurfer.minimap.empty();
    this.wavesurfer.stop();
    this.wavesurfer.empty();
    this.wavesurfer.destroy();
    this.initWavesurfer();
    this.waveSurferEventHandler();
    this.endOfRecord = 0;
  }
  onClickPlay() {
    console.log('onClickPlay');
    if (this.playButtonIcn === 'play_arrow') {
      this.playButtonIcn = 'stop';
      this.wavesurfer.play();
    } else {
      this.playButtonIcn = 'play_arrow';
      this.wavesurfer.stop();
      this.wavesurfer.seekAndCenter(1);
    }
  }

  onClickRecord() {
    this.title = 'RECORD';
    if (!this.onOpeningId || this.onOpeningId.trim() === '') {
      this.onOpeningId = uuidv1();
    }
    if (this.recordIcon === 'mic') {
      this.wavesurfer.microphone.micContext.resume();
      this.wavesurfer.microphone.togglePlay();
      if (!this.audioPlaySet.has(this.onOpeningFileName)) {
        this.audioPlaySet.add(this.onOpeningFileName);
      }
      this.recordIcon = 'pause';
      // compare with last time run
      let currentCursor = this.wavesurfer.getCurrentTime();
      if (currentCursor !== this.endOfRecord) {
        this.handleSlice(currentCursor);
      }
    } else {
      //pause
      this.wavesurfer.microphone.togglePlay();
      this.recordIcon = 'mic';
      this.endOfRecord = this.wavesurfer.getCurrentTime();
    }
  }

  handleSlice(endTime) {
    let newBuffer;
    audioBufferSlice(
      this.wavesurfer.backend.buffer,
      0,
      endTime * 1000,
      function (error, slicedAudioBuffer) {
        if (error) {
          console.error(error);
        } else {
          newBuffer = slicedAudioBuffer;
        }
      }
    );
    this.wavesurfer.backend.buffer = newBuffer;
  }

  onClickDone() {
    const self = this;
    this.wavesurfer.microphone.stop();
    this.recordIcon = 'mic';
    // debugger
    this.audioBuffer = this.wavesurfer.backend.buffer;
    // Float32Array samples
    if (this.audioBuffer) {
      var worker = new Worker('libs/recorderWorker.js');

      // initialize the new worker
      worker.postMessage({
        command: 'init',
        config: { sampleRate: 48000, numChannels: 1 },
      });

      // callback for `exportWAV`
      worker.onmessage = function (e) {
        var blob = e.data;
        addSoundToDB({
          id: self.onOpeningId,
          name: self.onOpeningFileName,
          time: self.endOfRecord,
          blob,
          date: +new Date(),
        });
        self.onOpeningId = '';
        void emitter.emit('LIST_CHANGE');
        // self.download(blob);
        // this is would be your WAV blob
      };

      // send the channel data from our buffer to the worker
      worker.postMessage({
        command: 'record',
        buffer: [
          this.audioBuffer.getChannelData(0),
          // this.audioBuffer.getChannelData(0),
        ],
      });

      // ask the worker for a WAV
      worker.postMessage({
        command: 'exportWAV',
        type: 'audio/wav',
      });
    }
    this.onClickClear();
  }
}
</script>
