import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const EASY_QUESTIONS = [
  { content: "What is the capital of Nigeria?", options: ["Lagos", "Abuja", "Kano", "Ibadan"], answerIndex: 1, category: "General" },
  { content: "Which of these is a popular Nigerian dish?", options: ["Sushi", "Jollof Rice", "Pizza", "Tacos"], answerIndex: 1, category: "Food" },
  { content: "Who is the 'Giant of Africa'?", options: ["South Africa", "Egypt", "Nigeria", "Kenya"], answerIndex: 2, category: "General" },
  { content: "What is the official language of Nigeria?", options: ["Yoruba", "Hausa", "English", "Igbo"], answerIndex: 2, category: "General" },
  { content: "Which currency is used in Nigeria?", options: ["Dollar", "Naira", "Cedi", "Pound"], answerIndex: 1, category: "Finance" },
  { content: "How many states are in Nigeria?", options: ["30", "32", "36", "38"], answerIndex: 2, category: "General" },
  { content: "Which ocean borders Nigeria to the south?", options: ["Pacific", "Atlantic", "Indian", "Arctic"], answerIndex: 1, category: "Geography" },
  { content: "What is the largest city in Nigeria by population?", options: ["Abuja", "Ibadan", "Lagos", "Port Harcourt"], answerIndex: 2, category: "Geography" },
  { content: "Which of these is a Nigerian airline?", options: ["Air Peace", "Emirates", "Delta", "Lufthansa"], answerIndex: 0, category: "Travel" },
  { content: "What color is the Nigerian flag?", options: ["Red and White", "Green and White", "Blue and Yellow", "Black and Gold"], answerIndex: 1, category: "General" },
  { content: "Which fruit is known as the 'King of Fruits' in Nigeria?", options: ["Apple", "Mango", "Pineapple", "Orange"], answerIndex: 1, category: "Nature" },
  { content: "What does 'Naira' mean?", options: ["Money", "Gold", "River", "Nigeria"], answerIndex: 3, category: "Finance" },
  { content: "Which city is known as the 'Center of Excellence'?", options: ["Abuja", "Lagos", "Enugu", "Kaduna"], answerIndex: 1, category: "General" },
  { content: "What is the name of the Nigerian film industry?", options: ["Hollywood", "Nollywood", "Bollywood", "Tollywood"], answerIndex: 1, category: "Entertainment" },
  { content: "Which bird is on the Nigerian Coat of Arms?", options: ["Dove", "Eagle", "Parrot", "Peacock"], answerIndex: 1, category: "General" }
];

const MEDIUM_QUESTIONS = [
  { content: "In what year did Nigeria become a republic?", options: ["1960", "1963", "1970", "1999"], answerIndex: 1, category: "History" },
  { content: "Who was the first female pilot in Nigeria?", options: ["Chinyere Kalu", "Stella Oduah", "Kafayat Sanni", "Tolulope Arotile"], answerIndex: 0, category: "History" },
  { content: "Which Nigerian author wrote 'Things Fall Apart'?", options: ["Wole Soyinka", "Chinua Achebe", "Chimamanda Adichie", "Ben Okri"], answerIndex: 1, category: "Literature" },
  { content: "Which river is the longest in Nigeria?", options: ["River Benue", "River Niger", "River Cross", "River Ogun"], answerIndex: 1, category: "Geography" },
  { content: "What is the nickname of the Nigerian national football team?", options: ["The Lions", "The Eagles", "The Super Eagles", "The Stars"], answerIndex: 2, category: "Sports" },
  { content: "Which Nigerian musician is known as the 'African Giant'?", options: ["Wizkid", "Davido", "Burna Boy", "Olamide"], answerIndex: 2, category: "Music" },
  { content: "What is the highest mountain in Nigeria?", options: ["Mount Patti", "Chappal Waddi", "Zuma Rock", "Olumo Rock"], answerIndex: 1, category: "Geography" },
  { content: "In which city is the 'National Mosque' located?", options: ["Lagos", "Kano", "Abuja", "Kaduna"], answerIndex: 2, category: "General" },
  { content: "Who was the first Nigerian to win a Nobel Prize?", options: ["Chinua Achebe", "Wole Soyinka", "Nnamdi Azikiwe", "Goodluck Jonathan"], answerIndex: 1, category: "History" },
  { content: "What is the main export of Nigeria?", options: ["Cocoa", "Gold", "Crude Oil", "Coal"], answerIndex: 2, category: "Economy" },
  { content: "Which bridge is the longest in Nigeria?", options: ["Eko Bridge", "Third Mainland Bridge", "Carter Bridge", "Niger Bridge"], answerIndex: 1, category: "Infrastructure" },
  { content: "What was the capital of Nigeria before Abuja?", options: ["Calabar", "Lagos", "Enugu", "Ibadan"], answerIndex: 1, category: "History" },
  { content: "Which state is known as the 'Home of Peace and Tourism'?", options: ["Plateau", "Bauchi", "Cross River", "Kaduna"], answerIndex: 0, category: "Travel" },
  { content: "Who is the 'Father of Nigerian Nationalism'?", options: ["Obafemi Awolowo", "Herbert Macaulay", "Nnamdi Azikiwe", "Ahmadu Bello"], answerIndex: 1, category: "History" },
  { content: "What does the 'Zuma Rock' represent in Nigeria?", options: ["Fertility", "Strength", "Gateway to Abuja", "Unity"], answerIndex: 2, category: "Geography" }
];

