// http://www.thephonicspage.org/On%20Reading/Resources/NonsenseWordsByType.pdf
export const gameWords = 'troff glon yomp bruss jank fress masp smub zint jeft vusk hipt splect sunt phrist dimp bosp zoft yact spluff drid criff jing strod vept luft splob fesp kemp cesk flact thrund clud nund fect swug ust phropt ceft drast fleff scrim omp drap gleck jift jund chand smed noct pron snid vonk trag nept yuft sclack plusk snaff zamp skob glemp besp fress vosk frep jang unt joct thrag plig hect nund sphob blen jisk yasp bisk glaff treb threck plash thrump prash glap thren gaft vesk yeft thrun thomp ont sask trunt blit jemp phrint namp glap prash'.split(
  ' '
);

// Used for generating usernames
// copied from some random website's list of animals and adjectives
const rawAdjectiveList = `
    Able, Abundant, Accepting, Accommodating, Active, Addictive, Adequate, Aggressive, American, Amazing, Amiable, Amicable, Amusing, Antagonistic, Anxious, Apathetic, Aquatic, Arrogant, Articulate, Artistic, Attentive, Attractive, Authoritative, Awesome,
	Barren, Benevolent, Biodegradable, Blase, Bold, Bonding, Boorish, Bountiful, Brave, Brilliant, Busy,
	Callow, Captious, Caring, Celestial, Chaste, Cheerful, Churlish, Civil, Clean, Clever, Coastal, Cold, Colossal, Combustible, Comfortable, Commercial, Communicative, Compact, Competitive, Compulsive, Confident, Conflicted, Congenial, Conscientious, Conservative, Considerate, Conspicuous, Contemptible, Contiguous, Cooperative, Cordial, Courageous, Courteous, Covetous, Creative, Critical, Crucial, Crude, Culpable, Curious, Current, Curt, Cynical,
	Decent, Decorous, Defensive, Deferential, Deft, Delightful, Demeaning, Demise, Dependable, Destructive, Devious, Devoted, Dictatorial, Diligent, Diminutive, Diplomatic, Discreet, Disdainful, Dishonorable, Disposable, Disrespectful, Distracted, Docile, Dynamic,
	Earnest, Earthy, Ecological, Efficient, Egotistical, Electrifying, Elitist, Empathetic, Endangered, Endemic, Energetic, Enigmatic, Enthusiastic, Esteemed, Estimable, Ethical, Euphoric, Evergreen, Exclusive, Expectant, Explosive, Exquisite, Extravagant, Extrovert, Exuberant,
	Fair, Faithful, Fallow, Falseness, Famous, Fancy, Ferocious, Fertile, Fervent, Fervid, Fibrous, Fierce, Flexible, Focused, Forgiving, Forlorn, Frailty,
	Generous, Genial, Genteel, Gentle, Genuine, Gifted, Gigantic, Glib, Gloomy, Good, Gorgeous, Gracious, Grand, Grateful, Gravity, Green, Grouchy, Guilty, Gusty,
	Happy, Hard-hearted, Healing, Heedless, Helpfulness, Heroic, Honest, Honorable, Hopeful, Hostile, Humane, Humble, Humorous, Hygienic, Hysterical,
	Idealistic, Idolized, Ignoble, Ignorant, Ill-tempered, Impartial, Impolite, Improper, Imprudent, Impudent, Indecent, Indecorous, Indifferent, Indigenous, Industrious, Ingenuous, Innocent, Innovative, Insightful, Insolent, Inspirational, Instructive, Insulting, Intense, Intolerant, Introvert, Intuitive, Inventive, Investigative, Irascible, Irresponsible,
	Jocular, Jolly, Jovial, Joyful, Jubilant, Just, Juvenile,
	Keen, Kind, Kindred, Knowledgeable,
	Liberal, Loving, Loyal,
	Magical, Magnificent, Malicious, Mammoth, Masterful, Meddling, Meritorious, Meticulous, Migratory, Minuscule, Miserable, Mistrustful, Modest, Moral, Mysterious,
	Naive, Nascent, Native, Natural, Nature, Needy, Nefarious,  Negligent, Nice, Noble, Notorious,
	Obedient, Observant, Open, Open-minded, Opinionated, Orderly, Oriented, Original, Outrageous, Outspoken,
	Partial, Passionate, Patient, Patriotic, Perceptive, Personable, Personal, Petulant, Pleasant, Poise, Polite, Popular, Powerful, Prejudicial, Preposterous, Pretentious, Prideful, Principled, Pristine, Prompt, Proper, Punctual, Purposeful,
	Quaint, Quarrelsome, Quick, Quiet, Quirky,
	Radioactive, Rancorous, Rational, Reasonable, Reckless, Refined, Reflective, Reliant, Remarkable, Remorseful, Renewable, Reproductive, Repugnant, Resilient, Resolute, Resourceful, Respectful, Responsible, Responsive, Restorative, Reverent, Rotting, Rude, Ruthless,
	Sadness, Safe, Scornful, Scrumptious, Selfish, Sensible, Sensitive, Sharing, Simple, Sober, Solar, Solemn, Solitary, Soluble, Sour, Spatial, Special, Splendid, Staunch, Stern, Stunning, Successful, Sullen, Superb, Superior, Supportive, Surly, Suspicious, Sweet, Sympathetic,
	Tactful, Temperate, Tenacious, Terrific, Testy, Thoughtful, Thoughtless, Tolerant, Towering, Toxic, Treacherous, Tropical, Trustworthy, Truthful,
	Ultimate, Unethical, Unique, United, Unmannerly, Unrefined, Unsavory, Uplifting, Upright, Uproot, Upstanding,
	Valiant, Veracious, Versatile, Vicious, Vigilant, Vigorous, Villainous, Virtuous, Visible, Vivacious, Vocal, Volatile, Volunteering, Vulnerable,
	Warm, Wary, Waspish, Watchful, Welcoming, Wicked, Wild, Willingness, Winning, Winsome, Wise, Wishy-washy, Wistful, Witty, Woeful, Wonderful, Worldwide, Worrier, Worthwhile, Worthy,
	Yearning, Yielding, Youthful,
    Zany, Zealot, Zealous, Zero-tolerant`;

