/**
 * ====================================================================
 * LUXEVISUALS PORTFOLIO CONFIGURATION
 * ====================================================================
 * You can easily edit any of the numbers, links, or text here!
 */
const LUXE_CONFIG = {
  // Experience & Stats (Easily change the values anytime!)
  stats: {
    experienceMonths: "10+",   // "10+ months"
    experienceLabel: "Months Exp.",
    projectsDone: "5+",        // "5+ projects"
    projectsLabel: "Projects Done",
    happyClients: "10+",       // "10+ happy clients"
    clientsLabel: "Happy Clients"
  },

  // Social Links
  links: {
    discord: "https://discord.com/users/1057018141433139281",
    twitter: "https://x.com/LuxeVisualsDev"
  },

  // Portfolio items configuration
  // Auto-scan checks Portfolio/Photos and Portfolio/Videos up to maxItemsToCheck
  // If you want instant zero-delay loading without waiting for file scans,
  // list your known files here! If left empty or undefined, it auto-scans the folders.
  portfolio: {
    maxItemsToCheck: 50,
    photoExtensions: ['png', 'jpg', 'jpeg', 'webp', 'gif'],
    videoExtensions: ['mp4', 'webm', 'mov'],
    // Registered items load instantly and guaranteed:
    knownVideos: ['01.mp4', '02.mp4', '03.mp4', '04.mp4'],
    knownPhotos: ['01.png', '02.png', '03.png', '04.png']
  }
};

// Expose globally
window.LUXE_CONFIG = LUXE_CONFIG;