const HARD_QUESTIONS = [
  { content: "Which Nigerian scientist is credited with inventing the world's fastest supercomputer in 1989?", options: ["Philip Emeagwali", "Bartholomew Nnaji", "Jelani Aliyu", "Kunle Olukotun"], answerIndex: 0, category: "Science" },
  { content: "What was the name of the first Nigerian satellite launched into space?", options: ["NigeriaSat-1", "NigComSat-1", "EduSat-1", "Hope-1"], answerIndex: 0, category: "Tech" },
  { content: "Who was the first Nigerian military Head of State?", options: ["Murtala Muhammed", "Johnson Aguiyi-Ironsi", "Yakubu Gowon", "Olusegun Obasanjo"], answerIndex: 1, category: "History" },
  { content: "Which Nigerian state has the smallest land mass?", options: ["Lagos", "Anambra", "Abia", "Ekiti"], answerIndex: 0, category: "Geography" },
  { content: "What is the name of the pre-colonial empire located in present-day Edo State?", options: ["Oyo Empire", "Benin Empire", "Kanem-Bornu", "Sokoto Caliphate"], answerIndex: 1, category: "History" },
  { content: "Who was the first Nigerian to be appointed as the Director-General of the WTO?", options: ["Ngozi Okonjo-Iweala", "Amina Mohammed", "Oby Ezekwesili", "Kemi Adeosun"], answerIndex: 0, category: "History" },
  { content: "In what year did Nigeria switch from driving on the left to driving on the right?", options: ["1970", "1972", "1975", "1980"], answerIndex: 1, category: "History" },
  { content: "Which Nigerian architect designed the National Arts Theatre in Lagos?", options: ["James Cubitt", "Bayo Adeola", "Technoexporststroy (Bulgaria)", "Arc. Fola Adeola"], answerIndex: 2, category: "Architecture" },
  { content: "What is the oldest university in Nigeria?", options: ["University of Lagos", "University of Ibadan", "Ahmadu Bello University", "University of Nigeria"], answerIndex: 1, category: "Education" },
  { content: "Which ethnic group is primarily associated with the 'Nze na Ozo' title?", options: ["Yoruba", "Hausa", "Igbo", "Efik"], answerIndex: 2, category: "Culture" },
  { content: "Who was the first Nigerian to play in the NBA?", options: ["Hakeem Olajuwon", "Michael Olowokandi", "Giannis Antetokounmpo", "Ike Diogu"], answerIndex: 0, category: "Sports" },
  { content: "Which treaty ended the Nigerian Civil War in 1970?", options: ["The Accra Accord", "The Aburi Accord", "No formal treaty (Unconditional surrender)", "The Lagos Peace Pact"], answerIndex: 2, category: "History" },
  { content: "What was the first capital city of the Southern Protectorate of Nigeria?", options: ["Lagos", "Calabar", "Asaba", "Warri"], answerIndex: 1, category: "History" },
  { content: "Which Nigerian earned the nickname 'The Mathematical' in football?", options: ["Segun Odegbami", "Jay-Jay Okocha", "Nwankwo Kanu", "Stephen Keshi"], answerIndex: 0, category: "Sports" },
  { content: "Who was the first Nigerian to be knighted by the British Empire?", options: ["Sir Louis Mbanefo", "Sir Abubakar Tafawa Balewa", "Sir Adeyemo Alakija", "Sir Nnamdi Azikiwe"], answerIndex: 2, category: "History" }
];

async function main() {
  console.log('--- NUKING OLD QUESTIONS ---');
  await prisma.question.deleteMany({});
  
  console.log('--- SEEDING EASY QUESTIONS ---');
  await prisma.question.createMany({
    data: EASY_QUESTIONS.map(q => ({ ...q, difficulty: 'EASY' }))
  });

  console.log('--- SEEDING MEDIUM QUESTIONS ---');
  await prisma.question.createMany({
    data: MEDIUM_QUESTIONS.map(q => ({ ...q, difficulty: 'MEDIUM' }))
  });

  console.log('--- SEEDING HARD QUESTIONS ---');
  await prisma.question.createMany({
    data: HARD_QUESTIONS.map(q => ({ ...q, difficulty: 'HARD' }))
  });

  console.log('--- SEEDING COMPLETE! ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
