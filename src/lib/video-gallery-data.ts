export type GalleryItem = {
  id: string;
  title: string;
  caption: string;
  poster: string;
  /** Present for video clips; omit for photo-only tiles. */
  src?: string;
  duration?: string;
};

/** @deprecated Use GalleryItem */
export type GalleryVideo = GalleryItem;

/**
 * Homepage gallery media from `public/gallery/`.
 * One tile per uploaded asset (2 videos + 4 photos).
 */
export const GALLERY_VIDEOS: GalleryItem[] = [
  {
    id: "crew-run",
    title: "Crew on the move",
    caption: "Real footage from an Urban Move job.",
    src: "/gallery/crew-run.mp4",
    poster: "/gallery/crew-run-poster.png",
    duration: "0:22",
  },
  {
    id: "packing-truck",
    title: "Packed and ready",
    caption: "A full load secured for the road.",
    poster: "/gallery/packing-truck.png",
  },
  {
    id: "sofa-delivery",
    title: "Sofa delivery",
    caption: "Wrapped and carried in with care.",
    poster: "/gallery/sofa-delivery.jpg",
  },
  {
    id: "piano-move",
    title: "Piano move",
    caption: "Fragile items handled the right way.",
    poster: "/gallery/piano-move.png",
  },
  {
    id: "van-crew",
    title: "At the van",
    caption: "Crew ready for the next pickup.",
    poster: "/gallery/van-crew.jpg",
  },
  {
    id: "van-loading",
    title: "Ready for the road",
    caption: "Crew loading up for the next run.",
    src: "/gallery/van-loading.mp4",
    poster: "/gallery/van-loading-poster.png",
    duration: "0:24",
  },
];
