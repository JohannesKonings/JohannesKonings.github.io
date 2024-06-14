import type { Site, Page, Links, Socials } from "@types"

// Global
export const SITE: Site = {
  TITLE: "Johannes Konings",
  DESCRIPTION: "Contact and some posts",
  AUTHOR: "Johannes Konings",
}

// Blog Page
export const BLOG: Page = {
  TITLE: "Blog",
  DESCRIPTION: "Writing on topics I am passionate about.",
}


// Search Page
export const SEARCH: Page = {
  TITLE: "Search",
  DESCRIPTION: "Search all posts and projects by keyword.",
}

// Links
export const LINKS: Links = [
  { 
    TEXT: "Home", 
    HREF: "/", 
  },
  { 
    TEXT: "Blog", 
    HREF: "/blog", 
  },
]

// Socials
export const SOCIALS: Socials = [
  { 
    NAME: "Email",
    ICON: "email", 
    TEXT: "mail@johanneskonings.dev",
    HREF: "mailto:mail@johanneskonings.dev",
  },
  { 
    NAME: "Github",
    ICON: "github",
    TEXT: "JohannesKonings",
    HREF: "https://github.com/JohannesKonings"
  },
  { 
    NAME: "LinkedIn",
    ICON: "linkedin",
    TEXT: "JohannesKonings",
    HREF: "https://www.linkedin.com/in/JohannesKonings/",
  },
  { 
    NAME: "Mastodon",
    ICON: "mastodon",
    TEXT: "@KoningsJohannes",
    HREF: "https://awscommunity.social/@KoningsJohannes",
  },
  { 
    NAME: "dev",
    ICON: "dev",
    TEXT: "dev.to",
    HREF: "https://dev.to/johanneskonings",
  },
]
