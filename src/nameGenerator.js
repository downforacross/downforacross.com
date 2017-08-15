const rawAdjectiveList = `
  	Able, Abundant, Accepting, Accommodating, Active, Addictive, Adequate, Aggressive, Amazing, Amiable, Amicable, Amusing, Antagonistic, Anxious, Anxious, Apathetic, Aquatic, Arrogant, Articulate, Artistic, Attentive, Attractive, Authoritative, Awesome,
	Barren, Benevolent, Biodegradable, Blase, Bold, Bonding, Boorish, Bountiful, Braggart, Brave, Brilliant, Busy, Buzz,
	Callow, Captious, CARING, Celestial, Chaste, Cheerful, Churlish, Civil, Clean, Clever, Coastal, Cold, Colossal, Combustible, Comfortable, Commercial, Communicative, Compact, Competitive, Compulsive, Confident, Conflicted, Congenial, Conscientious, Conservative, Considerate, Conspicuous, Contemptible, Contiguous, COOPERATIVE, Cordial, COURAGEOUS, Courteous, Covetous, Creative, Critical, Critical, Crucial, Crude, Culpable, Curious, Current, Curt, Cynical,
	Decent, Decorous, Defensive, Deferential, Deft, Dejected, Delightful, Demeaning, Demise, Dependable, Deplorable, Depressed, Destructive, Devious, Devoted, Dictatorial, Diligent, Diminutive, Diplomatic, Discreet, Disdainful, Dishonesty, Dishonorable, Disposable, Disrespectful, Distracted, Docile, Downcast, Dynamic,
	Earnest, Earthy, Ecological, Efficient, Egotistical, Electrifying, Elitist, Empathetic, Endangered, Endemic, Energetic, Enigmatic, Enthusiastic, Esteemed, Estimable, Ethical, Euphoric, Evergreen, Exclusive, Expectant, Explosive, Exquisite, Extravagant, Extrovert, Exuberant,
	FAIR, Faithful, Fallow, Falseness, Famous, Fancy, Ferocious, Fertile, Fervent, Fervid, Fibrous, Fierce, Flexible, Focused, Forgiving, Forlorn, Frailty,
	Generous, Genial, Genteel, Gentle, Genuine, Gifted, Gigantic, Glib, Gloomy, Good, Gorgeous, Grace, Gracious, Grand, Grateful, Gravity, Green, Grouchy, Guilty, Guilty, Gusty,
	Happy, Hard-hearted, Healing, Heedless, Helpfulness, Heroic, HONEST, Honorable, Hopeful, Hostile, Humane, Humble, Humorous, Hygienic, Hysterical,
	Idealistic, Idolize, Ignoble, Ignorant, Ill-tempered, Impartial, Impolite, Improper, Imprudent, Impudent, Indecent, Indecorous, Indifference, Indigenous, Industrious, Ingenuous, Innocent, Innovative, Insightful, Insolent, Inspirational, Instructive, Insulting, Intense, Intense, Intense, Intolerant, Introvert, Intuitive, Inventive, Investigative, Irascible, Irresponsible,
	Jaundiced, Jealous, Jealous, Jocular, Jolly, Jovial, Joyful, Jubilant, Just, Juvenile,
	Keen, Kind, Kindred, Knowledgeable,
	Liberal, Listener, Loathsome, Loving, LOYAL,
	Magical, Magnificence, Magnificent, Malevolent, Malicious, Mammoth, Manipulative, Marine, Mastery, Meddling, Meritorious, Meticulous, Migratory, Minuscule, Miserable, Mistrustful, Modest, Moral, Mysterious,
	Naive, Nascent, Native, Natural, Natural, Nature, Needy, Nefarious, Negative, Neglected, Neglectful, Negligent, Nice, Noble, Notorious,
	Obedient, Observant, Open, Open-minded, Opinionated, Oppressive, Orderly, Oriented, Original, Outrageous, Outspoken,
	Parasitic, Partial, Passionate, Patient, Perceptive, Personable, Personal, Petulant, Pleasant, Poise, Polite, Pollutant, Popular, Popular, Powerful, Prejudicial, Preposterous, Pretentious, Prideful, Principled, Pristine, Prompt, Proper, PUNCTUAL, Purposeful,
	Quaint, Quarrelsome, Quick, Quiet, Quiet, Quirky,
	Radioactive, Rancorous, Rational, Reasonable, Reckless, Refined, Reflective, RELIANT, Remarkable, Remorseful, Renewable, Reproductive, Repugnant, Resilient, Resilient, Resolute, Resourceful, Respectful, Responsible, Responsive, Restorative, Reverent, Rotting, Rude, Ruthless,
	Sadness, Safe, Scornful, Scrumptious, Selfish, Sensible, Sensitive, Sharing, Simple, Sober, Solar, Solemn, Solitary, Soluble, Sour, Spatial, Special, Splendid, Splendid, Staunch, Staunch, Stern, Stunning, Successful, Sullen, Superb, Superior, Supportive, Surly, Suspicious, Sweet, Sympathetic,
	Tactful, Taint, Temperate, Temperate, Tenacious, Terrific, Testy, Thoughtful, Thoughtless, Tolerant, Towering, Toxic, Treacherous, Tropical, TRUSTWORTHY, Truthful,
	Ultimate, Ultimate, Uncivil, Uncouth, Undeveloped, Unethical, Unfair, Unique, Unique, United, Unity, Unmannerly, Unrefined, Unsavory, Unworthy, Uplifting, Upright, Uproot, Upstanding,
	Valiant, Veracious, Versatile, Vicious, Vigilant, Vigilant, Vigorous, Vile, Villainous, Virtuous, Visible, Visible, Vivacious, Vocal, Volatile, Volunteering, Vulnerable,
	Warm, Wary, Waspish, Watchful, Welcoming, Wicked, Wild, Willingness, Winning, Winsome, Wise, Wishy-washy, Wistful, Witty, Woeful, Wonderful, Worldwide, Worrier, Worthwhile, Worthy,
	Yearning, Yielding, Yielding, Yourself, Youthful,
  Zany, Zealot, Zealous, Zealous, Zero-tolerant`;

