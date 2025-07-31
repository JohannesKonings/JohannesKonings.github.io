export type Page = {
  TITLE: string;
  DESCRIPTION: string;
};

export interface Site extends Page {
  AUTHOR: string;
}

export type Links = {
  TEXT: string;
  HREF: string;
}[];

export type Socials = {
  NAME: "Email" | "Github" | "LinkedIn" | "Bluesky" | "Mastodon" | "dev";
  ICON: "email" | "github" | "linkedin" | "bluesky" | "mastodon" | "dev";
  TEXT: string;
  HREF: string;
}[];
