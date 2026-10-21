/* 英义猜词 question bank + answer judging (edef.html).
   Every line was written and checked by hand for one word of the 生词本, NOT generated
   from the dictionary: plain English easier than the target, no target word or obvious
   derivative in the definition, one sense per definition, matched to the Chinese shown.
   Words without a reviewed line are not asked (the page shows how many).

   Line format (fields separated by |, per-definition alternatives by ~):
     word | pos | 中文 (per definition) | definition 1 ~ definition 2 | context with ___ (per definition)
          | reviewed synonyms that also fit (comma list, per definition) | other accepted forms of the target
   "a=b" means notebook entry a is asked through b's line (persuaded → persuade).
   The synonyms list is the ONLY way a different word counts as 意思符合: spelling
   similarity never does. */
(function (scope) {
  'use strict';
  if (scope.IELTSEdef) return;
  const BANK = `
perception|n|看法；认识|The way people think about or understand someone or something.~The idea or opinion that people form based on how something seems.|Social media can change people's ___ of success.~Public ___ of the police has improved.|view,image,impression,understanding|perceptions
perceptions=perception
persuade|v|说服|To make someone agree to do something by giving them good reasons.~To get someone to believe or do something by talking to them.|My friend tried to ___ me to keep practising speaking.|convince|persuades,persuaded,persuading
persuaded=persuade
froze|v|（突然）僵住（freeze 的过去式）|Suddenly stopped moving or became unable to speak, for example from fear (past tense).~Became completely still for a moment and could not act (past tense).|When the examiner asked a difficult question, I ___.||freeze,frozen
herbalist|n|草药师|A person who uses plants to treat illness.~Someone who grows, sells or uses medicinal plants as a treatment.|A traditional ___ may recommend ginger tea for a cold.||herbalists
witch|n|女巫|A woman in stories who has magic powers, often used to do bad things.~In fairy tales, an old woman who casts spells.|The child thought the old woman was a ___.|sorceress|witches
ink|n|墨水|The coloured liquid used in pens and printers for writing or printing.~The liquid inside a pen that leaves marks on paper.|The printer has run out of black ___.||
speed|n|速度|How fast something moves or happens.~The rate at which someone or something travels.|The train was travelling at high ___.|pace,velocity|speeds
bees|n|蜜蜂|Small flying insects that make honey and can sting.~Insects that live in large groups and carry pollen between flowers.|___ communicate with each other by dancing.||bee
unreliable|adj|不可靠的|Not able to be trusted or depended on.~Likely to fail or to give wrong information.|Some websites are an ___ source of information.|untrustworthy,undependable|
standardization|n|标准化|The process of making things the same by following one fixed set of rules.~Making products or methods follow a common model so that they are all alike.|Product ___ makes parts easy to replace.||standardisation
accessible|adj|易进入的；可获得的|Easy to reach, enter or use.~Possible for people to get or use, including people with disabilities.|The building is fully ___ to wheelchair users.|reachable~available,obtainable|
packed|adj|很满的；拥挤的|Full of people or things, with little empty room.|The concert hall was ___ with fans.|crowded,full,crammed,jammed|
itinerary|n|行程|A detailed plan of a journey, showing places and times.~A list of the places you will visit on a trip.|The travel agent sent us the ___ for the tour.|schedule|itineraries
anonymous|adj|匿名的|Not giving or known by name.~Done or written by someone whose name is kept secret.|The money was given by an ___ donor.|unnamed,unidentified|
donor|n|捐赠者|A person who gives money or goods to help an organisation.~Someone who gives blood or a body organ to help another person.|An unnamed ___ gave £1 million to the hospital.|contributor,benefactor,giver|donors
patron|n|赞助人；支持者|A person who gives money or support to an artist, charity or organisation.~Someone who supports the arts with money.|She was a generous ___ of the arts.|sponsor,benefactor,supporter,backer|patrons
pledge|n|承诺；保证|A serious promise to do or give something.~A formal promise, often of money.|The government made a ___ to cut taxes.|promise,commitment,vow,undertaking|pledges
alumni|n|校友|People who used to study at a particular school or university.~Former students of a college.|The university asked its ___ for donations.|graduates,former students|alumnus
objective|n|目标|Something you plan to achieve.~An aim that you are working towards.|The main ___ of the course is to improve writing skills.|goal,aim,target,purpose|objectives
current|adj|当前的|Happening or existing now.~Belonging to the present time.|What is your ___ address?|present,existing|
disorder|n|障碍；（身心）疾病|An illness that stops part of the body or mind from working normally.~A medical condition affecting the body or the mind.|She suffers from a sleep ___.|illness,condition,disease|disorders
handle|v|处理；应对|To deal with a situation or problem.~To take action to manage something difficult.|She can ___ stress very well.|deal with,manage,cope with,tackle|handles,handled,handling
anxious|adj|焦虑的|Worried and nervous about something that might happen.~Feeling uneasy about the future.|I always feel ___ before exams.|worried,nervous,uneasy,apprehensive,concerned|
familiarity|n|熟悉|Good knowledge of something because you have seen or used it often.~The state of knowing something well.|His ___ with the local area made him a good guide.|knowledge,acquaintance|
mitigate|v|缓解；降低|To make something bad less serious or harmful.~To reduce the effects of a problem.|Companies must take steps to ___ the risk.|reduce,lessen,alleviate,ease,minimise,minimize|mitigates,mitigated,mitigating
deployment|n|部署；投入使用|The act of putting something, such as a system or equipment, into use.~Bringing equipment or people into action for a purpose.|The ___ of AI systems needs careful planning.|rollout|
device|n|设备；装置|A machine or tool made for a particular purpose.~A piece of equipment, especially an electronic one.|A smartphone is a useful electronic ___.|gadget,appliance,tool,instrument|devices
movements|n|动作|Changes in the position of the body or part of it.~Acts of changing place or position.|Dancers practise their ___ in front of a mirror.|motions|movement
soundtracks|n|（电影/游戏）配乐|The recorded music that is played in films or games.~Collections of music that go with a movie.|Film ___ are often sold as albums.|scores|soundtrack
lasers|n|激光（器）|Devices that produce a very narrow, strong beam of light.~Narrow beams of powerful light used in surgery or for cutting.|Surgeons now use ___ in eye operations.||laser
marathons|n|马拉松|Running races of about 42 kilometres.~Long-distance running events on roads.|He has run three ___ this year.||marathon
encourage|v|鼓励|To give someone support or confidence to do something.~To make someone more likely to do something.|Teachers should ___ students to ask questions.|motivate,inspire,urge|encourages,encouraged,encouraging
achievement|n|成就|Something good that you succeed in doing after a lot of effort.~A success gained through hard work.|Passing the exam gave her a sense of ___.|accomplishment,success,attainment|achievements
confidence|n|自信|The feeling that you can do things well.~Belief in your own abilities.|Speaking practice helps to build ___.|self-confidence,self-assurance,self-belief|
flexibility|n|灵活性|The ability to change easily to suit new situations.~Being able to adapt plans or ways of working easily.|Working from home gives employees more ___.|adaptability|
paraphrase|v|改述；换种说法|To express what someone has said or written using different words.~To say something again in another way.|In the exam, try to ___ the question in your introduction.|rephrase,reword|paraphrases,paraphrased,paraphrasing
collocation|n|（词语）搭配|A combination of words that are often used together, such as "make a decision".~A natural pairing of words in a language.|"Heavy rain" is a common ___.||collocations
procurement|n|采购|The process of buying goods or services for an organisation.~Getting supplies, especially for a government or a company.|The company changed its technology ___ process.|purchasing,acquisition|
monitor|v|监控；监测|To watch or check something carefully over a period of time.~To keep track of how something develops.|Managers need to ___ how staff use AI at work.|track,observe,supervise,check|monitors,monitored,monitoring
bias|n|偏见；偏向|An unfair preference for or against someone or something.~A tendency to favour one side unfairly.|Algorithmic ___ can lead to unfair decisions.|prejudice,partiality|biases
hallucination|n|（AI）幻觉|False information that an AI system makes up but presents as if it were true.~An answer from a chatbot that sounds real but is invented.|Developers are trying to stop chatbots producing ___s.||hallucinations
distortion|n|扭曲；失真|A change that makes something look or sound different from how it really is.~The act of twisting facts so that they are no longer true.|There was some ___ in the sound from the speakers.~The article was a ___ of what really happened.|~misrepresentation|distortions
frame|n|框；框架|A border of wood or metal that holds a picture, mirror or window.~The main structure that supports something such as a building or a bicycle.|She put the photo in a silver ___.~The bicycle has a light aluminium ___.|~framework,structure,skeleton|frames
conquer|v|克服；征服|To succeed in dealing with a fear or problem.~To take control of a country or people by force.|You must ___ your fear of public speaking.~The Romans tried to ___ Britain.|overcome,defeat,beat~invade,defeat,occupy|conquers,conquered,conquering
vintage|adj|老式而经典的|Old but of high quality and typical of a period in the past.~(Of clothes, cars etc.) made in the past and valued for their style.|She loves buying ___ clothes from the 1970s.|retro,classic|
intuition|n|直觉|The ability to know something from feelings rather than facts or reasoning.~A feeling that something is true without being able to explain why.|My ___ told me something was wrong.|instinct,hunch,gut feeling|
camouflage|n|伪装|Colours or patterns that help an animal or object hide by matching its surroundings.~A way of hiding something by making it look like what is around it.|The insect's green colour acts as ___ among the leaves.|disguise|
domestic|adj|国内的~家庭的；家用的|Inside one country, not international.~Relating to the home or the family.|___ flights are cheaper than international ones.~Most ___ accidents happen in the kitchen.|national,internal,home~household,family|
pharmacies|n|药店；药房|Shops where medicines are prepared and sold.~Places where you can get the drugs a doctor has prescribed.|Most ___ in town close at 6 p.m.|chemists,drugstores,chemist's|pharmacy
beneath|prep|在……下面|In a lower position than something, directly under it.~Below something, often covered by it.|The cat was hiding ___ the table.|under,below,underneath|
deficiency|n|缺乏；不足|A lack of something that is needed, especially in the diet.~The state of not having enough of something.|Vitamin D ___ is common in winter.|shortage,lack,insufficiency|deficiencies
spacious|adj|宽敞的|Large inside, with lots of room to move around.~Having a lot of room.|The hotel room was bright and ___.|roomy,large,big,commodious|
spoilage|n|（食物）变质|The process of food going bad so that it cannot be eaten.~Waste caused when goods rot or are damaged.|Refrigeration reduces food ___.|decay,rotting,deterioration|
fungus|n|真菌|A living thing such as a mushroom or mould that grows on plants or rotting matter.~An organism that is not a plant and spreads by tiny spores.|A ___ was growing on the old tree.|mould,mold|fungi
cast|n|演员阵容|All the actors in a film or play.~The group of performers in a show.|The film has a famous ___.|line-up|casts
compensate|v|弥补~赔偿|To make up for something bad by providing something good.~To pay someone money because they have suffered loss or injury.|Nothing can ___ for the loss of a loved one.~The airline will ___ passengers for the delay.|make up,offset,counterbalance~reimburse,repay,recompense|compensates,compensated,compensating
compensates=compensate
discern|v|辨别；看出|To notice or understand something that is not obvious.~To be able to see or recognise something, but only with difficulty.|It was hard to ___ any difference between the two copies.|detect,perceive,distinguish,make out,recognise,recognize|discerns,discerned
cello|n|大提琴|A large stringed instrument held between the knees and played with a bow.~A musical instrument like a big violin that you play sitting down.|She plays the ___ in the school orchestra.|violoncello|cellos
distinguished|adj|杰出的；卓著的|Very successful and respected for your work.~Famous and admired for great achievements.|He had a long and ___ career as a scientist.|eminent,prominent,illustrious,renowned,notable,famous|
parasites|n|寄生生物|Animals or plants that live on or in another living thing and get food from it.~Organisms that harm their hosts by feeding on them.|Fleas and ticks are common ___ of dogs.||parasite
pirate|n|海盗|A person who attacks and robs ships at sea.~Someone who steals from ships on the ocean.|The ___ buried his treasure on an island.|buccaneer|pirates
devoted|adj|深爱的；投入的|Loving or caring about someone very much and giving them a lot of attention.~Giving a lot of time and energy to something.|She is a ___ mother.~He is ___ to his work.|loving,loyal,faithful~dedicated,committed|
intrigue|v|激起……的兴趣|To make someone very interested or curious.~To arouse someone's curiosity, often because something is strange.|The old empty house began to ___ the children.|fascinate,interest|intrigues,intrigued,intriguing
industriously|adv|勤奋地|In a way that shows hard and steady work.~Working hard for a long time.|The students worked ___ all afternoon.|diligently,hard,assiduously|
progressively|adv|逐渐地|Gradually, increasing or developing over time.~Step by step, more and more.|The pain became ___ worse.|gradually,increasingly,steadily|
overwhelmingly|adv|压倒性地；绝大多数地|By a very large amount or majority.~Very strongly or almost completely.|Voters ___ supported the plan.|massively|
collaborative|adj|合作的|Involving people working together to achieve something.~Done by two or more people or groups jointly.|The book was a ___ project between two authors.|cooperative,co-operative,joint,collective|
intensity|n|强烈；强度|The quality of being very strong or extreme.~The strength of something such as light, sound or feelings.|The ___ of the storm surprised everyone.|strength,force,power|
unanimous|adj|全体一致的|Agreed by everyone in a group.~(Of a decision) supported by all the people involved.|The committee made a ___ decision.|united,undivided|
tailor|n|裁缝|A person whose job is to make or repair clothes, especially men's suits.~Someone who makes clothes to fit individual customers.|He had his suit made by a ___.|dressmaker,seamstress|tailors
disturb|v|打扰；扰乱|To interrupt someone when they are trying to work, sleep etc.~To make someone feel worried or upset.|Please do not ___ me while I am studying.|bother,interrupt,trouble~upset,worry,trouble|disturbs,disturbed,disturbing
unhygienic|adj|不卫生的|Dirty and likely to spread disease.~Not clean enough to be healthy.|The kitchen was found to be ___.|unsanitary,insanitary,dirty,unclean|
eradicate|v|根除|To get rid of something bad completely.~To destroy something so that it no longer exists.|The aim is to ___ malaria from the region.|eliminate,wipe out,stamp out,abolish,remove|eradicates,eradicated,eradicating
piracy|n|盗版~海盗行为|The illegal copying and selling of films, music or software.~The crime of attacking and robbing ships at sea.|Online ___ costs the music industry millions.~___ is still a problem off the coast of Somalia.|bootlegging~|
culprits|n|罪魁祸首；犯人|People who have done something wrong or illegal.~The main causes of a problem.|The police finally caught the ___.~Sugar and salt are the main ___ in an unhealthy diet.|offenders,wrongdoers,perpetrators,criminals~causes|culprit
inquiry|n|调查~询问|An official process to find out the facts about something.~A question asked to get information.|The government set up an ___ into the accident.~We received an ___ about prices.|investigation,probe~question,query|inquiries
facade|n|（建筑物）正面~假象；外表|The front of a building.~A false appearance that hides how things really are.|The hotel has a beautiful stone ___.~Behind her cheerful ___, she was very worried.|front,frontage,exterior~front,mask,veneer|façade,facades
consequently|adv|因此；结果|As a result.~Because of this.|He didn't study. ___, he failed the exam.|therefore,thus,hence,as a result,accordingly|
meditation|n|冥想|The practice of sitting quietly and focusing your mind in order to relax.~Thinking deeply in silence, often for religious reasons.|Daily ___ can reduce stress.|contemplation,reflection|
religious|adj|宗教的；虔诚的|Relating to belief in a god or gods.~Having a strong belief in a god and following its rules.|Christmas is an important ___ festival.~Her parents are very ___.|spiritual,sacred~devout,pious|
conviction|n|坚信~定罪|A strong belief or opinion.~A decision by a court that someone is guilty of a crime.|She spoke with great ___.~He had a previous ___ for theft.|belief,certainty~|convictions
conspiracy|n|阴谋|A secret plan by a group to do something harmful or illegal.~Secret planning by several people to do something wrong.|They were accused of a ___ to steal money.|plot,scheme|conspiracies
reputation|n|名声；声誉|The opinion that people generally have about someone or something.~How much people respect or admire someone, based on past behaviour.|The restaurant has a good ___.|name,standing,image,status|reputations
astonishing|adj|令人惊讶的|Very surprising.~So surprising that it is difficult to believe.|She made ___ progress in just three months.|amazing,astounding,remarkable,incredible,stunning,staggering,surprising|
dimension|n|方面~尺寸|A part or feature of a situation.~A measurement of length, width or height.|The internet added a new ___ to education.~What are the ___s of the room?|aspect,facet,element~measurement,size|dimensions
moisture|n|水分；湿气|Small amounts of water in the air, in a substance or on a surface.~Wetness, especially in the air or the soil.|Plants take ___ from the soil.|dampness,humidity,water,wetness|
cabins|n|小木屋~（船上的）客舱|Small wooden houses, especially in a forest or the mountains.~Small rooms on a ship where people sleep.|We stayed in log ___ by the lake.~The ship has 200 passenger ___.|huts,lodges,chalets~berths|cabin
tools|n|工具|Things you hold in your hand to help you do a particular job.~Pieces of equipment such as hammers or spanners.|The mechanic keeps his ___ in a metal box.|implements,instruments,equipment|tool
marble|n|大理石|A hard, smooth stone used for buildings and statues.~A type of stone that can be polished and is often white with coloured lines.|The statue is made of white ___.||
conscious|adj|清醒的~意识到的|Awake and able to understand what is happening around you.~Noticing or knowing about something.|The patient was still ___ after the accident.~She was ___ of being watched.|awake~aware|
frightening|adj|令人恐惧的|Making you feel afraid.~Causing fear or alarm.|It was a ___ experience.|scary,terrifying,alarming,frightful|
genre|n|（文艺作品的）类型；体裁|A particular type of art, music, film or writing.~A category of artistic work with its own style.|Science fiction is my favourite ___.|category,type,style,kind|genres
bizarre|adj|怪异的；离奇的|Very strange and unusual.~Odd in a way that is hard to explain.|He told a ___ story about meeting a ghost.|strange,weird,odd,peculiar,outlandish|
revitalise|v|使恢复活力|To give new life or energy to something.~To make something strong, active or successful again.|The plan aims to ___ the city centre.|revive,regenerate,rejuvenate,renew|revitalised,revitalising,revitalises
poet|n|诗人|A person who writes poems.~Someone whose art is writing verse.|Shakespeare was a famous ___ and playwright.||poets
shirt|n|衬衫|A piece of clothing for the upper body, with sleeves, a collar and buttons down the front.|He wore a white ___ and a tie.||shirts
signpost|n|路标|A board at the side of a road showing directions and distances.~A pole with an arrow-shaped board that tells you which way to go.|Follow the ___ to the beach.||signposts
reliability|n|可靠性|The quality of being able to be trusted to work well or be correct.~How dependable something or someone is.|The ___ of the data was questioned.|dependability,trustworthiness|
impractical|adj|不切实际的|Not sensible or realistic.~Not suitable for use in real situations.|The plan is too expensive and ___.|unrealistic,unworkable,unfeasible|
dietary|adj|饮食的|Relating to the food that you eat.~Connected with the kind of food a person eats regularly.|Doctors can give ___ advice.|nutritional|
chain|n|链子|A series of metal rings joined together.~A line of linked metal loops used for holding or pulling things.|She wore a gold ___ around her neck.||chains
morality|n|道德|Principles about what is right and wrong behaviour.~Beliefs about good and bad ways to act.|Religion often shapes people's ___.|ethics,morals|
therapy|n|治疗；疗法|Treatment that helps someone with an illness or a mental problem.~Treatment of an illness without drugs or surgery.|She is having ___ for depression.|treatment|therapies
infrequent|adj|不常发生的；稀少的|Not happening often.~Happening only rarely.|Buses to the village are ___.|rare,occasional,uncommon,sporadic|
introductory|adj|入门的|Giving basic information about a subject to beginners.~Coming at the beginning to present a subject.|I'm taking an ___ course in economics.|preliminary,opening,initial,basic|
awareness|n|意识；认识|Knowledge or understanding of a situation or subject.~The state of knowing that something exists or is important.|The campaign aims to raise ___ of climate change.|consciousness,understanding,knowledge|
maturity|n|成熟|The quality of behaving in a sensible, adult way.~The state of being fully grown or developed.|She shows great ___ for her age.||
recreational|adj|休闲的；娱乐的|Done for enjoyment in your free time.~Relating to activities that people do to relax.|The park offers many ___ activities.|leisure|
practical|adj|实践的~实用的|Relating to real situations rather than ideas or theories.~Useful and suitable for a particular purpose.|The course gives students ___ experience.~Flat shoes are more ___ for walking.|hands-on,applied~useful,functional,sensible|
stick|n|枝条；棍子|A thin piece of wood that has fallen from a tree.~A long thin piece of wood used for support when walking.|The dog ran to fetch the ___.|twig,branch~cane,walking stick|sticks
scarcity|n|缺乏；不足|A situation in which there is not enough of something.~The state of being rare or in short supply.|Water ___ is a major problem in some regions.|shortage,lack,dearth,deficiency|
erosion|n|侵蚀|The gradual damage of land or rock by wind, water or ice.~The slow wearing away of soil or stone.|Trees help to prevent soil ___.|wearing away|
rhizome|n|根状茎|A thick stem that grows sideways under the ground and sends out roots and shoots.~An underground plant stem, as in ginger.|Ginger is the ___ of a tropical plant.||rhizomes
forefront|n|前沿；最重要的位置|The most important or advanced position.~The leading position in an area of activity.|The university is at the ___ of medical research.|vanguard,cutting edge,front line,leading edge|
february|n|二月|The second month of the year.~The month after January.|My birthday is in ___.||
saturday|n|星期六|The day of the week after Friday.~The day between Friday and Sunday.|The shop is closed on ___.||
wednesday|n|星期三|The day of the week after Tuesday.~The day between Tuesday and Thursday.|We have English classes every ___.||
thursday|n|星期四|The day of the week after Wednesday.~The day between Wednesday and Friday.|The meeting is on ___ morning.||
vulnerable|adj|易受伤害的；脆弱的|Easily hurt, harmed or attacked.~Weak and needing protection.|Elderly people are especially ___ to the virus.|susceptible,defenceless,defenseless,exposed,fragile,weak|
confusion|n|困惑；混乱|A state of not understanding what is happening.~A situation where people are uncertain about what to do.|There was some ___ about the meeting time.|uncertainty,bewilderment,misunderstanding|
wheel|n|轮子|A round object that turns to help a vehicle move.~A circular frame that turns around a central bar.|My bike has a flat front ___.||wheels
width|n|宽度|The distance across something from one side to the other.~The size of something measured from side to side.|The room is four metres in ___.|breadth|widths
constant|adj|持续不断的~恒定的|Happening all the time or again and again.~Staying the same over a period of time.|The baby needs ___ attention.~Keep the oven at a ___ temperature.|continuous,continual,persistent,ceaseless~steady,stable,unchanging,fixed|
apprenticeship|n|学徒期|A period of time when a young person works for an employer to learn a skilled job.~Training in a trade while working.|He did a four-year ___ as an electrician.|traineeship|apprenticeships
preferable|adj|更可取的|Better or more suitable.~More desirable than something else.|Walking is ___ to driving for short trips.|better,more desirable,superior|
pollutant|n|污染物|A substance that makes air, water or soil dirty and harmful.~Something that damages the environment, such as chemicals from factories.|Cars release many harmful ___s into the air.|contaminant|pollutants
erratic|adj|不稳定的；无规律的|Not following a regular pattern; changing often in an unexpected way.~Unpredictable and irregular.|His ___ behaviour worried his friends.|unpredictable,irregular,inconsistent,unstable,changeable|
patent|n|专利|An official right to be the only one to make or sell a new invention.~A legal document protecting an inventor's idea.|She applied for a ___ for her new design.||patents
compromised|adj|（免疫等）受损的|Weakened or damaged so that it does not work well.~Made less effective or less safe.|People with a ___ immune system catch infections easily.|weakened,impaired|
impediment|n|妨碍；障碍|Something that makes progress difficult.~A problem that stops something from happening easily.|Lack of money is a major ___ to growth.|obstacle,barrier,hindrance,obstruction|impediments
industrial|adj|工业的|Relating to factories and the making of goods.~Having many factories.|The city is an important ___ centre.||
reptile|n|爬行动物|A cold-blooded animal with dry skin, such as a snake or lizard, that lays eggs.~An animal like a crocodile or tortoise whose body is covered in scales.|The crocodile is the largest living ___.||reptiles
gorge|n|峡谷|A deep narrow valley with steep sides, often with a river.~A narrow passage between hills or mountains.|The river flows through a deep ___.|canyon,ravine|gorges
plastic|n|塑料|A light artificial material made from chemicals and used to make many things.~A strong man-made material that can be shaped when soft.|The bottle is made of ___.||plastics
pacific|n|太平洋|The largest ocean, between Asia and the Americas.~The ocean to the west of North and South America.|Hawaii is in the middle of the ___.||
spare|adj|备用的~空闲的|Extra and not being used, kept in case it is needed.~(Of time) free, when you are not working.|Always carry a ___ tyre in the car.~What do you do in your ___ time?|extra,additional,backup,reserve~free|
operate|v|操作；运转|To use or control a machine.~(Of a machine) to work in a particular way.|Can you ___ this machine?|run,use,work,control|operates,operated,operating
rubbish|n|垃圾|Things that you throw away because they are no longer wanted.|Please put your ___ in the bin.|garbage,trash,waste,litter,refuse|
license|n|执照；许可证|An official document that gives you permission to do or own something.~A paper from the government allowing you to drive, sell alcohol etc.|You need a ___ to drive a car.|permit|licence,licenses,licences
receptionist|n|接待员；前台|A person whose job is to welcome visitors and answer the phone in an office or hotel.~Someone who works at the front desk of a hotel or clinic.|Ask the ___ for your room key.||receptionists
fertiliser|n|肥料；化肥|A substance put on soil to help plants grow.~Chemicals or natural matter added to land to make crops grow better.|The farmer spread ___ on the fields.|manure,compost|fertilisers
nutrient|n|营养物|A substance in food that living things need to grow and stay healthy.~Something in food, such as a vitamin or mineral, that the body needs.|Vegetables contain many important ___s.||nutrients
salt|n|盐|A white substance from the sea or the ground, used to add flavour to food.~What you add to food to make it less bland, often with pepper.|Add a pinch of ___ to the soup.||
weight|n|重量；体重|How heavy something or someone is.~A measurement of how heavy something is.|He is trying to lose ___.|mass,heaviness|weights
outsource|v|外包|To pay another company to do work instead of doing it yourself.~To get another company to provide services or goods instead of your own staff.|Many firms ___ their customer service to other countries.|contract out,subcontract|outsources,outsourced,outsourcing
appropriately|adv|适当地|In a way that is suitable for the situation.~Correctly for the occasion.|Please dress ___ for the interview.|suitably,properly,fittingly,correctly|
conform|v|符合；遵守|To follow the usual rules or standards.~To behave in the same way as most other people.|All products must ___ to safety standards.|comply,obey,follow,adhere|conforms,conformed,conforming
ditch|n|沟渠|A long narrow channel dug at the side of a road or field to carry away water.~A long narrow hole in the ground for water to run along.|The car slid off the road into a ___.|trench,channel,gutter|ditches
prehistoric|adj|史前的|From the time before history was written down.~Belonging to a very ancient period before written records.|Dinosaurs were ___ animals.||
equator|n|赤道|An imaginary line around the middle of the Earth, halfway between the North and South Poles.~The line at zero degrees latitude.|Countries near the ___ are hot all year.||
scenes|n|（电影、戏剧的）场景|Parts of a play or film in which the action happens in one place.~Short sections of a film or play.|The film's opening ___ were shot in Paris.|sequences,episodes|scene
migrant|n|移居者；外来务工者|A person who moves to another place or country to find work.~Someone who travels from place to place for jobs.|Many ___ workers came to the city.|immigrant,emigrant|migrants
penalised|v|处罚（过去分词）|Punished for breaking a rule.~Put at an unfair disadvantage.|Players will be ___ for arriving late.|punished,fined,sanctioned|penalise,penalises
certificate|n|证书|An official document that proves a fact, such as passing a course.~A paper stating that you have a qualification.|You will receive a ___ at the end of the course.|diploma|certificates
towel|n|毛巾|A piece of thick cloth used to dry yourself.~A cloth you use after a shower or a swim.|Bring a ___ to the swimming pool.||towels
ethnicity|n|族裔；种族|The fact of belonging to a particular racial or cultural group.~A person's cultural background or ancestry.|The survey asks about age, gender and ___.|race,ethnic origin,ethnic background|
predictable|adj|可预测的；意料之中的|Happening in a way that you would expect.~Able to be known in advance.|The ending of the film was very ___.|foreseeable,expected,unsurprising|
root|n|根~根源|The part of a plant that grows under the ground and takes in water.~The cause or origin of a problem.|The tree's ___s go deep into the soil.~Money is the ___ of the problem.|~source,origin,cause|roots
preliminary|adj|初步的|Done at the beginning to prepare for something more important.~Coming before the main part.|The ___ results look promising.|initial,introductory,preparatory,early|
precise|adj|精确的|Exact and accurate in every detail.~Clear and correct.|Can you give me the ___ time?|exact,accurate,correct|
cloth|n|布料|Material made by weaving cotton, wool etc.~A piece of fabric used for cleaning.|The table was covered with a white ___.|fabric,material,textile|cloths
exhausted|adj|精疲力竭的|Extremely tired.~Having used up all your energy.|After the marathon, she was completely ___.|tired,worn out,weary,drained,fatigued,shattered|
mystifying|adj|令人困惑的|Impossible to understand or explain.|His sudden decision was ___.|puzzling,baffling,bewildering,confusing,perplexing|
poetry|n|诗歌|Pieces of writing with rhythm, often arranged in lines that rhyme.~Literature written in verse.|She enjoys reading Romantic ___.|verse|
terminology|n|术语|The special words used in a particular subject.|Medical ___ can be hard to understand.|jargon,vocabulary,nomenclature|
classification|n|分类|The act of putting things into groups based on shared features.~A system for arranging things in categories.|The ___ of plants and animals took centuries.|categorisation,categorization,grouping|classifications
cognitive|adj|认知的|Relating to thinking, learning and understanding.~Connected with mental processes such as memory and reasoning.|Puzzles help develop children's ___ skills.|mental,intellectual|
fog|n|雾|Thick cloud near the ground that makes it difficult to see.~A mass of tiny water drops in the air close to the ground.|Flights were delayed because of thick ___.|mist,haze|
arrival|n|到达|The act of reaching a place.~When someone or something gets to a place.|Please call us on your ___ at the airport.||arrivals
presence|n|出席；在场|The fact of being in a particular place.~Being somewhere at a certain time.|Your ___ at the meeting is required.|attendance|
pregnant|adj|怀孕的|Having a baby developing inside the body.~Expecting a baby.|She is six months ___.|expecting|
shoulder|n|肩膀|The part of the body between the neck and the top of the arm.~Where your arm joins your body.|He carried the bag over his ___.||shoulders
adaptation|n|改编（作品）~适应|A film or play that has been made from a book.~The process of changing to suit a new situation.|The film is an ___ of a famous novel.~Animals show remarkable ___ to cold climates.|version~adjustment|adaptations
mediocre|adj|平庸的|Not very good; of only average quality.~Ordinary, not excellent.|The food at the hotel was ___.|average,ordinary,second-rate,so-so,unremarkable|
butter|n|黄油|A yellow fat made from cream, spread on bread or used in cooking.~A soft yellow food made from milk.|Spread some ___ on the toast.||
crystal|n|晶体；水晶|A small solid with a regular shape that forms naturally, like salt or ice.~A clear, colourless rock or very high-quality glass.|Snowflakes are made of ice ___s.~The vase is made of ___.||crystals
contamination|n|污染|The process of making something dirty or poisonous.~Harmful substances being added to water, food etc.|Water ___ caused the outbreak of disease.|pollution,poisoning|
tentacle|n|触手；触须|One of the long thin arms of animals such as an octopus.~A long bendy part of a sea animal, used for feeling and holding.|An octopus has eight ___s.||tentacles
inclination|n|意愿~倾向|A feeling that makes you want to do something.~A tendency to behave in a particular way.|I had no ___ to go out in the rain.~He has an ___ to be lazy.|desire,wish,urge~tendency,disposition,propensity|inclinations
pleased|adj|高兴的|Happy or satisfied about something.|I'm ___ to meet you.|happy,glad,delighted,satisfied,content|
tap|n|水龙头|A device that controls the flow of water from a pipe.~What you turn to get water from a sink.|Turn off the ___ when you brush your teeth.|faucet|taps
prediction|n|预言；预测|A statement about what will happen in the future.~A guess about the future based on information.|My ___ is that prices will rise.|forecast,prophecy,projection|predictions
account|n|描述；叙述|A written or spoken report of something that happened.~A description of events.|He gave a detailed ___ of the accident.|report,description,story,version|accounts
refusal|n|拒绝|The act of saying or showing that you will not do or accept something.~Saying no to a request.|Her ___ to apologise made things worse.|rejection,denial|refusals
character|n|（作品中的）人物~性格|A person in a book, film or play.~The qualities that make a person different from others.|The main ___ in the novel is a young doctor.~She has a strong ___.|~personality,nature,temperament|characters
formula|n|公式|A set of letters, numbers or symbols that shows a mathematical or scientific rule.~A rule written with symbols, as in maths or chemistry.|What is the ___ for the area of a circle?|equation|formulas,formulae
knife|n|小刀|A tool with a sharp blade used for cutting.~Something sharp with a handle that you cut food with.|Use a sharp ___ to cut the bread.|blade|knives
pedestrian|n|行人|A person walking along a street rather than driving.~Someone travelling on foot.|The car nearly hit a ___.|walker|pedestrians
physician|n|医师|A medical doctor, especially one who treats illness without surgery.|Consult your ___ before taking the drug.|doctor,GP|physicians
secretary|n|秘书|A person who works in an office typing letters, keeping records and arranging meetings.~An office worker who helps a manager with letters and appointments.|Please leave a message with my ___.|assistant,PA,personal assistant|secretaries
spoon|n|勺子|A tool with a small bowl and a handle, used for eating or stirring.~What you use to eat soup.|Stir the tea with a ___.|teaspoon|spoons
trend|n|趋势|A general direction in which something is changing.~A gradual change in what people do.|There is a growing ___ towards working from home.|tendency,movement,pattern,shift|trends
utensil|n|厨具；器皿|A tool used in the kitchen, such as a spoon or pan.~A small object used for cooking or eating.|Wash all cooking ___s after use.|implement,tool|utensils
whale|n|鲸|A very large sea animal that breathes air through a hole on top of its head.~The largest animal in the ocean, which is a mammal, not a fish.|The blue ___ is the largest animal on Earth.||whales
confirmation|n|确认|A statement or document showing that something is true or has been arranged.~Proof that a booking has been made.|You will receive a ___ email after booking.|verification,proof|confirmations
moustache|n|小胡子|Hair that grows on a man's upper lip.~Hair between the nose and the mouth.|He has a thick grey ___.||moustaches
ordinary|adj|普通的|Normal and not special or unusual.~Average; like most others.|It was just an ___ day.|normal,usual,common,regular,everyday,average|
clarity|n|清晰|The quality of being clear and easy to understand.~The quality of being clear to see or hear.|Her essay was praised for its ___.|clearness,lucidity|
slip|v|滑倒|To slide accidentally and lose your balance.~To lose your footing on a wet or smooth surface.|Be careful not to ___ on the ice.|slide,skid|slips,slipped,slipping
nitrogen|n|氮|A gas with no colour or smell that makes up most of the Earth's air.~The chemical element N.|Plants need ___ to grow.||
pesticide|n|杀虫剂；农药|A chemical used to kill insects that damage crops.~A substance farmers spray to kill insects that harm their crops.|Organic farmers do not use ___s.|insecticide|pesticides
square|n|广场~正方形|An open area in a town, often with buildings on all sides.~A shape with four equal straight sides.|There is a market in the town ___ every Sunday.~Draw a ___ and a circle.|plaza~|squares
construction|n|建造；施工|The process of building things such as houses and roads.~The work of building.|The new bridge is still under ___.|building|
dislocation|n|脱臼|An injury in which a bone is pushed out of its normal position.~When a bone comes out of its joint.|He suffered a shoulder ___ playing rugby.||dislocations
lend|v|借出|To give something to someone for a short time, expecting it back.~To let someone use something that they will return.|Could you ___ me your pen?|loan|lends,lent,lending
rapidity|n|迅速|The quality of happening very quickly.|The ___ of the change surprised everyone.|speed,swiftness,quickness|
adverse|adj|不利的|Harmful or unfavourable.~Having a negative effect.|The drug has no ___ effects.|negative,harmful,unfavourable,unfavorable,detrimental|
attitude|n|态度|The way you think and feel about something.~Your opinion about something, shown in how you behave.|He has a positive ___ to work.|outlook,approach,stance,view,position|attitudes
efficient|adj|高效的|Working well without wasting time, money or energy.~Producing good results with little waste.|We need a more ___ way to sort the mail.|productive,economical|
tendency|n|倾向|A habit of behaving in a particular way.~A general change in a direction.|He has a ___ to talk too much.|inclination,propensity,habit,trend|tendencies
heritage|n|遗产（传统、文化等）|The traditions, buildings and culture of a society passed down from the past.~Things from the past that are valued and kept.|The castle is part of our national ___.|legacy,inheritance,tradition|
neglected|adj|被忽视的；无人照管的|Not given enough care or attention.~Left without care for a long time.|The garden looked ___ and overgrown.|abandoned,ignored,uncared-for,forgotten|
resident|n|居民|A person who lives in a particular place.~Someone whose home is in a certain area.|Local ___s complained about the noise.|inhabitant,citizen,occupant,dweller,local|residents
notable|adj|值得注意的；显著的|Important or interesting enough to receive attention.|The city has several ___ buildings.|remarkable,noteworthy,significant,important,famous|
uniform|n|制服|A special set of clothes worn by all members of a group, such as students or police.~Clothes that show which school or job you belong to.|Students must wear a school ___.||uniforms
sensory|adj|感官的；感觉的|Relating to sight, hearing, smell, taste and touch.~Connected with how the body receives information from outside.|Babies learn through ___ experiences.||
versus|prep|对；与……相对|Against; used to show two teams or sides competing.~Used when comparing two different ideas or choices.|It's Brazil ___ Germany tonight.~Online learning ___ classroom learning|against,vs,v~compared with,compared to|vs.
flaw|n|缺陷；瑕疵|A mistake or weakness that makes something less perfect.~A small fault in the way something is made.|There is a serious ___ in your argument.|defect,fault,weakness,imperfection,shortcoming|flaws
journalist|n|记者|A person who writes news stories for newspapers, TV or websites.~Someone who reports the news.|She works as a ___ for a national newspaper.|reporter,correspondent|journalists
realisation|n|意识到|The moment when you suddenly understand something.~Becoming aware of a fact.|She came to the ___ that she was lost.|awareness,understanding,recognition|realisations
enjoyment|n|享受；乐趣|The pleasure you get from doing something.~The feeling of liking something.|Music adds to my ___ of life.|pleasure,delight,fun,satisfaction|
conqueror|n|征服者|A person who takes control of a country by force.~Someone who defeats a nation in war and rules it.|William the ___ invaded England in 1066.|invader|conquerors
recipe|n|食谱|A set of instructions for cooking a dish.~A list of ingredients and steps for making food.|This ___ calls for two eggs.||recipes
chef|n|厨师|A professional cook, especially the head cook in a restaurant.~Someone whose job is preparing food in a restaurant.|The ___ prepared a special dish for us.|cook|chefs
contradiction|n|矛盾|A difference between two statements or facts that means they cannot both be true.~Saying the opposite of something.|There is a ___ between what he says and what he does.|inconsistency,conflict,discrepancy|contradictions
druid|n|德鲁伊（古凯尔特祭司）|A priest in an ancient religion in Britain and France before Christianity.~A member of an old Celtic religious group.|The ___s held ceremonies at Stonehenge.||druids
assign|v|分配；指派|To give someone a job or a piece of work to do.~To choose someone for a particular task.|The teacher will ___ each student a topic.|allocate,allot,give|assigns,assigned,assigning
dehydration|n|脱水|A harmful condition in which the body has lost too much water.~Not having enough water in your body.|Drink plenty of water to avoid ___.||
hesitate|v|犹豫|To pause before doing or saying something because you are uncertain.~To wait for a moment because you are not sure.|Don't ___ to ask if you need help.|pause,waver,delay|hesitates,hesitated,hesitating
valid|adj|（证件）有效的~有根据的；合理的|(Of a ticket or document) legally acceptable to use.~Based on good reasons; reasonable.|Your passport must be ___ for six months.~That is a ___ point.|~sound,reasonable,legitimate,well-founded|
neutral|adj|中立的|Not supporting either side in an argument or war.~Not taking sides.|Switzerland remained ___ during the war.|impartial,unbiased,non-aligned|
shellfish|n|贝类；甲壳类海鲜|Sea creatures with hard outer cases, such as crabs and oysters, that people eat.~Seafood like prawns and mussels.|Some people are allergic to ___.|seafood|
instance|n|例子；实例|A particular example of something.~A single case of something happening.|This is an ___ of good teamwork.|example,case,occurrence|instances
refuse|v|拒绝|To say that you will not do or accept something.~To say no.|He may ___ to answer the question.|decline,reject|refuses,refused,refusing
evenly|adv|均匀地|In equal amounts or parts.~Spread equally over an area.|Divide the cake ___ among the children.|equally,fairly,uniformly|
rapidly|adv|迅速地|Very quickly.~At great speed.|The city is growing ___.|quickly,fast,swiftly,speedily|
high-rise|n|高楼|A very tall modern building with many floors.~A tower block of flats or offices.|They live on the 20th floor of a ___.|skyscraper,tower block|high-rises
workmanship|n|手艺；做工|The skill with which something is made.~How well something has been built or produced by hand.|The furniture shows excellent ___.|craftsmanship,artistry,skill|
composer|n|作曲家|A person who writes music.~Someone who creates pieces of classical music.|Mozart is my favourite ___.|songwriter|composers
exaggerated|adj|夸大的|Made to seem bigger, better or worse than it really is.|His stories are always ___.|overstated,inflated,overblown|
inhabited|adj|有人居住的|(Of a place) having people or animals living there.|The island is no longer ___.|populated,occupied,settled|
vast|adj|巨大的；广阔的|Extremely large in size or amount.|A ___ area of forest was destroyed.|huge,enormous,immense,massive,extensive|
barely|adv|几乎不；勉强|Only just; almost not.~By a very small amount.|I could ___ hear what he said.|hardly,scarcely,just|
segmented|adj|分割的；分段的|Divided into separate parts.~Split into sections.|The market is ___ by age and income.|divided,split|
cookery|n|烹饪|The skill or activity of preparing food.~The art of making meals.|She went to a ___ class.|cooking,cuisine|
scratches|n|划痕|Thin marks or cuts on a surface made by something sharp.~Small lines on a surface or on the skin.|There are ___ on my phone screen.|marks,scrapes|scratch
conventional|adj|传统的；常规的|Following the usual ways of doing things.~Traditional, not new or unusual.|He prefers ___ methods of teaching.|traditional,standard,orthodox,customary,usual|
implemented|v|实施；执行（过去分词）|Put a plan or decision into action.~Carried out an official plan.|The new policy was ___ last year.|carried out,executed,applied,enacted|implement,implements,implementing
trait|n|特征；特点|A particular quality in someone's character.~A feature that makes a person or animal special.|Patience is a useful ___ for a teacher.|characteristic,feature,quality,attribute|traits
advisable|adj|明智的；可取的|Sensible and recommended in a situation.~Wise to do.|It is ___ to book tickets in advance.|wise,sensible,prudent,recommended|
aromatic|adj|芳香的|Having a strong pleasant smell.|Basil and mint are ___ herbs.|fragrant,scented,sweet-smelling|
arise|v|（问题）出现；产生|(Of a problem or situation) to begin to happen.~To come into being.|Problems may ___ if you don't plan ahead.|occur,emerge,appear,happen|arises,arose,arisen,arising
scepticism|n|怀疑态度|An attitude of doubting that something is true.~Doubt about claims that others accept.|The claims were met with ___.|doubt,disbelief,distrust|skepticism
spontaneously|adv|自发地；一时冲动地|Without planning, because you suddenly want to.~Happening naturally without being caused by anything outside.|The crowd ___ began to sing.~Some materials can burn ___.|impulsively~naturally|
defended|v|保卫；为……辩护（过去式）|Protected someone or something from attack.~Spoke in support of someone who was criticised.|The soldiers ___ the city.~She ___ her decision at the meeting.|protected,guarded~justified,supported|defend,defends,defending
reinstated|v|使复职；恢复（过去分词）|Given back an old job or position.~Brought back into use, like an old rule or system.|He was ___ after the investigation.|restored|reinstate,reinstates
syllabus|n|教学大纲|A list of the topics that will be studied in a course.~The subjects a class will cover.|Poetry is on this year's ___.|curriculum,course outline|syllabuses,syllabi
vertical|adj|垂直的|Going straight up or down, at 90 degrees to the ground.|Draw a ___ line.|upright,perpendicular|
assist|v|帮助；协助|To help someone do something.~To give support.|Nurses ___ doctors during operations.|help,aid,support|assists,assisted,assisting
harvest|n|收获（期）|The time of year when crops are cut and collected.~The crops that are collected.|Farmers are very busy during the ___.|crop,yield|harvests
tent|n|帐篷|A shelter made of cloth held up by poles, used for camping.~A portable shelter you sleep in outdoors.|We put up the ___ by the lake.||tents
intermediate|adj|中级的|Between beginner and advanced level.~In the middle between two stages.|She is taking an ___ Spanish course.|mid-level,middle|
maintenance|n|维护；保养|The work of keeping a building or machine in good condition.~Regular checking and repair.|The lift is closed for ___.|upkeep,servicing,repair|
carnivorous|adj|食肉的|(Of an animal or plant) eating meat.~Feeding on other animals.|Lions are ___ animals.|meat-eating,predatory|
pouch|n|育儿袋~小袋|A pocket of skin on the stomach of animals such as kangaroos.~A small bag.|A baby kangaroo lives in its mother's ___.~He kept his coins in a leather ___.|~bag,purse|pouches
literacy|n|读写能力|The ability to read and write.~Being able to understand written language.|The charity runs adult ___ programmes.||
reasonable|adj|合理的~（价格）公道的|Fair and sensible.~(Of a price) not too expensive.|That sounds like a ___ request.~The hotel prices are ___.|sensible,fair,rational,logical~affordable,moderate,fair|
physically|adv|身体上|In a way that relates to the body.~In terms of the body rather than the mind.|He is ___ fit but mentally tired.|bodily|
demanding|adj|要求高的；费力的|Needing a lot of time, skill or effort.~Hard and tiring.|Nursing is a very ___ job.|challenging,tough,difficult,taxing,exacting,hard|
constrain|v|限制|To limit or restrict what someone can do.~To stop something from developing freely.|Lack of money may ___ our choices.|limit,restrict,restrain,hinder|constrains,constrained,constraining
extracurricular|adj|课外的|(Of activities) done at school or college but not part of normal lessons.~Outside the regular course of study.|Sport and music are popular ___ activities.|after-school|extra-curricular
mud|n|泥|Wet, soft earth.~Dirt mixed with water.|The children came home covered in ___.|dirt,mire|
creek|n|小溪|A small narrow stream.~A small river.|We crossed the ___ on stepping stones.|stream,brook|creeks
castle|n|城堡|A large strong building with thick walls and towers, built in the past to protect people.~A fortified home of a king or lord.|The king lived in a ___ on the hill.|fortress,fort|castles
insomnia|n|失眠（症）|The condition of being unable to sleep.~Difficulty sleeping over a long period.|Stress can cause ___.|sleeplessness|
foyer|n|门厅；大厅|The entrance hall of a theatre, hotel or large building.~The area just inside the main door of a public building.|Let's meet in the ___ before the show.|lobby,entrance hall,reception|foyers
scheme|n|（官方的）计划；方案|An official plan for achieving something.~An organised system for doing something.|The government launched a new recycling ___.|plan,programme,program,project,initiative|schemes
cultivation|n|耕作；种植|The process of growing crops or preparing land for them.~Farming of plants.|Rice ___ needs a lot of water.|farming,growing,agriculture|
core|n|核心|The most important or central part of something.~The heart of something.|Grammar is at the ___ of the course.|heart,centre,center,nucleus,essence|cores
expenditure|n|开支；支出|The total amount of money spent by a government or person.|Government ___ on health has increased.|spending,expenses,outlay,expense,costs|expenditures
dogmatically|adv|教条地；武断地|In a way that insists your beliefs are right without considering other opinions.~Rigidly, without being open to other views.|He ___ refused to consider other views.|rigidly,inflexibly|
administrative|adj|行政的；管理的|Relating to managing an organisation's work.~Connected with running an office or organisation.|She has an ___ job in a hospital.|managerial,clerical,organisational,organizational|
bureaucratic|adj|官僚主义的|Involving too many complicated official rules and procedures.~Slow because of official paperwork.|The ___ process took months.||
expertise|n|专门知识；专长|Special skill or knowledge in a particular area.~A high level of knowledge.|We need someone with technical ___.|skill,know-how,knowledge,proficiency|
specialization|n|专业化；专攻|The process of focusing on one particular area of work or study.~Concentrating on one subject or skill.|Increased ___ has made workers more productive.||specialisation
rivals|n|竞争对手|People or groups competing with each other.~Opponents in a competition.|The two companies are business ___.|competitors,opponents|rival
irrational|adj|不理性的|Not based on clear thinking or reason.|She has an ___ fear of spiders.|illogical,unreasonable,unfounded|
hypotheses|n|假设（复数）|Ideas that try to explain something but have not yet been proved.~Possible explanations that scientists test.|Scientists tested several ___.|theories,assumptions|hypothesis
flamingo|n|火烈鸟|A tall pink bird with long thin legs that lives near water.~A pink wading bird that often stands on one leg.|The ___ stood on one leg in the lake.||flamingos,flamingoes
scenery|n|风景|The natural features of an area, such as mountains and forests, that are beautiful to look at.~The view of the countryside.|The ___ in Scotland is breathtaking.|landscape,view,views|
swan|n|天鹅|A large white water bird with a long curved neck.~A graceful bird that swims on lakes.|A ___ glided across the lake.||swans
omission|n|遗漏|Something that has been left out.~The act of not including something.|There were some ___s in the report.|exclusion,oversight,gap|omissions
elusive|adj|难以捉摸的；难找到的|Difficult to find, catch or achieve.~Hard to describe or remember.|Success remained ___ for years.|evasive,slippery|
prey|n|猎物|An animal that is hunted and killed by another animal for food.~What a hunter tries to catch.|The lion chased its ___.|quarry,victim|
predator|n|捕食者|An animal that kills and eats other animals.~A hunter in the animal world.|The shark is a top ___.|hunter|predators
sketch|n|素描；草图|A quick simple drawing.~A rough picture made without much detail.|She made a ___ of the old church.|drawing,outline,draft|sketches
preconception|n|先入之见；成见|An idea formed before you have enough information.~An opinion you have before you know the facts.|Try to forget your ___s about the job.|assumption,prejudice,presumption|preconceptions
frozen|adj|冷冻的|Turned into ice or kept very cold so it lasts longer.~(Of food) stored at a very low temperature.|Buy some ___ vegetables.|iced,chilled|
biography|n|传记|The story of a person's life written by someone else.~A book about another person's life.|I'm reading a ___ of Steve Jobs.|life story|biographies
trials|n|（临床）试验|Tests of how good or safe something is, such as a new medicine.~Experiments to check a product before it is sold.|The drug is in clinical ___.|tests,experiments|trial
awake|adj|醒着的|Not sleeping.~Having just stopped sleeping.|I was ___ all night.|up,conscious|
calming|adj|使人平静的；舒缓的|Making you feel relaxed and less worried.|Lavender has a ___ effect.|soothing,relaxing,tranquil|
suit|n|西装；套装|A set of clothes made of the same material, usually a jacket with trousers or a skirt.~Formal matching clothes worn to work.|He wore a dark ___ to the interview.||suits
fermentation|n|发酵|A chemical change in which sugar becomes alcohol or acid, as in making wine or yogurt.~The process that makes bread rise and turns grape juice into wine.|Yogurt is made by ___.||
withdraw|v|（从银行）取钱~撤回；退出|To take money out of a bank account.~To take back or remove something.|I need to ___ some cash.~He decided to ___ from the race.|take out~pull out,retreat,retract|withdraws,withdrew,withdrawn,withdrawing
mould|n|霉菌|A soft green or grey growth on old food or damp walls.~A fungus on things that are left too long in a wet place.|There was ___ on the bread.|fungus,mildew|moulds
pressed|adj|（时间、金钱）紧张的|(Followed by "for") having very little time or money.~In a hurry; short of something.|I'm a bit ___ for time today.|short,rushed|
machinery|n|机器；机械|Large pieces of equipment considered as a group, e.g. in a factory.~Equipment with moving parts used to do work.|Farm ___ is expensive.|equipment|
elastic|adj|有弹性的|Able to stretch and then go back to its original shape.|The waistband is made of ___ material.|stretchy,flexible,springy|
extension|n|延期~扩建部分|An extra period of time allowed.~A new room added to a building.|I asked my tutor for an ___ on my essay.~They built an ___ at the back of the house.|~annexe,addition|extensions
permanent|adj|永久的|Lasting for a very long time or for ever.|She is looking for a ___ job.|lasting,long-term,enduring,stable|
exclusively|adv|专门地；仅仅|Only; for one group or purpose alone.|The offer is available ___ to members.|only,solely,purely|
origins|n|起源~出身|The beginning or cause of something.~A person's family background.|The ___ of the universe are still a mystery.~She is proud of her Irish ___.|beginnings,roots,source~roots,background,ancestry|origin
behaved|v|表现（过去式）|Acted in a particular way.~Acted politely and correctly.|The children ___ well at the party.|acted|behave,behaves
exotic|adj|异国的；外来的|Unusual and interesting because it comes from a distant country.~From a faraway tropical place.|They sell ___ fruits like mango.|foreign,tropical|
amber|n|琥珀|A hard yellowish-brown substance formed from old tree resin, used for jewellery.~Fossil tree sap that can trap insects.|An insect was trapped in a piece of ___.||
dense|adj|茂密的；稠密的|Having a lot of plants, people or things close together.~Thick and difficult to see or move through.|The path went through ___ forest.|thick,crowded,packed,compact|
laundry|n|待洗或洗好的衣物|Clothes that need washing or have just been washed.~Dirty clothes and sheets to be cleaned.|I do my ___ on Sundays.|washing|
claws|n|爪|Sharp curved nails on the feet of animals and birds.~The hard pointed parts at the end of a cat's toes.|The cat scratched me with its ___.|talons|claw
craft|n|手艺；工艺|An activity that involves making things skilfully by hand.~A traditional skill of making objects.|Pottery is a traditional ___.|handicraft,skill,art,trade|crafts
empathetic|adj|有同理心的|Able to understand and share other people's feelings.~Good at imagining how others feel.|A good nurse is ___.|empathic,understanding,compassionate,sympathetic|
infant|n|婴儿|A baby or very young child.~A child in its first year of life.|The ___ was sleeping peacefully.|baby,newborn|infants
ritual|n|仪式；例行公事|A set of actions always performed in the same way, especially as part of a ceremony.~Something you always do in the same way.|Drinking tea is a daily ___ in our family.|ceremony,rite,custom,routine|rituals
frost|n|霜|A thin white layer of ice that forms on surfaces when it is very cold.~Ice crystals on grass or windows on a cold morning.|There was ___ on the car this morning.|ice|
stressors|n|压力源|Events or conditions that cause pressure and worry.~Things in life that make people tense.|Exams and money problems are common ___ for students.|pressures|stressor
unenthusiastic|adj|不热心的|Not showing much interest or excitement.|He was ___ about the idea.|indifferent,apathetic,lukewarm,half-hearted|
vague|adj|含糊的|Not clear or detailed.~Not expressed exactly.|He gave only a ___ answer.|unclear,imprecise,hazy,fuzzy,ambiguous|
breadwinners|n|养家糊口的人|People who earn the money to support their families.~The members of a family who earn its income.|In many families both parents are ___.|earners,providers|breadwinner
decay|v|腐烂；衰退|To be slowly destroyed by natural processes.|Sugar makes your teeth ___.|rot,decompose,deteriorate|decays,decayed,decaying
manipulation|n|操纵；摆布|Clever, dishonest control of people or situations for your own benefit.~Influencing someone in an unfair way.|Advertising can involve the ___ of consumers.||
fragrance|n|香味；香水|A pleasant smell.|The ___ of roses filled the room.|scent,aroma,perfume|fragrances
malaria|n|疟疾|A serious disease spread by mosquito bites, causing fever.~A tropical illness carried by mosquitoes.|___ is common in tropical regions.||
gang|n|帮派；一伙人|A group of criminals or young people who cause trouble.~An organised group of people who commit crimes together.|A ___ of thieves robbed the bank.|band,group,mob|gangs
oyster|n|牡蛎|A flat shellfish, some of which produce pearls.~A sea creature with a rough shell that people eat raw.|Some ___s produce pearls.||oysters
economy|n|经济|The system by which a country produces and uses goods and money.~A country's trade, industry and money.|The ___ grew by 2% last year.||economies
interpret|v|解释；理解|To explain or decide on the meaning of something.~To understand something in a particular way.|How do you ___ this graph?|explain,understand,read,construe|interprets,interpreted,interpreting
vestigial|adj|退化的；残留的|(Of a body part) still existing but no longer useful.~Remaining from an earlier stage of evolution.|The human appendix is a ___ organ.|residual,rudimentary|
amused|adj|觉得好笑的|Finding something funny.~Entertained by something.|She was ___ by the joke.|entertained|
insurance|n|保险|An arrangement where you pay a company regularly and it pays you if you are ill, injured or lose property.~Protection against financial loss.|Travel ___ is essential.|cover,coverage|
unnecessary|adj|不必要的|Not needed.~More than is needed.|Avoid ___ spending.|needless,unneeded,pointless|
damp|adj|潮湿的|Slightly wet in an unpleasant way.~A little wet.|The walls are ___.|moist,wet,humid|
arson|n|纵火（罪）|The crime of deliberately setting fire to a building.~Starting a fire on purpose to damage property.|The fire was caused by ___.||
authentic|adj|真正的；正宗的|Real and not false or copied.|They serve ___ Italian food.|genuine,real,original|
sentimental|adj|情感上的；多愁善感的|Connected with emotions and memories rather than practical value.~Easily moved by feelings of love or sadness.|This ring has ___ value.|emotional,nostalgic|
guidance|n|指导|Help and advice about what to do.~Instructions from someone more experienced.|Students receive careers ___.|advice,direction,counselling,counseling,help|
superiority|n|优越（性）|The quality of being better than others.~Being stronger or more advanced than others.|They claimed technological ___.|advantage,supremacy,dominance|
bullying|n|霸凌；欺凌|Hurting or frightening weaker people again and again.~Using strength or power to scare others.|Schools must do more to stop ___.|harassment,intimidation|
collective|adj|集体的|Shared or done by all members of a group.~Of a group as a whole.|It was a ___ decision.|joint,shared,common,communal|
verbal|adj|口头的|Spoken rather than written.|They had a ___ agreement.|oral,spoken|
keen|adj|热衷的|Very interested in something and eager to do it.|She's a ___ gardener.|enthusiastic,eager,passionate|
intermediary|n|中间人；调解人|A person who passes information between two groups to help them agree.|He acted as an ___ in the talks.|mediator,go-between,middleman,broker|intermediaries
premiere|n|首映；首演|The first public performance of a film or play.~The first showing of a film.|The film's ___ is in London.|debut,opening|premieres
dignitary|n|要人；显贵|A person with an important official position.~A VIP, such as a government minister.|Foreign ___ies attended the ceremony.|VIP|dignitaries
jingle|n|广告短歌|A short simple tune used in advertising.~A catchy song in a TV or radio advertisement.|I can't get that advertising ___ out of my head.||jingles
affectionate|adj|深情的；充满爱意的|Showing that you like or love someone.~Loving and gentle.|She gave him an ___ hug.|loving,caring,fond,tender,warm|
corridor|n|走廊|A long passage in a building with rooms on each side.|Her office is at the end of the ___.|hallway,passage,hall|corridors
illness|n|疾病|A disease or a period of being sick.~The state of being unwell.|He missed school because of ___.|sickness,disease,ailment|illnesses
maternal|adj|母亲的；母系的|Relating to a mother.~On the mother's side of the family.|She has strong ___ instincts.|motherly|
fertility|n|生育能力~（土地）肥沃|The ability to have babies.~The ability of land to produce crops.|Smoking can reduce ___.~Soil ___ is important for farming.|~fruitfulness,richness|
descendants|n|后代；子孙|People who are related to someone who lived long ago.~Children, grandchildren and so on.|They are ___ of Irish immigrants.|offspring,heirs,successors|descendant,descendents
dialect|n|方言|A form of a language spoken in a particular area.~A regional variety of a language.|They speak a local ___.|vernacular|dialects
numerical|adj|数字的；用数字表示的|Relating to or expressed in numbers.|The data is shown in ___ form.|numeric|
querying|v|询问；质疑|Asking questions about something, especially to check whether it is correct.~Expressing doubt about something.|She is ___ the bill because it seems too high.|questioning,asking,challenging|query,queries,queried
settlement|n|定居点~（争端的）解决；协议|A place where people have come to live and build homes.~An official agreement that ends an argument.|The first ___s were built near the river.~Both sides reached a ___.|colony,community~agreement,resolution,deal|settlements
envelope|n|信封|A paper cover for a letter.~What you put a letter in before posting it.|Put the letter in an ___.||envelopes
back-breaking|adj|极其繁重劳累的|(Of physical work) very hard and tiring.|Picking cotton was ___ work.|exhausting,gruelling,grueling,strenuous,arduous|backbreaking
elaborate|adj|精心制作的；详尽的|Very detailed and complicated.~Carefully planned with many parts.|They made ___ plans for the wedding.|detailed,intricate,complex,complicated|
entrepreneur|n|企业家；创业者|A person who starts their own business.~Someone who takes risks to set up a company.|She is a successful young ___.|businessman,businesswoman,businessperson|entrepreneurs
prohibition|n|禁令|An official rule that says something is not allowed.|There is a ___ on smoking indoors.|ban,embargo|prohibitions
rope|n|绳子|A very thick strong string made by twisting threads together.~A thick cord.|They tied the boat with a ___.|cord,line|ropes
navigate|v|导航；找路|To find your way from one place to another.~To plan and follow a route, especially at sea.|Sailors used the stars to ___.|steer|navigates,navigated,navigating
vessel|n|船|A large boat or ship.~A ship used for carrying goods or people.|The ___ sailed into the harbour.|ship,boat,craft|vessels
convenience|n|方便；便利|The quality of being easy and useful.~Something that makes life easier.|For ___, we ordered food online.|ease|
disposal|n|处理；清除|The act of getting rid of something.~Throwing something away.|The safe ___ of waste is important.|removal,dumping|
explosion|n|爆炸|A sudden, violent burst with a loud noise.~When a bomb goes off.|The ___ was heard miles away.|blast,eruption,bang|explosions
boiler|n|锅炉|A machine that heats water for a building.~The machine that provides hot water and heating in a house.|The ___ provides hot water for the house.|heater|boilers
stream|n|小溪|A small narrow river.~Running water smaller than a river.|We crossed a ___ in the woods.|brook,creek|streams
varied|adj|各式各样的|Including many different types.|The menu is ___.|diverse,various,assorted,mixed,wide-ranging|
bill|n|（鸟的）喙|The hard pointed mouth of a bird.~The part of a duck's face that it eats with.|The duck has a flat yellow ___.|beak|bills
originality|n|独创性|The quality of being new and different.~Creativity in thinking.|Her designs show great ___.|creativity,innovation,novelty,inventiveness|
absences|n|缺席|Times when someone is not where they should be, such as at school or work.|Frequent ___ affected his grades.||absence
architecture|n|建筑（风格）；建筑学|The style or design of buildings.~The art of designing buildings.|I love the city's Gothic ___.||
curious|adj|好奇的|Wanting to know or learn about something.~Eager to find out.|Children are naturally ___.|inquisitive,interested|
bead|n|珠子|A small ball of glass or wood with a hole through it, used for jewellery.~A small round object threaded onto a string.|She wore a necklace of glass ___s.||beads
impurity|n|杂质|A substance mixed with another and making it less pure.~Something unwanted in water or metal.|Filters remove ___ies from water.|contaminant,pollutant|impurities
allergic|adj|过敏的|Having a bad reaction to something you eat, touch or breathe.~Becoming ill from contact with something such as pollen.|I'm ___ to cats.|hypersensitive|
epistemology|n|认识论|The branch of philosophy that studies knowledge and how we know things.~The theory of knowledge.|___ asks how we can be sure that something is true.||
reaction|n|反应|What you do or feel because of something that has happened.|What was her ___ to the news?|response|reactions
technology|n|技术|Scientific knowledge used to make practical machines and tools.~Modern machines and devices.|Modern ___ has changed how we communicate.||technologies
headaches|n|头痛|Pains you feel inside your skull.~Aches above the eyes or at the back of the skull, often from stress.|Too much screen time gives me ___.|migraines|headache
birch|n|桦树|A tree with thin, white bark.~A tall slim tree with silver-white bark.|The forest is full of silver ___ trees.||birches
puddle|n|水坑|A small pool of rainwater on the ground.~Water lying on a road after rain.|The children jumped in the ___s.|pool|puddles
dwellings|n|住所|Houses or places where people live.|Ancient stone ___ were found here.|homes,houses,residences,abodes|dwelling
within|prep|在……之内|Inside a period of time or a limit.~Before the end of a period of time.|You will get a reply ___ 24 hours.|inside,in|
rollicking|adj|欢闹的；欢快的|Noisy, lively and enjoyable.~Full of cheerful fun.|We had a ___ evening with old friends.|lively,boisterous|
restoration|n|修复；恢复|The work of repairing an old building or painting.~Bringing back something that existed before.|The ___ of the church took ten years.|renovation,repair|restorations
disregarded|v|忽视（过去分词）|Ignored or paid no attention to.~Treated as unimportant.|My advice was completely ___.|ignored,overlooked,neglected|disregard
medium|n|媒介；手段|A way of communicating or expressing something.~A means of passing on information, such as TV or radio.|Television is a powerful ___.|means,channel,vehicle|media
tube|n|管子|A long hollow pipe.~A soft container you squeeze, e.g. for toothpaste.|Air passes through a plastic ___.|pipe|tubes
coastal|adj|沿海的|On or near the sea shore.~By the sea.|They live in a ___ town.|seaside,littoral|
filter|n|过滤器|A device that removes unwanted substances from liquid or air.~Something that cleans water as it passes through.|Change the water ___ every month.||filters
buried|adj|被埋的|Put under the ground.~Covered with earth.|They found ___ treasure.|hidden,underground|bury
trace|n|痕迹|A small sign that something has existed or happened.~A very small amount.|The ship disappeared without a ___.|sign,mark,trail,hint|traces
minerals|n|矿物质|Natural substances such as iron or calcium found in rocks or food.~Substances from the earth that the body needs.|Fruit is rich in vitamins and ___.||mineral
exhibition|n|展览|A public show of art or objects.~An event where things are displayed.|We went to an art ___.|exhibit,show,display,exposition|exhibitions
tape|n|胶带|A narrow strip of sticky material for holding things together.~A sticky strip used to seal boxes.|Seal the box with ___.||tapes
sediments|n|沉积物|Sand, stones and mud carried by water and left at the bottom of rivers or lakes.~Material that sinks and settles at the bottom.|___ build up at the bottom of the river.|deposits,silt|sediment
folk|adj|民间的|Traditional and typical of ordinary people in a region.~Passed down by ordinary people over generations.|She sings Irish ___ songs.|traditional|
wonder|v|想知道|To think about something and want to know more about it.~To ask yourself something.|I ___ why she left so early.|ponder|wonders,wondered,wondering
property|n|财产；房产|Things that someone owns, especially land or buildings.~A house or piece of land.|___ prices are rising fast.|possessions,real estate,belongings|properties
digestive|adj|消化的|Relating to the process of breaking down food in the body.~Connected with the stomach and gut.|The ___ system turns food into energy.|gastric|
beige|adj|米色的|Pale brownish-cream in colour.|She wore a ___ coat.|cream,fawn|
apparatus|n|器械；装置|The equipment used for a particular activity.~A set of tools for a purpose.|Divers need special breathing ___.|equipment,device,gear|
crow|n|乌鸦|A large black bird with a loud harsh call.~A big all-black bird.|A ___ was sitting on the fence.||crows
umpire|n|裁判|A person who makes sure players follow the rules, especially in tennis or cricket.~An official who judges a match.|The ___ called the ball out.|referee,judge|umpires
frequency|n|频率|How often something happens.~The rate at which something happens.|The ___ of earthquakes is increasing.|rate,regularity|frequencies
populous|adj|人口稠密的|Having a large number of people living in it.~Crowded with inhabitants.|India is the most ___ country in the world.|crowded,densely populated|
safeguard|v|保护|To protect something from harm or loss.~To keep something from being harmed or lost.|We must ___ our personal data.|protect,defend,preserve,shield|safeguards,safeguarded,safeguarding
omitting|v|省略；遗漏|Leaving out or not including something.~Forgetting to do or include something.|By ___ the date, he made the letter confusing.|excluding,dropping|omit,omits,omitted
script|n|剧本；脚本|The written words of a play or film.~The text that actors learn.|The actor learned his ___.|screenplay|scripts
antibiotic|n|抗生素|A medicine that kills bacteria.~A drug used to treat infections.|The doctor gave me ___s for the infection.||antibiotics
adulteration|n|掺假|Making food or drink worse by adding cheaper or harmful substances.~Mixing something into a product to make it impure.|Milk ___ is a serious problem.|contamination|
smuggling|n|走私|Secretly and illegally taking goods into or out of a country.~Moving goods across a border against the law.|Drug ___ is a serious crime.|trafficking|smuggle
debut|n|首次亮相|The first public appearance of a performer or a product.~A first performance.|She made her ___ at the age of 16.|first appearance,premiere|debuts,début
performance|n|表现；业绩~演出|How well a person or thing does something.~An act of entertaining an audience.|Her ___ at school has improved.~The band gave a great ___.|achievement,results~show,concert|performances
regularly|adv|定期地；经常|Often and at fixed times.|You should exercise ___.|frequently,routinely,often,habitually|
flexibly|adv|灵活地|In a way that can change easily to suit different situations.|We need to work more ___.|adaptably|
efficiency|n|效率|The ability to work well without wasting time or energy.~Getting good results with little waste.|The new system improved ___.|productivity|
prestigious|adj|有声望的|Respected and admired as very important or of high quality.~Having a high status.|She studied at a ___ university.|renowned,distinguished,eminent,esteemed,reputable,famous|
tongue|n|舌头|The soft part inside your mouth that moves when you speak and taste.~The organ in your mouth used for tasting.|Don't burn your ___ on the hot soup!||tongues
criteria|n|标准（复数）|Standards used to judge or decide something.~The rules for making a decision.|What are the ___ for selection?|standards,requirements,benchmarks|criterion
brochures|n|宣传小册子|Thin magazines with pictures that advertise products or holidays.~Booklets giving information about a company or trip.|We picked up some travel ___.|leaflets,pamphlets,booklets|brochure
destruction|n|破坏；毁灭|The act of damaging something so badly that it no longer exists.|The ___ of the rainforest continues.|devastation,ruin,demolition|
sane|adj|神志正常的|Having a healthy mind; not mentally ill.~Sensible and reasonable.|No ___ person would do that.|rational,sensible,reasonable|
magnet|n|磁铁|A piece of iron that attracts other metal objects.~Something that pulls metal towards it.|She stuck the note to the fridge with a ___.||magnets
pod|n|豆荚|The long thin case containing the seeds of plants such as peas.~The shell that peas grow in.|Peas grow in a ___.|shell,husk|pods
elective|n|选修课|A course that students can choose to take.~An optional subject.|She took art as an ___.|optional course,option|electives
algorithms|n|算法|Sets of rules or steps that a computer follows to solve a problem.~Step-by-step procedures for calculations.|Search engines use complex ___.||algorithm
aggressive|adj|好斗的；有攻击性的|Behaving in an angry, violent way towards others.~Ready to attack.|The dog became ___ when strangers came near.|hostile,violent,combative,belligerent|
repercussions|n|（尤指负面的）后果；影响|Unexpected, usually bad effects of an action or event.~Results that follow and spread.|The decision had serious ___.|consequences,effects,results,impact|repercussion
indicator|n|指标；迹象|A sign that shows what something is like or how it is changing.|Unemployment is a key economic ___.|sign,measure,signal,index|indicators
factual|adj|基于事实的|Containing only true information, not opinions.~Based on real events.|The report is purely ___.|true,accurate,objective|
amusing|adj|有趣的；好笑的|Funny and entertaining.~Making you laugh.|It was an ___ story.|funny,entertaining,humorous|
incentive|n|激励；动机|Something that encourages a person to do something.~A reward that makes people work harder.|Tax cuts are an ___ for businesses to invest.|motivation,encouragement,stimulus,inducement|incentives
insistence|n|坚持|Firmly demanding something or saying that something is true.~Refusing to accept no.|At my mother's ___, I wore a coat.|demand|
intern|n|实习生|A student or recent graduate working for a short time to gain experience.~A trainee in a company.|She works as an ___ at a law firm.|trainee|interns
appreciation|n|感激~欣赏|A feeling of being grateful.~Understanding the value of something.|He showed his ___ with a gift.~She has a deep ___ of music.|gratitude,thanks~understanding,recognition|
illiterate|adj|文盲的|Unable to read or write.~Not having learned to read.|Many adults in the village were ___.||
courtesy|n|礼貌|Polite behaviour that shows respect.|It is common ___ to say thank you.|politeness,civility,respect,manners|
obstacle|n|障碍|Something that blocks the way or makes progress difficult.~A problem in your path.|Fear is the biggest ___ to success.|barrier,hurdle,impediment,obstruction|obstacles
imitate|v|模仿|To copy someone's behaviour or speech.~To do the same as someone else.|Children ___ their parents.|copy,mimic,emulate|imitates,imitated,imitating
feminism|n|女权主义|The belief that women should have the same rights and opportunities as men.~A movement for women's equality.|___ changed attitudes to women at work.||
stun|v|使震惊|To shock or surprise someone very much.~To make someone unable to react for a moment.|The news will ___ everyone.|shock,astonish,amaze,stagger|stuns,stunned,stunning
portraits|n|肖像|Paintings or photographs of people.~Pictures of a person's face.|The gallery has ___ of kings and queens.|pictures,paintings|portrait
soldier|n|士兵|A member of an army.~Someone who fights in a war.|The ___ fought bravely.|serviceman|soldiers
rare|adj|稀有的；罕见的|Not common; not happening often.|This is a ___ plant.|uncommon,unusual,scarce,infrequent|
lake|n|湖|A large area of water surrounded by land.~A big body of still fresh water.|We swam in the ___.||lakes
axe|n|斧头|A tool with a heavy blade on a long handle, used for cutting wood.~What you chop trees with.|He chopped the tree with an ___.|hatchet|axes
cooperation|n|合作|Working together to achieve something.~Helping each other.|Thank you for your ___.|collaboration,teamwork|co-operation
poverty|n|贫穷|The state of being very poor.~Not having enough money for basic needs.|Millions of people live in ___.|hardship,deprivation,need|
arbitrary|adj|任意的；武断的|Based on chance or personal feeling rather than reason.~Not based on a plan or rule.|The decision seemed ___.|random,unreasonable,capricious|
hereditary|adj|遗传的|Passed from parents to children through the genes.|The disease is ___.|genetic,inherited,inheritable|
fresco|n|湿壁画|A picture painted on wet plaster on a wall.~A wall painting.|The church has beautiful ___es.|mural|frescoes,frescos
practised|adj|熟练的|Good at something because you have done it often.|She's a ___ public speaker.|experienced,skilled,expert,seasoned|
vegetarian|n|素食者|A person who does not eat meat or fish.~Someone who eats only plant foods and sometimes eggs or milk.|I've been a ___ for years.||vegetarians
starch|n|淀粉|A white substance in foods such as potatoes, bread and rice.~A carbohydrate found in grains and potatoes.|Potatoes are high in ___.|carbohydrate|
hole|n|洞|An empty space or opening in something.|There's a ___ in my sock.|gap,opening,hollow|holes
luxury|n|奢侈；奢华|Great comfort, especially when it is expensive.~Something expensive that you enjoy but do not need.|They live in ___.|opulence,extravagance,splendour,splendor|luxuries
anniversary|n|周年纪念日|The date on which something important happened in a previous year.~A yearly celebration of a past event.|Our wedding ___ is in June.||anniversaries
reveal|v|揭示；透露|To make known something that was secret or unknown.~To show something that was hidden.|The study ___s that most students sleep too little.~She refused to ___ her age.|disclose,expose,uncover,show|reveals,revealed,revealing
resources|n|资源|Supplies of money, materials, people or energy that can be used.~Useful things such as oil, water and land that a country has.|The school does not have enough ___ to buy new computers.~The country is rich in natural ___.|assets,supplies,means|resource
electricity|n|电；电力|Energy that powers lights, heating and machines.~The power supply to a building.|The storm cut off the ___.|power|
`;
  const fold = s => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[‘’ʼ]/g, "'").toLowerCase().trim().replace(/\s+/g, ' ');
  const list = s => (s || '').split(',').map(x => x.trim()).filter(Boolean);
  const POS = {n: 'noun', v: 'verb', adj: 'adjective', adv: 'adverb', prep: 'preposition'};
  const entries = {}, alias = {};
  for (const raw of BANK.split('\n')) {
    const line = raw.trim(); if (!line) continue;
    if (/^[^|]+=[^|]+$/.test(line)) { const [a, b] = line.split('='); alias[fold(a)] = fold(b); continue; }
    const [w, pos, zh, defs, ctx, acc, forms] = line.split('|');
    const d = defs.split('~').map(x => x.trim());
    const z = zh.split('~'), c = (ctx || '').split('~'), a = (acc || '').split('~');
    entries[fold(w)] = {
      w: w.trim(), pos: POS[pos] || pos,
      defs: d.map((text, i) => ({text, zh: (z[i] || z[0]).trim(), ctx: (c[i] || c[0] || '').trim(), syn: list(a.length > 1 ? a[i] : a[0])})),
      forms: list(forms)
    };
  }
  // Notebook word → bank key (case folded; aliases point at a shared line).
  function keyOf(word) {
    const k = fold(word).replace(/[.。]+$/, '');
    if (Object.prototype.hasOwnProperty.call(entries, k)) return k;
    if (Object.prototype.hasOwnProperty.call(alias, k)) return alias[k];
    return null;
  }
  function entry(word) { const k = keyOf(word); return k ? entries[k] : null; }
  // Why a notebook entry is not asked: phrase, or no reviewed definition yet.
  function gap(word) {
    if (keyOf(word)) return '';
    return /\s|=|\//.test(String(word).trim()) ? 'phrase' : 'pending';
  }

  /* ---------- judging ----------
     Result codes: ind 独立回忆成功 · hint 提示后想起 · spell 拼写待巩固 · syn 意思符合，目标词待复测
     · none 未能回忆. "题目有歧义" is never decided automatically: the learner flags it. */
  function judge(e, defIdx, typed, opts) {
    opts = opts || {};
    const RV = opts.RV || scope.IELTSReview;
    const got = fold(typed);
    if (!got) return {code: 'none', blank: true};
    const targets = [e.w].concat(e.forms);
    const g = RV.grade(got, targets);
    if (g.ok && g.kind !== 'format') return {code: opts.hinted ? 'hint' : 'ind', form: fold(g.want) !== fold(e.w) ? g.want : '', variant: g.kind === 'variant'};
    if (g.ok) return {code: 'spell', format: true};                        // letters right, space / hyphen wrong
    const infl = new Set();
    for (const t of targets) for (const f of RV.inflections(t)) infl.add(fold(f));
    if (infl.has(got)) return {code: opts.hinted ? 'hint' : 'ind', form: typed.trim()};
    const def = e.defs[defIdx] || e.defs[0];
    for (const s of def.syn) {                                            // only the table for the wording shown
      const forms = new Set([fold(s)]); for (const f of RV.inflections(s)) forms.add(fold(f));
      if (forms.has(got) || RV.grade(got, [s]).ok) return {code: 'syn', syn: s};
    }
    // Close to the target's letters: the word was recalled, the spelling was not.
    let best = 99;
    for (const t of targets) best = Math.min(best, RV.distance(got.replace(/[^a-z' -]/g, ''), fold(t)));
    const len = fold(e.w).length, room = len <= 4 ? 1 : len <= 8 ? 2 : 3;
    if (best <= room && got[0] === fold(e.w)[0] || best <= 1) return {code: 'spell', dist: best};
    return {code: 'none'};
  }
  // First-letter hint: shape of the answer without giving it away.
  function shape(w) { return String(w).split('').map((ch, i) => i === 0 ? ch : /[a-z]/i.test(ch) ? '_' : ch).join(' '); }

  const api = {entries, alias, keyOf, entry, gap, judge, shape, fold, size: () => Object.keys(entries).length};
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }
  scope.IELTSEdef = api;
})(typeof window === 'undefined' ? globalThis : window);
