import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const questions = [
    // Medium Questions for Duel
    {
      content: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      answerIndex: 2,
      difficulty: "MEDIUM",
      category: "Geography"
    },
    {
      content: "Which planet is known as the Red Planet?",
      options: ["Earth", "Mars", "Jupiter", "Saturn"],
      answerIndex: 1,
      difficulty: "MEDIUM",
      category: "Science"
    },
    {
      content: "Who wrote 'Romeo and Juliet'?",
      options: ["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"],
      answerIndex: 1,
      difficulty: "MEDIUM",
      category: "Literature"
    },
    {
      content: "What is the largest ocean on Earth?",
      options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
      answerIndex: 3,
      difficulty: "MEDIUM",
      category: "Geography"
    },
    {
      content: "What is the square root of 64?",
      options: ["6", "7", "8", "9"],
      answerIndex: 2,
      difficulty: "MEDIUM",
      category: "Math"
    },
    // Hard Questions for Pool
    {
      content: "Which African country was the first to gain independence from colonial rule?",
      options: ["Ghana", "Nigeria", "Ethiopia", "Egypt"],
      answerIndex: 0,
      difficulty: "HARD",
      category: "History"
    },
    {
      content: "What is the capital city of Kazakhstan?",
      options: ["Almaty", "Astana", "Bishkek", "Tashkent"],
      answerIndex: 1,
      difficulty: "HARD",
      category: "Geography"
    },
    {
      content: "Which element has the highest melting point?",
      options: ["Iron", "Tungsten", "Carbon", "Osmium"],
      answerIndex: 1,
      difficulty: "HARD",
      category: "Science"
    }
  ]

  console.log('Seeding questions...')
  
  for (const q of questions) {
    await prisma.question.create({
      data: q as any
    })
  }

  console.log('Seed completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
