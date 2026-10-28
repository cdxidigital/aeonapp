// @ts-nocheck
function create() {
  'use strict';
  const signs=[
    {element:'Fire',word:'Start',text:'Aries starts things. It is direct, impatient, and useful when you need a first step. Pause before you promise the whole journey.'},
    {element:'Earth',word:'Steady',text:'Taurus keeps what is real and pleasant. It is good at protecting a rhythm that works. Notice when comfort has turned into a rut.'},
    {element:'Air',word:'Ask',text:'Gemini learns by talking, reading, and comparing. Gather the options, then choose one idea to finish.'},
    {element:'Water',word:'Care',text:'Cancer watches who belongs and who needs looking after. Make the space feel safe, and include a clear boundary.'},
    {element:'Fire',word:'Shine',text:'Leo wants warmth, pride, and something to create. Be seen as yourself, not as a performance you resent.'},
    {element:'Earth',word:'Mend',text:'Virgo notices the small fix that makes life work. Use that eye as care. It is not a reason to pick yourself apart.'},
    {element:'Air',word:'Balance',text:'Libra looks for fairness between people. There can be more than one fair answer. Include what you actually want.'},
    {element:'Water',word:'Trust',text:'Scorpio goes under the surface: trust, privacy, and what is usually unsaid. Be honest without forcing everything into the open.'},
    {element:'Fire',word:'Widen',text:'Sagittarius wants a bigger picture: meaning, study, travel, a bet on possibility. Explore, then come back to the facts.'},
    {element:'Earth',word:'Build',text:'Capricorn builds what lasts: time, duty, and a public standard. Take one solid step, and put rest in the plan.'},
    {element:'Air',word:'Rethink',text:'Aquarius questions the usual arrangement and cares about the group. Change one default. You do not have to reinvent your whole life.'},
    {element:'Water',word:'Imagine',text:'Pisces feels what is hard to define: imagination, empathy, and a soft edge. Let it inform you, then check what is actually true.'}
  ];
  const planets={
    Sun:{topic:'Self & expression',short:'Your sense of self',text:'The Sun is the part of you that wants to feel alive and be known for something. Read it as what you are practising becoming, not a job title you were assigned.'},
    Moon:{topic:'Your inner weather',short:'Your moods and comfort',text:'The Moon is mood, memory, and what helps you feel safe. It changes fast, so an uncertain birth time can move this placement. It describes needs, not a mood you must stay in.'},
    Mercury:{topic:'Mind & conversation',short:'How you think and talk',text:'Mercury is how you learn, write, and make sense of a conversation. It is the style of your questions. It is not a score for how clever you are.'},
    Venus:{topic:'Love & connection',short:'What you enjoy and how you love',text:'Venus is taste, affection, pleasure, and what you find worth keeping close. It is a way to look at how you give and receive care, not a rule about who you should love.'},
    Mars:{topic:'Energy & intention',short:'How you go after things',text:'Mars is energy, anger, courage, and how you start. It shows a style of action. It does not decide whether you are kind.'},
    Jupiter:{topic:'Growth & possibility',short:'Where you want more',text:'Jupiter is growth, belief, learning, and generosity. It marks where you look for more room. More is not always better; check it against your real time and money.'},
    Saturn:{topic:'Work & foundations',short:'Where life asks you to be serious',text:'Saturn is time, duty, limits, and skill you build slowly. A limit here is information about the plan. It is not a verdict that you have failed.'},
    Uranus:{topic:'Change & freedom',short:'Where you need room to differ',text:'Uranus is the urge to do a familiar thing differently. It moves slowly, so its sign is shared by a whole generation. Your life is more specific than that sign.'},
    Neptune:{topic:'Imagination & meaning',short:'Where imagination gets loud',text:'Neptune is imagination, longing, and the places a story can outrun the facts. Its sign is generational. Use it for art and empathy, then check what you can check.'},
    Pluto:{topic:'Depth & renewal',short:'Where change goes deep',text:'Pluto is power, privacy, and change you cannot ignore. Its sign is shared by a generation. Read it as a question about what you are ready to outgrow, not a fate.'}
  };
  const houses=[
    {name:'Self & presence',plain:'You, as you enter the room: body, manner, and the way you start.',ask:'How do I show up before I explain myself?'},
    {name:'Resources & values',plain:'What you have and what you think is worth keeping: money, skills, and possessions.',ask:'What do I actually value, and what am I only used to?'},
    {name:'Learning & communication',plain:'Everyday talk: messages, siblings, neighbours, short trips, and how you learn.',ask:'What do I need to say plainly, and to whom?'},
    {name:'Home & belonging',plain:'Home and private life: family, roots, and the place you go to feel you belong.',ask:'What would make home feel more like mine?'},
    {name:'Creativity & pleasure',plain:'Play: romance, children, hobbies, and making something because you want to.',ask:'Where am I allowed to enjoy this, not just finish it?'},
    {name:'Routines & care',plain:'The weekday: tasks, health habits, and the work of looking after details.',ask:'Which small habit actually takes care of me?'},
    {name:'Partnership & agreements',plain:'One other person: a partner, a close collaborator, or the agreements you make.',ask:'What do I want this agreement to be, in one clear sentence?'},
    {name:'Trust & shared resources',plain:'What you merge: shared money, debt, sex, inheritance, and other people’s secrets.',ask:'What am I willing to share, and what needs to stay trusted?'},
    {name:'Perspective & exploration',plain:'The far view: study, travel, belief, and the story you tell about what life is for.',ask:'Which bigger idea am I willing to test in ordinary life?'},
    {name:'Work & public life',plain:'Your public name: career, reputation, and the role people can see.',ask:'What do I want my name to stand for?'},
    {name:'Friendship & community',plain:'Your people: friends, groups, and a future that needs more than one person.',ask:'Who is actually on my side, and what are we making?'},
    {name:'Solitude & reflection',plain:'What is quiet or unfinished: rest, privacy, endings, and the inner life.',ask:'What needs quiet, or a real ending, instead of more effort?'}
  ];
  const interpretations={
    Sun:{flow:'Let a small act of self-expression be enough. There may be room to say what you mean without making it a performance.',focus:'Choose where your attention belongs before the day chooses for you. One honest priority can be more useful than a convincing appearance of having everything together.',friction:'When expectations pull in different directions, return to what you can choose. You do not have to prove your entire identity in one conversation.'},
    Moon:{flow:'Notice the ordinary things that help you settle: a familiar meal, an unhurried conversation, a little space. Comfort can be something you practise rather than wait for.',focus:'Make room to name what you are feeling without turning it into a final conclusion. A pause can give a passing mood somewhere to move.',friction:'A feeling may be asking for attention, not immediate action. Slow the next step enough to check what you need before trying to solve everything.'},
    Mercury:{flow:'A thoughtful exchange can make an idea feel less tangled. Ask the next useful question, and leave room to be surprised by the answer.',focus:'Give one idea your full attention. Writing a few clear sentences may help you separate what you know from what you are assuming.',friction:'If a conversation feels difficult, try a simpler sentence or a better question. Checking what someone meant can save you from replying to a story they did not tell.'},
    Venus:{flow:'Let connection be specific: remember a detail, offer a small kindness, make a little time. Care does not need a grand occasion to become visible.',focus:'Consider what you actually enjoy and what you have simply become used to. A clear preference gives someone else a fair chance to meet you.',friction:'A difference in preferences does not have to become a judgement about either person. Name what matters to you and stay curious about what matters to them.'},
    Mars:{flow:'Use your energy on a step you can finish. A modest piece of progress can feel more satisfying than a dramatic plan with nowhere to begin.',focus:'Choose an intention before adding speed. You can be direct about what you want while remaining considerate about how you ask.',friction:'If effort is turning into frustration, change the size of the task. A smaller next step can protect your energy without abandoning your intention.'},
    Jupiter:{flow:'Try a wider perspective without losing sight of the ground beneath it. One useful conversation or unfamiliar idea may be enough exploration for today.',focus:'Consider what growth would mean in practical terms. Choose a question you can investigate rather than a promise you have to live up to.',friction:'More is not always the same as better. Check whether an opportunity fits your actual capacity before giving it your time.'},
    Saturn:{flow:'A little structure can make room for something you care about. Pick a boundary or routine that supports your day instead of filling every part of it.',focus:'Return to the foundations: time, agreements and a realistic next step. Consistency can be quiet and still count.',friction:'A limit may be information about your plan rather than your worth. Adjust the workload, ask for clarity or give a commitment more realistic edges.'},
    Uranus:{flow:'There may be room to do a familiar thing differently. Keep the experiment small enough that curiosity does not need to become a complete reinvention.',focus:'Notice which defaults still serve you. You can question a habit without needing to overturn your whole life today.',friction:'When change feels noisy, keep one dependable point of reference. Freedom can include choosing a slower pace.'},
    Neptune:{flow:'Make a little room for something without an immediate purpose: music, a sketch, a walk. Imagination is allowed to exist before it becomes a project.',focus:'Let an idea develop, then check the details you can check. Inspiration and discernment can work in the same room.',friction:'If a situation feels unclear, you can wait for more information. An unanswered question does not need to be filled with the most dramatic explanation.'},
    Pluto:{flow:'A quieter kind of change may begin with an honest observation. Consider one pattern you would like to meet with more choice.',focus:'Notice where you have influence and where you do not. Put your next step in the part of the situation that belongs to you.',friction:'You can loosen your grip without giving up your boundaries. Choose one response that leaves more room for your own agency.'}
  };
  const headlines={
    gentle:{flow:'Let a little ease\nfind its way in.',focus:'Come back to\nwhat matters.',friction:'You can move slowly\nand still move.'},
    direct:{flow:'Make room.\nThen make a move.',focus:'Less noise.\nMore intention.',friction:'Take a breath.\nChoose your next step.'},
    playful:{flow:'Leave a little room\nfor the good bits.',focus:'Your attention called.\nIt wants a say.',friction:'The plot can wait.\nHave some water.'}
  };
  const rituals={flow:{lean:['A generous question','A small creative act','An unhurried hello'],release:['Performing certainty','Filling every silence','Saving joy for later'],prompt:'Where did you feel a little more like yourself today?'},focus:{lean:['One clear priority','A moment of stillness','A kind boundary'],release:['An unnecessary yes','Someone else’s timetable','The perfect first draft'],prompt:'What deserves your attention, and what can wait?'},friction:{lean:['A slower response','A smaller next step','Asking for clarity'],release:['Mind-reading','Winning every point','Doing everything at once'],prompt:'What would make your next step a little kinder to you?'}};
  function reading(event,tone='gentle') {
    const kind=event?.kind||'focus',left=event?.left||'Sun',right=event?.right||'Sun';
    return {kind,topic:planets[left].topic,headline:(headlines[tone]||headlines.gentle)[kind],text:interpretations[left][kind],context:event?`${left} ${event.verb} your natal ${right}`:'A moment for deliberate reflection',ritual:rituals[kind],prompt:rituals[kind].prompt};
  }
  function guide(topic,question,chart,daily) {
    const map={self:['Sun','Moon'],connection:['Venus','Moon'],work:['Saturn','Mercury'],change:['Uranus','Mars']};
    const choices=map[topic]||map.self;
    const event=daily.events.find(e=>choices.includes(e.left))||daily.chosen[0];
    const r=reading(event),body=chart.bodies.find(b=>b.body===choices[0]);
    const prompts={self:'What feels true for you, before you consider how it will look to anyone else?',connection:'What would a clear, kind request sound like in this situation?',work:'What is the smallest useful step you can actually finish?',change:'Which part of this change is yours to choose, and which part needs time?'};
    return {event,text:r.text,prompt:prompts[topic]||prompts.self,placement:body,question:question.slice(0,500)};
  }
  return {signs,planets,houses,reading,guide};
}

export const Content = create()
