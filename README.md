# Quasar App (sound-memos)
Demo here : https://soundmemos.com/  
There are a lot of recording websites.
Some are very simple, only have record function => and download after done. If you are recording and you got an incorrect pronunciation. => R.I.P. you have to record again.

Some are very complex, the user needs to record first, then download => upload to edit.  
**I just want a website where people can record and edit right where they have incorrect pronunciation.**  
So that why this project was born.

## What is funny??
- I handle the sounds and store it on browser - don't use server.
- I customized the library [wavesurfer.js](https://wavesurfer-js.org/) to handle stream data, and draw the sound wave by my way :D. Wavesuffer is not offical support this feature. So if you want to do something like this, you can refer my code.  
- I refer the code of [recorder.js](https://github.com/mattdiamond/Recorderjs) to handle array buffer and conver array buffer to blob.  
Special thanks [Matt Diamond
](https://github.com/mattdiamond)
## Install the dependencies
```bash
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
npx quasar dev
or
quasar dev
```

### Lint the files
```bash
npm run lint
```

### Build the app for production
```bash
quasar build
```

### Customize the configuration
See [Configuring quasar.conf.js](https://quasar.dev/quasar-cli/quasar-conf-js).
