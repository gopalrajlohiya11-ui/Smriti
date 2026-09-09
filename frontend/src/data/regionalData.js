/**
 * Smriti Regional NER Database (Seven Sisters + Sikkim)
 * Clinically grounded cultural assets, scenic landscapes, textile motifs, proverbs,
 * and reminiscence therapy content for personalized elderly dementia care.
 */

export const NORTHEAST_STATES = [
  {
    id: 'assam',
    name: 'Assam',
    nativeName: 'অসম',
    tagline: 'Land of the Red River & Lush Blue Hills',
    capital: 'Guwahati / Dispur',
    prominentCity: 'Guwahati, Assam',
    themeColor: '#0E382B',
    accentColor: '#B85026',
    landscapeImage: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=1200&auto=format&fit=crop&q=80',
    bannerGradient: 'from-[#0E382B]/90 via-[#1B4D3E]/80 to-[#2A6650]/80',
    emblemEmoji: '🦏',
    emblemName: 'One-Horned Rhino & Great Hornbill',
    textileMotif: 'Assamese Gamosa & Golden Muga Silk Weave',
    patternStyle: 'gamosa-red-white',
    proverb: '“মোৰ স্মৃতি, মোৰ শক্তি”',
    proverbTranslation: 'Every memory matters... My memory, my strength.',
    greetingNative: 'নমস্কাৰ (Nomoskar)',
    localFoods: ['Khorisa Bamboo Shoot', 'Bhut Jolokia', 'Kaji Nemu', 'Lai Xaak', 'Assam Red Tea'],
    ambientPresets: [
      { id: 'river', title: 'Brahmaputra River Waters', icon: '🌊', type: 'river' },
      { id: 'flute', title: 'Bihu Flute & Pepa Melody', icon: '🪈', type: 'flute' },
      { id: 'birds', title: 'Morning Tea Garden Birds', icon: '🐦', type: 'birds' },
      { id: 'rain', title: 'Gentle Monsoon Rain', icon: '🌧️', type: 'rain' }
    ],
    stories: [
      {
        id: 'assam-bihu',
        title: 'Magh Bihu Feast by the River',
        nativeTitle: 'মাঘ বিহুৰ আনন্দ আৰু মেজিৰ জুঁই',
        summary: 'Warm gatherings around the Bhelaghar harvest hearth with fresh pitha and jaggery sweets.',
        timeHint: 'Harvest Tradition'
      },
      {
        id: 'assam-tea',
        title: 'Morning Walk in the Tea Garden',
        nativeTitle: 'চাহ বাগিচাৰ পুৱাৰ খোজকঢ়া',
        summary: 'Fragrant misty morning breezes sweeping over emerald green tea hills.',
        timeHint: 'Morning Routine'
      }
    ]
  },
  {
    id: 'meghalaya',
    name: 'Meghalaya',
    nativeName: 'মেঘালয়',
    tagline: 'Abode of the Clouds & Living Root Bridges',
    capital: 'Shillong',
    prominentCity: 'Shillong, Meghalaya',
    themeColor: '#0C343D',
    accentColor: '#1E7B85',
    landscapeImage: 'https://images.unsplash.com/photo-1608408843596-b3119736057c?w=1200&auto=format&fit=crop&q=80',
    bannerGradient: 'from-[#0C343D]/90 via-[#164E59]/80 to-[#236875]/80',
    emblemEmoji: '🐆',
    emblemName: 'Clouded Leopard & Pitcher Plant',
    textileMotif: 'Khasi Jainsem & Garo Dakmanda Weave',
    patternStyle: 'khasi-geometric',
    proverb: '“Kynmaw ia la ka thymmei”',
    proverbTranslation: 'Remember your roots, cherish every precious moment.',
    greetingNative: 'Khublei (Welcome)',
    localFoods: ['Lakadong Turmeric', 'Khasi Mandarin Orange', 'Jadoh', 'Bamboo Steam Greens'],
    ambientPresets: [
      { id: 'rain', title: 'Shillong Monsoon Rain', icon: '🌧️', type: 'rain' },
      { id: 'wind', title: 'Pine Hill Mountain Breeze', icon: '🌲', type: 'wind' },
      { id: 'river', title: 'Umiam Lake Ripples', icon: '🌊', type: 'river' },
      { id: 'birds', title: 'Khasi Valley Birds', icon: '🐦', type: 'birds' }
    ],
    stories: [
      {
        id: 'meghalaya-umiam',
        title: 'Autumn Breeze over Umiam Lake',
        nativeTitle: 'Autumn Memories at Umiam Lake',
        summary: 'Cool mountain mist drifting over pine-fringed crystalline waters.',
        timeHint: 'Peaceful Afternoon'
      },
      {
        id: 'meghalaya-orchids',
        title: 'Blooming Wild Orchids in the Hills',
        nativeTitle: 'Shillong Orchid Trails',
        summary: 'Walking through quiet trails lined with vibrant purple and gold blooms.',
        timeHint: 'Nature Stroll'
      }
    ]
  },
  {
    id: 'arunachal',
    name: 'Arunachal Pradesh',
    nativeName: 'অৰুণাচল প্ৰদেশ',
    tagline: 'Land of the Dawn-Lit Mountains & Snowpeaks',
    capital: 'Itanagar',
    prominentCity: 'Tawang, Arunachal Pradesh',
    themeColor: '#1E2F23',
    accentColor: '#C46820',
    landscapeImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&auto=format&fit=crop&q=80',
    bannerGradient: 'from-[#1E2F23]/90 via-[#2F4A37]/80 to-[#3F624A]/80',
    emblemEmoji: '🦅',
    emblemName: 'Great Hornbill & Mithun',
    textileMotif: 'Monpa & Apatani Diamond Weave',
    patternStyle: 'apatani-diamond',
    proverb: '“Where the first dawn awakens hope and clear thoughts”',
    proverbTranslation: 'Every morning brings fresh clarity and peace.',
    greetingNative: 'Tashi Delek (Blessings)',
    localFoods: ['Zan Millet Porridge', 'Tender Khorisa', 'Smoked Herbal Tea', 'Mountain Apples'],
    ambientPresets: [
      { id: 'wind', title: 'High Alpine Mountain Wind', icon: '🏔️', type: 'wind' },
      { id: 'flute', title: 'Monastery Morning Chimes', icon: '🔔', type: 'flute' },
      { id: 'river', title: 'Kameng River Rapids', icon: '🌊', type: 'river' },
      { id: 'birds', title: 'Himalayan Forest Birds', icon: '🐦', type: 'birds' }
    ],
    stories: [
      {
        id: 'arunachal-tawang',
        title: 'First Rays of Sun Over Tawang',
        nativeTitle: 'Dawn over the Monastery Hills',
        summary: 'Golden morning light touching pristine snow-capped mountain peaks.',
        timeHint: 'Morning Radiance'
      }
    ]
  },
  {
    id: 'manipur',
    name: 'Manipur',
    nativeName: 'মণিপুৰ / ꯃꯅꯤꯄꯨꯔ',
    tagline: 'Jeweled Valley of Floating Phumdi Islands',
    capital: 'Imphal',
    prominentCity: 'Imphal, Manipur',
    themeColor: '#1C3144',
    accentColor: '#D00000',
    landscapeImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
    bannerGradient: 'from-[#1C3144]/90 via-[#264660]/80 to-[#335C7D]/80',
    emblemEmoji: '🦌',
    emblemName: 'Sangai Dancing Deer & Siroi Lily',
    textileMotif: 'Manipuri Phanek & Temple Border Weave',
    patternStyle: 'phanek-stripe',
    proverb: '“Nungshi Lipun – The Sacred Thread of Remembrance”',
    proverbTranslation: 'Love binds our cherished family memories together.',
    greetingNative: 'Khurumjari (Respectful Greeting)',
    localFoods: ['Chak-Hao Black Rice', 'Kangsoi Vegetable Stew', 'Smoked Fish', 'Heikru'],
    ambientPresets: [
      { id: 'river', title: 'Loktak Lake Water Flow', icon: '🛶', type: 'river' },
      { id: 'flute', title: 'Traditional Pena String Melody', icon: '🪕', type: 'flute' },
      { id: 'birds', title: 'Keibul Lamjao Sanctuary Birds', icon: '🦚', type: 'birds' },
      { id: 'rain', title: 'Gentle Valley Rain', icon: '🌧️', type: 'rain' }
    ],
    stories: [
      {
        id: 'manipur-loktak',
        title: 'Canoeing by Loktak Floating Islands',
        nativeTitle: 'Evening Boating on Loktak Lake',
        summary: 'Drifting gently along calm waters surrounded by blooming lotus flowers.',
        timeHint: 'Evening Reflection'
      }
    ]
  },
  {
    id: 'mizoram',
    name: 'Mizoram',
    nativeName: 'Mizoram',
    tagline: 'Land of Rolling Blue Hills & Evergreen Bamboo',
    capital: 'Aizawl',
    prominentCity: 'Aizawl, Mizoram',
    themeColor: '#1B3B2B',
    accentColor: '#D97706',
    landscapeImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&auto=format&fit=crop&q=80',
    bannerGradient: 'from-[#1B3B2B]/90 via-[#25523D]/80 to-[#336B50]/80',
    emblemEmoji: '🌾',
    emblemName: 'Mrs. Hume’s Pheasant & Serow',
    textileMotif: 'Puanchei Geometric Red-Black Weave',
    patternStyle: 'puanchei-grid',
    proverb: '“Hriat rengna hi rohlubik a ni”',
    proverbTranslation: 'Memories of loved ones are our greatest treasure.',
    greetingNative: 'Chibai (Warm Welcome)',
    localFoods: ['Bai Vegetable Stew', 'Bamboo Shoot', 'Sawhchiar Rice', 'Wild Mountain Honey'],
    ambientPresets: [
      { id: 'wind', title: 'Aizawl Hilltop Mountain Wind', icon: '⛰️', type: 'wind' },
      { id: 'flute', title: 'Bamboo Wind Chimes & Flute', icon: '🎋', type: 'flute' },
      { id: 'birds', title: 'Reiek Peak Morning Birds', icon: '🐦', type: 'birds' },
      { id: 'rain', title: 'Blue Mountain Mist & Rain', icon: '🌧️', type: 'rain' }
    ],
    stories: [
      {
        id: 'mizo-hills',
        title: 'Sunset over the Aizawl Blue Hills',
        nativeTitle: 'Sunset from the Hilltop Porch',
        summary: 'Watching the purple and orange sky descend over cascading valleys.',
        timeHint: 'Sunset Calm'
      }
    ]
  },
  {
    id: 'nagaland',
    name: 'Nagaland',
    nativeName: 'Nagaland',
    tagline: 'Land of Vibrant Festivals & Dzukou Valleys',
    capital: 'Kohima',
    prominentCity: 'Kohima, Nagaland',
    themeColor: '#2B1E1A',
    accentColor: '#B91C1C',
    landscapeImage: 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=1200&auto=format&fit=crop&q=80',
    bannerGradient: 'from-[#2B1E1A]/90 via-[#422C26]/80 to-[#5C3C34]/80',
    emblemEmoji: '🪶',
    emblemName: 'Blyth’s Tragopan & Hornbill',
    textileMotif: 'Tsungkotepsu Traditional Warrior Shawl Weave',
    patternStyle: 'naga-shawl',
    proverb: '“Every hill carries the echoes of ancient courage and memory”',
    proverbTranslation: 'Strength flows from knowing where we come from.',
    greetingNative: 'Aro! (Friendly Greeting)',
    localFoods: ['Smoked Bamboo Meat', 'Fermented Akhuni', 'Raja Mircha', 'Steamed Rice Cakes'],
    ambientPresets: [
      { id: 'wind', title: 'Dzukou Valley Lily Breeze', icon: '🌸', type: 'wind' },
      { id: 'flute', title: 'Log Drum & Traditional Flute', icon: '🥁', type: 'flute' },
      { id: 'birds', title: 'Japfu Peak Forest Birds', icon: '🐦', type: 'birds' },
      { id: 'rain', title: 'Terrace Farm Morning Rain', icon: '🌧️', type: 'rain' }
    ],
    stories: [
      {
        id: 'nagaland-dzukou',
        title: 'Flowers in the Dzukou Valley',
        nativeTitle: 'A Walk in Dzukou Valley',
        summary: 'Endless rolling emerald hills covered in blooming seasonal lilies.',
        timeHint: 'Nature Walk'
      }
    ]
  },
  {
    id: 'tripura',
    name: 'Tripura',
    nativeName: 'ত্ৰিপুৰা',
    tagline: 'Land of Palaces, Lakes & Serene Bamboo Forests',
    capital: 'Agartala',
    prominentCity: 'Agartala, Tripura',
    themeColor: '#202D3A',
    accentColor: '#D97706',
    landscapeImage: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1200&auto=format&fit=crop&q=80',
    bannerGradient: 'from-[#202D3A]/90 via-[#2B3E4F]/80 to-[#3B546B]/80',
    emblemEmoji: '🏛️',
    emblemName: 'Phayre’s Langur & Queen Pineapple',
    textileMotif: 'Rignai & Risa Royal Handloom Weave',
    patternStyle: 'rignai-pattern',
    proverb: '“স্মৃতি হলো মনের আলো”',
    proverbTranslation: 'Memories are the inner light that guides our days.',
    greetingNative: 'Nomoshkar (Greetings)',
    localFoods: ['Tripura Queen Pineapple', 'Mui Borok', 'Mosdeng Serma', 'Bamboo Shoot'],
    ambientPresets: [
      { id: 'river', title: 'Neermahal Palace Lake Water', icon: '🛶', type: 'river' },
      { id: 'flute', title: 'Tripura Bamboo Flute', icon: '🪈', type: 'flute' },
      { id: 'birds', title: 'Rubber Garden Morning Birds', icon: '🐦', type: 'birds' },
      { id: 'rain', title: 'Gentle Afternoon Shower', icon: '🌧️', type: 'rain' }
    ],
    stories: [
      {
        id: 'tripura-palace',
        title: 'Courtyard Stroll at Ujjayanta Palace',
        nativeTitle: 'Palace Garden Morning Walk',
        summary: 'Fountains and marble corridors lit by gentle morning sunlight.',
        timeHint: 'Morning Stroll'
      }
    ]
  },
  {
    id: 'sikkim',
    name: 'Sikkim',
    nativeName: 'सिक्किम',
    tagline: 'Valley of Orchids & Guardian Mount Kanchenjunga',
    capital: 'Gangtok',
    prominentCity: 'Gangtok, Sikkim',
    themeColor: '#1A2E2B',
    accentColor: '#059669',
    landscapeImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop&q=80',
    bannerGradient: 'from-[#1A2E2B]/90 via-[#24423E]/80 to-[#325C57]/80',
    emblemEmoji: '🐼',
    emblemName: 'Red Panda & Noble Dendrobium Orchid',
    textileMotif: 'Lepcha & Bhutia Golden Brocade Weave',
    patternStyle: 'lepcha-brocade',
    proverb: '“Kanchenjunga stands as our eternal guardian of peace”',
    proverbTranslation: 'Stand tall with calm thoughts and deep family roots.',
    greetingNative: 'Namaste / Kuzuzangpo',
    localFoods: ['Sikkim Sweet Mandarin', 'Gundruk Soup', 'Steamed Dumplings', 'Chhurpi Cheese'],
    ambientPresets: [
      { id: 'wind', title: 'Kanchenjunga Alpine Wind', icon: '🏔️', type: 'wind' },
      { id: 'flute', title: 'Himalayan Singing Bowls & Flute', icon: '🧘', type: 'flute' },
      { id: 'river', title: 'Teesta River Glacial Flow', icon: '🌊', type: 'river' },
      { id: 'birds', title: 'Rhododendron Valley Birds', icon: '🐦', type: 'birds' }
    ],
    stories: [
      {
        id: 'sikkim-kanchenjunga',
        title: 'Golden Dawn over Mount Kanchenjunga',
        nativeTitle: 'Sunrise at Kanchenjunga Viewpoint',
        summary: 'Pristine white peaks turning into brilliant gold as morning breaks.',
        timeHint: 'Dawn Meditation'
      }
    ]
  }
];

export const DEFAULT_STATE = NORTHEAST_STATES[0]; // Assam

export function getRegionById(stateId) {
  if (!stateId) return DEFAULT_STATE;
  const found = NORTHEAST_STATES.find(s => s.id.toLowerCase() === stateId.toLowerCase());
  return found || DEFAULT_STATE;
}
