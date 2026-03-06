const CATEGORIES = [
  {
    name: 'Frukt & grönt',
    keywords: [
      'morot', 'morötter', 'äpple', 'äpplen', 'banan', 'bananer', 'tomat', 'tomater',
      'gurka', 'gurkor', 'lök', 'rödlök', 'gullök', 'purjolök', 'potatis', 'broccoli',
      'sallad', 'spenat', 'paprika', 'citron', 'lime', 'apelsin', 'mandarin', 'grapefrukt',
      'vindruvor', 'päron', 'jordgubbar', 'blåbär', 'hallon', 'björnbär', 'avokado',
      'mango', 'ananas', 'melon', 'vattenmelon', 'zucchini', 'blomkål', 'vitkål',
      'rödkål', 'brysselkål', 'selleri', 'majs', 'ärtor', 'bönor', 'linser',
      'ingefära', 'vitlök', 'fänkål', 'rädisa', 'rädisor', 'kiwi', 'persika',
      'nektarin', 'plommon', 'körsbär', 'färsk', 'grönsak', 'frukt',
    ],
  },
  {
    name: 'Mejeri & ägg',
    keywords: [
      'mjölk', 'ost', 'yoghurt', 'smör', 'grädde', 'vispgrädde', 'matlagningsgrädde',
      'crème fraiche', 'creme fraiche', 'ägg', 'kvarg', 'fil', 'filmjölk', 'kefir',
      'mozzarella', 'parmesan', 'ricotta', 'brie', 'cheddar', 'fetaost', 'halloumi',
      'cottage cheese', 'philadelphia', 'mascarpone', 'skyr',
    ],
  },
  {
    name: 'Kött & chark',
    keywords: [
      'kyckling', 'kycklingfilé', 'kycklingbröst', 'kycklinglår', 'nötkött', 'fläsk',
      'fläskfilé', 'fläskkotlett', 'bacon', 'korv', 'falukorv', 'skinka', 'salami',
      'köttfärs', 'lammkött', 'lamm', 'entrecôte', 'biff', 'oxfilé', 'pannbiff',
      'köttbullar', 'prosciutto', 'chorizo', 'rökt', 'chark',
    ],
  },
  {
    name: 'Fisk & skaldjur',
    keywords: [
      'lax', 'torsk', 'räkor', 'tonfisk', 'sill', 'makrill', 'abborre', 'kräftor',
      'hummer', 'musslor', 'bläckfisk', 'sardiner', 'ansjovis', 'röding', 'piggvar',
      'fiskfilé', 'fisk', 'skaldjur', 'gravlax', 'kallrökt',
    ],
  },
  {
    name: 'Bröd & bageri',
    keywords: [
      'bröd', 'knäckebröd', 'bulle', 'bullar', 'croissant', 'bagel', 'pita', 'tortilla',
      'levain', 'surdeg', 'kaka', 'tårta', 'muffins', 'wienerbröd', 'kanelbulle',
      'fralla', 'ciabatta', 'baguette', 'brioche', 'limpa',
    ],
  },
  {
    name: 'Fryst',
    keywords: [
      'glass', 'frysta', 'fryst', 'frysvaror', 'fryspizza', 'frysräkor',
    ],
  },
  {
    name: 'Skafferi',
    keywords: [
      'pasta', 'ris', 'mjöl', 'socker', 'salt', 'peppar', 'olja', 'olivolja', 'rapsolja',
      'vinäger', 'soja', 'sojasås', 'ketchup', 'senap', 'majonnäs', 'honung', 'sylt',
      'nutella', 'jordnötssmör', 'tomatsås', 'buljong', 'krydda', 'kryddor', 'kanel',
      'kardemumma', 'vanilj', 'bakpulver', 'jäst', 'havregryn', 'flingor', 'müsli',
      'konserver', 'kikärtor', 'kidneybönor', 'matvete', 'bulgur', 'couscous', 'quinoa',
      'popcorn', 'chips', 'nötter', 'mandlar', 'cashewnötter', 'valnötter', 'russin',
      'mörk choklad', 'choklad', 'kakao', 'marmelad', 'pesto', 'hummus',
    ],
  },
  {
    name: 'Dryck',
    keywords: [
      'juice', 'läsk', 'vatten', 'kaffe', 'te', 'öl', 'vin', 'cider', 'energidryck',
      'kakao', 'saft', 'smoothie', 'mineralvatten', 'cola', 'fanta', 'sprite',
    ],
  },
  {
    name: 'Hygien & hälsa',
    keywords: [
      'schampo', 'balsam', 'tvål', 'tandkräm', 'tandborste', 'rakblad', 'rakhyvel',
      'deodorant', 'hudkräm', 'solskydd', 'solkräm', 'medicin', 'plåster', 'våtservetter',
      'tamponger', 'bindor', 'blöjor', 'toalettpapper',
    ],
  },
  {
    name: 'Hushåll',
    keywords: [
      'tvättmedel', 'diskmedel', 'diskmaskinspulver', 'hushållspapper', 'sopsäckar',
      'plastpåsar', 'aluminiumfolie', 'bakplåtspapper', 'rengöringsmedel', 'windex',
      'toarullar', 'ljus', 'stearinljus', 'batterier', 'glödlampa',
    ],
  },
]

const OKATEGORISERAD = 'Övrigt'

export function categorize(text) {
  const lower = text.toLowerCase()
  for (const category of CATEGORIES) {
    if (category.keywords.some((kw) => lower.includes(kw))) {
      return category.name
    }
  }
  return OKATEGORISERAD
}

export const CATEGORY_ORDER = [
  ...CATEGORIES.map((c) => c.name),
  OKATEGORISERAD,
]
