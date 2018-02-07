"use strict";

var channel = require("cordova/channel");
var exec = require("cordova/exec");
var argscheck = require("cordova/argscheck");


const _StreamingMediaEvents = [
  "loadState",
  "playbackState"
];

class StreamingMedia {
  constructor() {
  }
  playAudio(url, options) {
    options = options || {};
    exec(options.successCallback || null, options.errorCallback || null,
      "StreamingMedia", "playAudio", [url, options]);
  }
  pauseAudio(options) {
    options = options || {};
    exec(options.successCallback || null, options.errorCallback || null,
      "StreamingMedia", "pauseAudio", [options]);
  }
  resumeAudio(options) {
    options = options || {};
    exec(options.successCallback || null, options.errorCallback || null,
      "StreamingMedia", "resumeAudio", [options]);
  }
  stopAudio(options) {
    options = options || {};
    exec(options.successCallback || null, options.errorCallback || null,
      "StreamingMedia", "stopAudio", [options]);
  }
  playVideo(url, options) {
    options = options || {};
    exec(options.successCallback || null, options.errorCallback || null,
      "StreamingMedia", "playVideo", [url, options]);
  }
  loadState(onSuccess, onError) {
    exec(onSuccess || null, onError || null, "StreamingMedia", "loadState", []);
  }
  playbackState(onSuccess, onError) {
    exec(onSuccess || null, onError || null, "StreamingMedia", "playbackState",
      []);
  }
  watch(event, onEvent) {
    argscheck.checkArgs("sfF", "watch", arguments);

    if (StreamingMedia.events.includes(event)) {
      // Create Channel for event
      if (!(event in channel)) {
        channel.create(event);
      }

      // If no subscribers, start watching.
      // Because, we are stopping watch when there are no subscribers. Hence
      // needs restart
      if (channel[event].numHandlers === 0) {
        exec(StreamingMedia.onSubscribeEvent, null, "StreamingMedia",
          "watch" + event.capitalize(), []);
      }

      channel[event].subscribe(onEvent);
    } else {
      throw TypeError(event + " not in "
        + JSON.stringify(StreamingMedia.events));
    }
  }
  unwatch(event, onEvent) {
    argscheck.checkArgs("sfF", "unwatch", arguments);

    if (StreamingMedia.events.includes(event) === false) {
      throw TypeError(event + " not in "
        + JSON.stringify(StreamingMedia.events));
    }
    if (event in channel === false) {
      throw TypeError(event + " has not be watched");
    }

    channel[event].unsubscribe(onEvent);

    // Stop watch when there are no subscribers.
    if (channel[event].numHandlers === 0) {
      exec(null, null, "StreamingMedia", "unwatch" + event.capitalize(), []);
    }
  }
  static install() {
    if (!window.plugins) {
      window.plugins = {};
    }
    window.plugins.streamingMedia = new StreamingMedia();
    return window.plugins.streamingMedia;
  }

  static get events() {
    return _StreamingMediaEvents;
  }

  static onSubscribeEvent(event, value) {
    argscheck.checkArgs("s*", "onSubscribeEvent", arguments);

    if (event) {
      channel[event].fire(value);
    }
  }
}


String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

cordova.addConstructor(StreamingMedia.install);