// https://www.citationmachine.net/resources/grammar-guides/adjectives/positive-negative/
const positiveAdjectiveList = `
	Able
    Abundant
    Above-board
    Accurate
    Achieving
    Adept
    Affordable
    Adaptable
    Amazing
    Ambitious
    Awesome
	Careful
    Caring
    Calm
    Capable
    Certain
    Charming
    Cheerful
    Cheery
    Cherished
    Chic
    Civil
    Clean
    Clever
    Comfortable
    Cooperative
    Cordial
    Creative
    Cute
	Natural
    Naturalistic
    Neat
    New
    Nifty
    Nice
    Notable
    Nourishing
    Novel
    Nurturing
	Tactful
    Talented
    Taxing
    Teachable
    Thankful
    Thoughtful
    Thorough
    Thrifty
    Thrilled
    Thriving
    Timeless
    Tolerant
    Top-notch
    Touching

    Tantalizing
    Tasteful
    Terrific
    Tidy
    Toned
    Tranquil
    Tremendous
    Treasured
    Triumphant
    Trusted
    Trusting
    Trustworthy
    Truthful

	Beloved
    Dapper
    Dazzling
    Excellent
    Expressive
    Faithful
    Flashy
    Forgiving
    Glamorous
    Healing
    Heroic
    Kind-hearted
    Legit
    Loving
    Luxurious
    Optimistic
    Peaceful
    Perfect
    Romantic
    Soothing
    Stunning
    Valuable
	Wonderful
	`;
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
American cow (usacow)
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
Toad
Tortoise
Toucan
Tree frog
Trout
Tuna
Turkey
Turtle
Tyrannosaurus
Usacow
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
Wolfie
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
Zarudny's jird
Zebra duiker
Zempoaltepec deer mouse
Zempoaltépec vole
`;

export const nameWords = {
  adjectives: rawAdjectiveList,
  positiveAdjectives: positiveAdjectiveList,
  nouns: rawNounList,
};
