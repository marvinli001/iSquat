export type Toilet = {
  id: string;
  slug: string;
  name: string;
  district: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  distance: string;
  tags: string[];
  accessNotes: string;
  tone: string;
  photoUrl?: string;
};

export type Review = {
  id: string;
  name: string;
  rating: number;
  date: string;
  body: string;
};

export const districts = [
  "CBD",
  "Waterfront",
  "Ponsonby",
  "Parnell",
  "Orakei",
  "Mt Eden",
  "Epsom",
  "North Shore",
  "Henderson",
  "Newmarket",
  "Howick",
  "Manukau",
  "Albany",
];

export const toilets: Toilet[] = [
  {
    id: "t1",
    slug: "wynyard-wharf-restrooms",
    name: "Wynyard Wharf Restrooms",
    district: "Waterfront",
    address: "63 Jellicoe St, Auckland 1010",
    lat: -36.8436,
    lng: 174.7595,
    rating: 4.8,
    reviewCount: 312,
    distance: "350 m",
    tags: ["24h", "Accessible", "Waterfront"],
    accessNotes:
      "Code needed after 10pm. Ask the kiosk next to the entry gate.",
    tone: "sunset",
  },
  {
    id: "t2",
    slug: "britomart-transit-wc",
    name: "Britomart Transit WC",
    district: "CBD",
    address: "18 Galway St, Auckland 1010",
    lat: -36.8441,
    lng: 174.7687,
    rating: 4.6,
    reviewCount: 198,
    distance: "600 m",
    tags: ["Fast access", "Staffed", "Transit hub"],
    accessNotes: "Entry is beside the ticket hall, open 6am to 11pm.",
    tone: "mango",
  },
  {
    id: "t3",
    slug: "aotea-square-facilities",
    name: "Aotea Square Facilities",
    district: "CBD",
    address: "291 Queen St, Auckland 1010",
    lat: -36.8505,
    lng: 174.7638,
    rating: 4.5,
    reviewCount: 224,
    distance: "1.2 km",
    tags: ["Family", "Baby change", "Near events"],
    accessNotes: "Main doors face the plaza stage, signage is bright orange.",
    tone: "citrus",
  },
  {
    id: "t11",
    slug: "skycity-lobby-restrooms",
    name: "SkyCity Lobby Restrooms",
    district: "CBD",
    address: "90 Federal St, Auckland 1010",
    lat: -36.8492,
    lng: 174.7623,
    rating: 4.4,
    reviewCount: 156,
    distance: "900 m",
    tags: ["24h", "Staffed", "Hotel lobby"],
    accessNotes: "Restrooms are beside the concierge desk on the ground floor.",
    tone: "sunset",
  },
  {
    id: "t12",
    slug: "chancery-lane-restrooms",
    name: "Chancery Lane Restrooms",
    district: "CBD",
    address: "64 Chancery St, Auckland 1010",
    lat: -36.8457,
    lng: 174.7705,
    rating: 4.3,
    reviewCount: 118,
    distance: "1.0 km",
    tags: ["Shopping", "Cafe nearby", "Weekdays"],
    accessNotes: "Find the food court stairs; signage is above the entry.",
    tone: "amber",
  },
  {
    id: "t4",
    slug: "domain-wintergarden-wc",
    name: "Domain Wintergarden WC",
    district: "Parnell",
    address: "Auckland Domain, Park Rd, Auckland 1023",
    lat: -36.8625,
    lng: 174.7753,
    rating: 4.7,
    reviewCount: 176,
    distance: "2.4 km",
    tags: ["Garden walk", "Quiet", "Accessible"],
    accessNotes: "Look for the glasshouse path, toilets are beside the lawn.",
    tone: "apricot",
  },
  {
    id: "t5",
    slug: "mount-eden-summit-wc",
    name: "Mount Eden Summit WC",
    district: "Mt Eden",
    address: "1A View Rd, Auckland 1024",
    lat: -36.8667,
    lng: 174.7646,
    rating: 4.4,
    reviewCount: 109,
    distance: "4.1 km",
    tags: ["Scenic", "Windy", "Trail access"],
    accessNotes: "Bring a jacket, the door swings wide on windy days.",
    tone: "coral",
  },
  {
    id: "t6",
    slug: "takapuna-beach-pavilion",
    name: "Takapuna Beach Pavilion",
    district: "North Shore",
    address: "21 The Strand, Takapuna 0622",
    lat: -36.7939,
    lng: 174.7743,
    rating: 4.9,
    reviewCount: 254,
    distance: "8.5 km",
    tags: ["Beach", "Showers", "Family"],
    accessNotes: "Open 5am to midnight, showers on the west wing.",
    tone: "sherbet",
  },
  {
    id: "t7",
    slug: "cornwall-park-visitor-wc",
    name: "Cornwall Park Visitor WC",
    district: "Epsom",
    address: "R&L Glade, Auckland 1023",
    lat: -36.8963,
    lng: 174.7797,
    rating: 4.6,
    reviewCount: 142,
    distance: "6.3 km",
    tags: ["Visitor center", "Cafe nearby", "Accessible"],
    accessNotes: "Entry behind the visitor desk, staff can open side gate.",
    tone: "amber",
  },
  {
    id: "t8",
    slug: "orakei-basin-boardwalk-wc",
    name: "Orakei Basin Boardwalk WC",
    district: "Orakei",
    address: "Orakei Basin, Auckland 1071",
    lat: -36.8527,
    lng: 174.8324,
    rating: 4.3,
    reviewCount: 87,
    distance: "7.8 km",
    tags: ["Boardwalk", "Jogger friendly", "Quiet"],
    accessNotes: "Follow the boardwalk toward the east dock, signage is small.",
    tone: "rose",
  },
  {
    id: "t9",
    slug: "henderson-falls-trail-wc",
    name: "Henderson Falls Trail WC",
    district: "Henderson",
    address: "Falls Rd, Henderson 0612",
    lat: -36.8612,
    lng: 174.6169,
    rating: 4.2,
    reviewCount: 64,
    distance: "17.2 km",
    tags: ["Trail", "Picnic", "Park"],
    accessNotes: "Located by the picnic tables, door latch is a bit stiff.",
    tone: "fire",
  },
  {
    id: "t10",
    slug: "howick-village-market-wc",
    name: "Howick Village Market WC",
    district: "Howick",
    address: "71 Picton St, Howick 2014",
    lat: -36.9005,
    lng: 174.9249,
    rating: 4.5,
    reviewCount: 91,
    distance: "19.7 km",
    tags: ["Market", "Weekend", "Family"],
    accessNotes: "Follow the market lane to the end, toilets are behind stalls.",
    tone: "lava",
  },
];

