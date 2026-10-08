// The video catalog (videos.json) plus helpers for the browser side. The JSON
// is also read by plugins/ai-markdown.js, so keep the data there, not here.
import data from './videos.json';

export const videos = data.videos;
export const videoById = Object.fromEntries(videos.map((v) => [v.id, v]));

export const KIND_LABEL = {
  explainer: 'Explainer',
  walkthrough: 'Console walkthrough',
};

// Privacy-enhanced host; only requested after the reader presses play.
export const embedUrl = (v) => `https://www.youtube-nocookie.com/embed/${v.youtube}?autoplay=1&rel=0&modestbranding=1`;
export const watchUrl = (v) => `https://www.youtube.com/watch?v=${v.youtube}`;
