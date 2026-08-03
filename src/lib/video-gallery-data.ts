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
 * One tile per uploaded asset (3 videos + 4 photos).
 */
export const GALLERY_VIDEOS: GalleryItem[] = [
  {
    id: "job-clip",
    title: "House removals in Aberdeen",
    caption: "Cases wrapped and liftgate-loaded for a full house removal.",
    src: "/gallery/job-clip.mp4",
    poster: "/gallery/job-clip-poster.jpg",
    duration: "0:40",
  },
  {
    id: "van-crew",
    title: "Man and van, Aberdeen",
    caption: "Local man and van crew ready for the next Aberdeen pickup.",
    poster: "/gallery/van-crew.jpg",
  },
  {
    id: "packing-truck",
    title: "Office removals, packed",
    caption: "A secured load ready for office removals across Aberdeen.",
    poster: "/gallery/packing-truck.png",
  },
  {
    id: "sofa-delivery",
    title: "Furniture delivery",
    caption: "Sofa wrapped and carried in for furniture delivery in Aberdeen.",
    poster: "/gallery/sofa-delivery.jpg",
  },
  {
    id: "piano-move",
    title: "Specialist piano move",
    caption: "Fragile items handled with care on specialist removals in Aberdeen.",
    poster: "/gallery/piano-move.png",
  },
  {
    id: "crew-run",
    title: "Removals crew on site",
    caption: "Real footage from an UrbanMove Removals Man and Van Job in Aberdeen",
    src: "/gallery/crew-run.mp4",
    poster: "/gallery/crew-run-poster.png",
    duration: "0:22",
  },
  {
    id: "van-loading",
    title: "Loading the van",
    caption: "UrbanMove Removals man and van crew packing a secure load for the road.",
    src: "/gallery/van-loading.mp4",
    poster: "/gallery/van-loading-poster.png",
    duration: "0:24",
  },
];