export const nearbyToilets = toilets.slice(0, 4);

export const topRatedToilets = [...toilets]
  .sort((a, b) => b.rating - a.rating)
  .slice(0, 10);

export const reviewsBySlug: Record<string, Review[]> = {
  "wynyard-wharf-restrooms": [
    {
      id: "r1",
      name: "Kai",
      rating: 4.8,
      date: "2 days ago",
      body: "Bright, fresh scent, and plenty of stalls. Quick in and out.",
    },
    {
      id: "r2",
      name: "Harper",
      rating: 4.6,
      date: "1 week ago",
      body: "Lines move fast. Lighting is good for a quick touch up.",
    },
  ],
  "takapuna-beach-pavilion": [
    {
      id: "r3",
      name: "Ava",
      rating: 5,
      date: "3 days ago",
      body: "Best beach facilities. The showers are a big win.",
    },
    {
      id: "r4",
      name: "Noah",
      rating: 4.7,
      date: "5 days ago",
      body: "Clean floors and good ventilation even on busy weekends.",
    },
  ],
};

export const defaultReviews: Review[] = [
  {
    id: "r10",
    name: "Rowan",
    rating: 4.4,
    date: "Today",
    body: "Easy to spot and the sinks are stocked with soap.",
  },
  {
    id: "r11",
    name: "Mia",
    rating: 4.3,
    date: "Yesterday",
    body: "A bit busy but still tidy. Floors were dry on my visit.",
  },
  {
    id: "r12",
    name: "Theo",
    rating: 4.2,
    date: "3 days ago",
    body: "Solid option for a quick stop. Could use brighter signage.",
  },
];
