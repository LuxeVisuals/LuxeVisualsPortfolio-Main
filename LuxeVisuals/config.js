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
  // Any files you add to Portfolio/Photos and Portfolio/Videos (01, 02, 03... 100+)
  // are automatically scanned and rendered on the website!
  portfolio: {
    maxItemsToCheck: 100,
    photoExtensions: ['png', 'jpg', 'jpeg', 'webp', 'gif'],
    videoExtensions: ['mp4', 'webm', 'mov']
  }
};

// Expose globally
window.LUXE_CONFIG = LUXE_CONFIG;
