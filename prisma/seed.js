const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const destinationData = [
    {
        id: 1,
        name: 'Location 1',
        address: '1234 Main St',
        phone: '415-555-1212',
    },
    {
        id: 2,
        name: 'Location 2',
        address: '5678 Elm St',
        phone: '415-555-3434',
    },
    {
        id: 3,
        name: 'Location 3',
        address: '9101 Oak St',
        phone: '415-555-5656',
    },
];

const restaurantData = [
  {
    id: 1,
    name: 'Panera Bread',
    address: '1234 Main St',
    phone: '415-555-1212',
    notes: 'Good for lunch',
    foods: [
      {
        id: 1,
        name: 'Sandwich',
        description: 'A delicious sandwich',
        price: 5.99,
        category: 'Lunch',
        restaurantId: 1
      },
      {
        id: 2,
        name: 'Salad',
        description: 'A delicious salad',
        price: 7.99,
        category: 'Lunch',
        restaurantId: 1
      }
    ]
  },
  {
    id: 2,
    name: 'Firehouse Subs',
    address: '5678 Elm St',
    phone: '415-555-3434',
    notes: 'Good for lunch',
    foods: [
      {
        id: 3,
        name: 'Sub',
        description: 'A delicious sub',
        price: 7.99,
        category: 'Lunch',
        restaurantId: 2
      }
    ]
  }
];

async function seedDatabase() {
  // Upsert destination data
  for (const destination of destinationData) {
    await prisma.destination.upsert({
      where: { id: destination.id },
      update: {
        name: destination.name,
        address: destination.address,
        phone: destination.phone
      },
      create: {
        name: destination.name,
        address: destination.address,
        phone: destination.phone
      }
    });
  }

  // Upsert restaurant data
  for (const restaurant of restaurantData) {
    const upsertRestaurant = await prisma.restaurant.upsert({
      where: { id: restaurant.id },
      update: {},
      create: {
        name: restaurant.name,
        address: restaurant.address,
        phone: restaurant.phone,
        notes: restaurant.notes,
        foods: {
          create: restaurant.foods.map(food => ({
            name: food.name,
            description: food.description,
            price: food.price,
            category: food.category,
          }))
        }
      },
      include: {
        foods: true
      }
    });

    for (const food of restaurant.foods) {
      await prisma.food.upsert({
        where: { id: food.id },
        update: {
          name: food.name,
          description: food.description,
          price: food.price,
          category: food.category,
          restaurantId: food.restaurantId
        },
        create: {
          name: food.name,
          description: food.description,
          price: food.price,
          category: food.category,
          restaurantId: food.restaurantId
        }
      });
    }
  }
}

seedDatabase()
  .then(() => {
    console.log('Database seeded successfully');
  })
  .catch((error) => {
    console.error('Error seeding database:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });