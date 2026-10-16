export type Portfolio = {
  name: string;
  firstName: string;
  lastName: string;
  title: string;
  username: string;
  dob: string;
  address: string;
  zipCode: string;
  email: string;
  phone: string;
  aboutMe: string;
  profileImage: string;
  cvLink: string;
  social: { linkedin: string; instagram: string; twitter: string };
  education: { startDate: string; endDate: string; degree: string; institution: string; description: string }[];
  experience: { startDate: string; endDate: string; role: string; company: string; location: string; description: string }[];
  skills: { name: string; value: number; category: string | null }[];
  projects: { image: string; video?: string; title: string; link: string; github: string; metadata: string; description: string; tech_stack: string[] }[];
};

// Only this explicit subset crosses into the interactive navbar.
export type NavigationProfile = Pick<Portfolio, "name" | "username" | "profileImage" | "cvLink" | "email"> & {
  links: { label: "LinkedIn" | "Instagram" | "GitHub"; href: string }[];
};

export type PublicPortfolio = Pick<Portfolio, "firstName" | "lastName" | "title" | "aboutMe" | "education" | "experience" | "skills" | "projects"> & {
  navigation: NavigationProfile;
  twitter: string;
};
