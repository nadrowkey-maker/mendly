import { Config } from "@remotion/cli/config";

// JPEG pour les images intermédiaires : dix fois plus rapide que PNG, et la
// vidéo finale est compressée de toute façon.
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
// yuv420p : le seul format de pixels que TikTok, Instagram et les lecteurs
// de téléphone lisent tous sans réencoder.
Config.setPixelFormat("yuv420p");
Config.setCrf(16);