const rawNounList = `
Aardvark
Aardwolf
African buffalo
African elephant
African leopard
Albatross
Alligator
Alpaca
American buffalo (bison)
American robin
Amphibian
Anaconda
Angelfish (freshwater)
Angelfish (marine)
Anglerfish
Ant
Anteater
Antelope
Antlion
Ape
Aphid
Arabian leopard
Arctic fox
Arctic wolf
Armadillo
Arrow crab
Asian black bear
Asp
Ass (donkey)
Baboon
Badger
Bald eagle
Bandicoot
Barnacle
Barracuda
Basilisk
Bass
Bat
Beaked whale
Bear   
Beaver
Bedbug
Bee
Beetle
Bird   
Bison
Blackbird
Black panther
Black widow spider
Blue bird
Blue jay
Blue whale
Boa
Boar (wild pig)
Bobcat
Bobolink
Bonobo
Booby
Box jellyfish
Bovid
Buffalo, African
Buffalo, American (bison)
Bug
Butterfly
Buzzard
Camel
Canid
Cape buffalo
Capybara
Cardinal
Caribou
Carp
Cat   
Catshark
Caterpillar
Catfish
Cattle   
Centipede
Cephalopod
Chameleon
Cheetah
Chickadee
Chicken   
Chimpanzee
Chinchilla
Chipmunk
Cicada
Clam
Clownfish
Cobra
Cockroach
Cod
Condor
Constrictor
Coral
Cougar
Cow
Coyote
Coypu
Crab
Crane
Crane fly
Crawdad
Crayfish
Cricket
Crocodile
Crow
Cuckoo
Damselfly
Deer
Dingo
Dinosaur   
Dog   
Dolphin
Donkey   
Dormouse
Dove
Dragonfly
Dragon
Duck   
Dung beetle
Eagle
Earthworm
Earwig
Echidna
Eel
Egret
Elephant
Elephant seal
Elk
Emu
English pointer
Ermine
Falcon
Ferret
Finch
Firefly
Fish
Flamingo
Flea
Fly
Flyingfish
Fowl
Fox
Frog
Fruit bat
Gamefowl   
Galliform   
Gazelle
Gecko
Gerbil
Giant panda
Giant squid
Gibbon
Gila monster
Giraffe
Goat   
Goldfish
Goose   
Gopher
Gorilla
Grasshopper
Great blue heron
Great white shark
Grizzly bear
Ground shark
Ground sloth
Grouse
Guan   
Guanaco
Guineafowl   
Guinea pig   
Gull
Guppy
Haddock
Halibut
Hammerhead shark
Hamster
Hare
Harrier
Hawk
Hedgehog
Hermit crab
Heron
Herring
Hippopotamus
Hookworm
Hornet
Horse   
Hoverfly
Hummingbird
Humpback whale
Hyena
Iguana
Impala
Irukandji jellyfish
Insect
Jackal
Jaguar
Jay
Jellyfish
Junglefowl
Jacana
Kangaroo
Kangaroo mouse
Kangaroo rat
Kingfisher
Kite
Kiwi
Koala
Koi
Komodo dragon
Krill
Ladybug
Lamprey
Landfowl
Land snail
Lark
Leech
Lemming
Lemur
Leopard
Leopon
Limpet
Lion
Lizard
Llama
Lobster
Locust
Loon
Louse
Lungfish
Lynx
Macaw
Mackerel
Magpie
Mammal
Manatee
Mandrill
Manta ray
Marlin
Marmoset
Marmot
Marsupial
Marten
Mastodon
Meadowlark
Meerkat
Mink
Minnow
Mite
Mockingbird
Mole
Mollusk
Mongoose
Monitor lizard
Monkey
Moose
Mosquito
Moth
Mountain goat
Mouse
Mule
Muskox
Narwhal
Needlefish
Newt
New World quail
Nighthawk
Nightingale
Numbat
Ocelot
Octopus
Okapi
Old World quail
Olingo
Opossum
Orangutan
Orca
Oribi
Ostrich
Otter
Owl
Owl-faced monkey
Ox
Panda
Panther
Panthera hybrid
Parakeet
Parrot
Parrotfish
Partridge
Peacock
Peafowl
Pelican
Penguin
Perch
Peregrine falcon
Pheasant
Pig
Pigeon   
Pike
Pilot whale
Pinniped
Piranha
Planarian
Platypus
Polar bear
Pony
Porcupine
Porpoise
Portuguese man o' war
Possum
Prairie dog
Prawn
Praying mantis
Primate
Ptarmigan
Puffin
Puma
Python
Quail
Quelea
Quokka
Rabbit   
Raccoon
Rainbow trout
Rat
Rattlesnake
Raven
Ray (Batoidea)
Ray (Rajiformes)
Red panda
Reindeer
Reptile
Rhinoceros
Right whale
Roadrunner
Rodent
Rook
Rooster
Roundworm
Saber-toothed cat
Sailfish
Salamander
Salmon
Sawfish
Scale insect
Scallop
Scorpion
Seahorse
Sea lion
Sea slug
Sea snail
Shark   
Sheep   
Shrew
Shrimp
Silkworm
Silverfish
Skink
Skunk
Sloth
Slug
Smelt
Snail
Snake   
Snipe
Snow leopard
Sockeye salmon
Sole
Sparrow
Sperm whale
Spider
Spider monkey
Spoonbill
Squid
Squirrel
Starfish
Star-nosed mole
Steelhead trout
Stingray
Stoat
Stork
Sturgeon
Sugar glider
Swallow
Swan
Swift
Swordfish
Swordtail
Tahr
Takin
Tapir
Tarantula
Tarsier
Tasmanian devil
Termite
Tern
Thrush
Tick
Tiger
Tiger shark
Tiglon
Titi
Toad
Tortoise
Toucan
Trapdoor spider
Tree frog
Trout
Tuna
Turkey  
Turtle
Tyrannosaurus
Urial
Vampire bat
Vampire squid
Vaquita
Vicuña
Viper
Voalavoanala
Vole
Vulture
Wallaby
Walrus
Wasp
Warbler
Waterbuck
Water buffalo
Water chevrotain
Weasel
Whale
Whippet
Whitefish
White rhinoceros
Whooping crane
Wild boar
Wildcat
Wildebeest
Wildfowl
Wolf
Wolverine
Wombat
Wood lemming
Woodchuck
Woodpecker
Woolly dormouse
Woolly hare
Worm
Wren
Xerinae
X-ray fish
Yak
Yellow perch
Zebra
Zebra finch
Zebra shark
Zebu
Zorilla
Zanj sun squirrel
Zaphir's shrew
Zarudny's jird
Zarudny's rock shrew
Zebra duiker
Zempoaltepec deer mouse
Zempoaltépec vole
`;

function capitalize(s) {
  s = s.toLowerCase();
  s = s.substr(0, 1).toUpperCase() + s.substr(1).toLowerCase();
  return s;
}

function isAlpha(s) {
  return /^[a-zA-Z]+$/.test(s);
}


function sanitize(s) {
  s = s.trim();
  s = s.split(' ').filter(isAlpha).map(capitalize).join(' ');
  return s;
}

function adjFilter(s) {
  var len = s.length;
  return len >= 2 && len <= 13;
}

function nounFilter(s) {
  var len = s.length;
  var numWords = s.split(' ').length;
  return numWords <= 2 && len >= 2 && len <= 13;
}

function sample(lst) {
  return lst[Math.floor(Math.random() * lst.length)];
}

const adjectives = rawAdjectiveList.split(',').map(sanitize).filter(adjFilter);
const nouns = rawNounList.split('\n').map(sanitize).filter(nounFilter);

export default function nameGenerator() {
  function f() {
  const adj = sample(adjectives);
  const noun = sample(nouns);
  return adj + ' ' + noun;
  }

  const max_len = 20;

  let s = f();
  while (s.length > max_len) {
    s = f();
  }
  return s;
};
