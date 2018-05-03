"use strict";

function promiseImage(img) {

    function a(resolve, reject) {
        img.onload = function () {
            if (img.naturalHeight == 0) {
                reject(img);
            } else {
                resolve(img.src);
            }
        }
        img.onerror = () => reject(img.src);
    }
    return new Promise(a);
}

function promiseAudio(audio) {
    function a(resolve, reject) {
        audio.oncanplaythrough = () => resolve(audio);
        audio.onerror = () => reject(audio.src);
    }
    return new Promise(a);
}

class AudioManager {
    constructor() {
        this.context = new AudioContext();
        this.audioId = null;
        this.bgm = null;
        
    }
    playBgm(key, audio) {
        let cln = audio.cloneNode();
        this.audioId = key;
        this.bgm = this.context.createMediaElementSource(cln);

        this.gainNode = this.context.createGain();
        this.gainNode.connect(this.context.destination);
        this.bgm.connect(this.gainNode);
        this.gainNode.gain.setValueAtTime(1.0, this.context.currentTime);

        cln.currentTime = 0;
        cln.loop = true;
        cln.play();
    }

    stopBgm() {
        const FADE_TIME = 7; // in seconds

        if (this.bgm == null) {
            return;
        }
        
        this.audioId = null;
        this.gainNode.gain.linearRampToValueAtTime(0.000, this.context.currentTime + FADE_TIME);

        let temp = this.gainNode;
        this.bgm = null;
        setTimeout(() => {
            temp.disconnect();
        }, FADE_TIME * 1000);
    }
};

class AssetManager {
    constructor() {
        this.imageMap = new Map();
        this.audioMap = new Map();

        this.audioManager = new AudioManager();
    }

    loadImage(key, url) {
        let img = new Image();
        let p = promiseImage(img);
        img.src = url;
        this.imageMap.set(key, img);
        return p;
    }

    getImage(key) {
        return this.imageMap.get(key);
    }

    loadAudio(key, url) {
        let audio = new Audio();
        let p = promiseAudio(audio);
        audio.src = url
        audio.preload = "auto";
        this.audioMap.set(key, audio);
        return p;
    }

    getAudio(key) {
        return this.audioMap.get(key);
    }

    playEffect(key) {
        let au = this.audioMap.get(key);
        let dup = au.cloneNode();
        dup.loop = false;
        dup.play();
    }

    stopBgm() {
        this.audioManager.stopBgm();
        // if(this.bgmKey!=null){
        //     this.audioMap.get(this.bgmKey).pause();
        //     this.bgmKey = null;
        // }
    }
    playBgm(key) {
        this.stopBgm();
        let au = this.audioMap.get(key);
        this.audioManager.playBgm(key, au);
        // au.currentTime = 0;
        // au.loop = true;
        // au.play();
        // this.bgmKey = key;   
    }

};

function toJson(response) {
    //console.log("response ",response);
    return response.json();
}

function promiseJson(url) {
    function a(err) {
        console.log("promise error");
        return Promise.reject(url);
    }
    return fetch(url).then(toJson).catch(a);
}
