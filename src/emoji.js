/* Curated word→emoji map for image-association memory (offline, system glyphs).
   Covers common picturable words; abstract words intentionally have none. */
window.EMOJI = {
  /* professions */
  "doctor":"👨‍⚕️","gp":"👨‍⚕️","nurse":"👩‍⚕️","teacher":"👨‍🏫","lecturer":"👨‍🏫","tutor":"👨‍🏫",
  "chef":"👨‍🍳","cook":"👨‍🍳","baker":"👨‍🍳","farmer":"👨‍🌾","gardener":"👨‍🌾","police officer":"👮","police":"👮",
  "firefighter":"👨‍🚒","pilot":"👨‍✈️","flight attendant":"🧑‍✈️","artist":"👨‍🎨","painter":"👨‍🎨","scientist":"👨‍🔬",
  "engineer":"👷","builder":"👷","mechanic":"👨‍🔧","plumber":"🔧","electrician":"💡","judge":"👨‍⚖️","lawyer":"👨‍⚖️",
  "singer":"🧑‍🎤","astronaut":"👨‍🚀","soldier":"💂","guard":"💂","security guard":"💂","detective":"🕵️","dancer":"💃",
  "student":"🧑‍🎓","dentist":"🦷","vet":"🐾","veterinarian":"🐾","photographer":"📷","journalist":"📰","manager":"💼",
  "waiter":"🧑‍🍳","cashier":"💰","librarian":"📚","hairdresser":"💇","tailor":"🧵","cleaner":"🧹","driver":"🚗",
  "bus driver":"🚌","taxi driver":"🚕","carpenter":"🪚","accountant":"🧮","architect":"📐","pharmacist":"💊",
  /* animals */
  "dog":"🐶","cat":"🐱","fish":"🐟","bird":"🐦","horse":"🐴","cow":"🐮","pig":"🐷","sheep":"🐑","goat":"🐐",
  "chicken":"🐔","hen":"🐔","rooster":"🐓","duck":"🦆","rabbit":"🐰","mouse":"🐭","rat":"🐀","lion":"🦁","tiger":"🐯",
  "elephant":"🐘","monkey":"🐵","gorilla":"🦍","bear":"🐻","panda":"🐼","fox":"🦊","wolf":"🐺","deer":"🦌","frog":"🐸",
  "snake":"🐍","turtle":"🐢","tortoise":"🐢","crocodile":"🐊","alligator":"🐊","whale":"🐳","dolphin":"🐬","shark":"🦈",
  "octopus":"🐙","crab":"🦀","lobster":"🦞","shrimp":"🦐","butterfly":"🦋","bee":"🐝","ant":"🐜","spider":"🕷️",
  "snail":"🐌","worm":"🪱","owl":"🦉","eagle":"🦅","parrot":"🦜","penguin":"🐧","swan":"🦢","peacock":"🦚",
  "camel":"🐫","giraffe":"🦒","zebra":"🦓","kangaroo":"🦘","koala":"🐨","hedgehog":"🦔","bat":"🦇","squirrel":"🐿️",
  "dragon":"🐉","dinosaur":"🦕","dove":"🕊️","hippo":"🦛","rhino":"🦏","leopard":"🐆","bull":"🐂",
  /* food & drink */
  "apple":"🍎","banana":"🍌","orange":"🍊","grape":"🍇","grapes":"🍇","strawberry":"🍓","watermelon":"🍉","melon":"🍈",
  "lemon":"🍋","peach":"🍑","cherry":"🍒","pear":"🍐","pineapple":"🍍","coconut":"🥥","mango":"🥭","kiwi":"🥝",
  "tomato":"🍅","carrot":"🥕","corn":"🌽","potato":"🥔","onion":"🧅","garlic":"🧄","mushroom":"🍄","broccoli":"🥦",
  "pepper":"🌶️","cucumber":"🥒","eggplant":"🍆","bread":"🍞","cheese":"🧀","egg":"🥚","meat":"🍖","steak":"🥩",
  "bacon":"🥓","sausage":"🌭","hamburger":"🍔","burger":"🍔","pizza":"🍕","sandwich":"🥪","fries":"🍟","rice":"🍚",
  "noodles":"🍜","pasta":"🍝","spaghetti":"🍝","soup":"🍲","salad":"🥗","sushi":"🍣","cake":"🍰","cookie":"🍪",
  "biscuit":"🍪","chocolate":"🍫","candy":"🍬","sweets":"🍬","ice cream":"🍦","doughnut":"🍩","donut":"🍩","honey":"🍯",
  "popcorn":"🍿","pancake":"🥞","croissant":"🥐","milk":"🥛","coffee":"☕","tea":"🍵","water":"💧","juice":"🧃",
  "wine":"🍷","beer":"🍺","cocktail":"🍸","champagne":"🍾","salt":"🧂","butter":"🧈","nut":"🥜","peanut":"🥜",
  /* nature & weather */
  "sun":"☀️","sunshine":"☀️","moon":"🌙","star":"⭐","cloud":"☁️","rain":"🌧️","snow":"❄️","snowflake":"❄️",
  "snowman":"⛄","wind":"🌬️","storm":"⛈️","thunder":"⚡","lightning":"⚡","rainbow":"🌈","fire":"🔥","flame":"🔥",
  "ice":"🧊","mountain":"⛰️","hill":"⛰️","volcano":"🌋","sea":"🌊","ocean":"🌊","wave":"🌊","beach":"🏖️","coast":"🏖️",
  "desert":"🏜️","island":"🏝️","forest":"🌲","jungle":"🌴","tree":"🌳","plant":"🪴","flower":"🌸","rose":"🌹",
  "sunflower":"🌻","tulip":"🌷","blossom":"🌼","grass":"🌿","leaf":"🍃","clover":"🍀","cactus":"🌵","seedling":"🌱",
  "earth":"🌍","globe":"🌍","world":"🌍","planet":"🪐","comet":"☄️","fog":"🌫️","tornado":"🌪️","rock":"🪨","stone":"🪨",
  /* transport */
  "car":"🚗","taxi":"🚕","cab":"🚕","bus":"🚌","coach":"🚌","lorry":"🚚","truck":"🚚","van":"🚐","ambulance":"🚑",
  "bike":"🚲","bicycle":"🚲","motorcycle":"🏍️","motorbike":"🏍️","scooter":"🛵","train":"🚆","railway":"🚆","tram":"🚊",
  "subway":"🚇","underground":"🚇","metro":"🚇","plane":"✈️","airplane":"✈️","aeroplane":"✈️","flight":"✈️",
  "helicopter":"🚁","rocket":"🚀","ship":"🚢","boat":"⛵","sailboat":"⛵","yacht":"🛥️","ferry":"⛴️","anchor":"⚓",
  "tractor":"🚜","fuel":"⛽","petrol":"⛽","bridge":"🌉","road":"🛣️",
  /* places & buildings */
  "house":"🏠","home":"🏠","building":"🏢","skyscraper":"🏙️","hospital":"🏥","school":"🏫","university":"🏫",
  "bank":"🏦","hotel":"🏨","church":"⛪","mosque":"🕌","temple":"🛕","castle":"🏰","palace":"🏰","factory":"🏭",
  "store":"🏬","shop":"🏪","supermarket":"🏪","office":"🏢","restaurant":"🍽️","cafe":"☕","library":"📚",
  "museum":"🏛️","stadium":"🏟️","farm":"🚜","tent":"⛺","park":"🏞️","garden":"🌷","fountain":"⛲","station":"🚉","airport":"🛫",
  /* home & objects */
  "door":"🚪","window":"🪟","key":"🔑","lock":"🔒","bed":"🛏️","chair":"🪑","sofa":"🛋️","couch":"🛋️","toilet":"🚽",
  "bath":"🛁","bathtub":"🛁","shower":"🚿","lamp":"💡","light":"💡","candle":"🕯️","clock":"🕐","alarm":"⏰",
  "mirror":"🪞","broom":"🧹","soap":"🧼","sponge":"🧽","towel":"🧻","basket":"🧺","umbrella":"☂️","ladder":"🪜",
  "hammer":"🔨","wrench":"🔧","spanner":"🔧","screwdriver":"🪛","saw":"🪚","axe":"🪓","scissors":"✂️","ruler":"📏",
  "pen":"🖊️","pencil":"✏️","brush":"🖌️","crayon":"🖍️","book":"📖","books":"📚","notebook":"📓","newspaper":"📰",
  "telescope":"🔭","microscope":"🔬","battery":"🔋","plug":"🔌","bulb":"💡","magnet":"🧲",
  "gear":"⚙️","gift":"🎁","present":"🎁","balloon":"🎈","box":"📦","parcel":"📦",
  "ticket":"🎫","map":"🗺️","compass":"🧭","bell":"🔔","flag":"🚩","calendar":"📅",
  /* money */
  "money":"💵","cash":"💵","coin":"🪙","dollar":"💵","credit card":"💳","gem":"💎","diamond":"💎","crown":"👑",
  "ring":"💍","gold":"🏅","wallet":"👛","purse":"👛",
  /* electronics */
  "phone":"📱","telephone":"☎️","mobile":"📱","computer":"💻","laptop":"💻","keyboard":"⌨️","printer":"🖨️",
  "camera":"📷","television":"📺","tv":"📺","radio":"📻","headphones":"🎧","microphone":"🎤","speaker":"🔊",
  "watch":"⌚","calculator":"🧮","robot":"🤖","satellite":"🛰️",
  /* body */
  "eye":"👁️","eyes":"👀","ear":"👂","nose":"👃","mouth":"👄","lip":"👄","tongue":"👅","tooth":"🦷","teeth":"🦷",
  "hand":"✋","foot":"🦶","leg":"🦵","arm":"💪","muscle":"💪","brain":"🧠","heart":"❤️","bone":"🦴","blood":"🩸","hair":"💇","baby":"👶",
  /* clothes */
  "shirt":"👕","t-shirt":"👕","dress":"👗","skirt":"👗","jeans":"👖","trousers":"👖","pants":"👖","shorts":"🩳",
  "coat":"🧥","jacket":"🧥","sweater":"🧥","jumper":"🧥","scarf":"🧣","gloves":"🧤","socks":"🧦","shoes":"👟",
  "boots":"🥾","sandals":"👡","heels":"👠","hat":"👒","cap":"🧢","glasses":"👓","sunglasses":"🕶️","tie":"👔",
  "bag":"🎒","backpack":"🎒","handbag":"👜","swimsuit":"👙","bikini":"👙",
  /* sport & leisure & music */
  "football":"⚽","soccer":"⚽","basketball":"🏀","baseball":"⚾","tennis":"🎾","volleyball":"🏐","rugby":"🏉",
  "golf":"⛳","bowling":"🎳","boxing":"🥊","swimming":"🏊","running":"🏃","cycling":"🚴","skiing":"⛷️",
  "snowboarding":"🏂","surfing":"🏄","fishing":"🎣","skating":"⛸️","trophy":"🏆","medal":"🏅","music":"🎵",
  "guitar":"🎸","piano":"🎹","violin":"🎻","trumpet":"🎺","saxophone":"🎷","drum":"🥁","art":"🎨","paint":"🎨",
  "theatre":"🎭","film":"🎬","movie":"🎬","game":"🎮","dice":"🎲","chess":"♟️","puzzle":"🧩","card":"🃏",
  /* misc / science / health */
  "hourglass":"⏳","fireworks":"🎆","ghost":"👻","alien":"👽","skull":"💀","idea":"💡","target":"🎯","mail":"✉️",
  "letter":"✉️","envelope":"✉️","package":"📦","pill":"💊","medicine":"💊","syringe":"💉","injection":"💉",
  "thermometer":"🌡️","dna":"🧬","bandage":"🩹","wheelchair":"♿","drop":"💧","smoke":"💨","explosion":"💥",
  "shield":"🛡️","sword":"⚔️","trash":"🗑️","rubbish":"🗑️","recycle":"♻️","warning":"⚠️"
};
