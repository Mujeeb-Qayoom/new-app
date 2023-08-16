require('dotenv').config();

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
//const { PrismaClient } = require('./generated/client');
const {PrismaClient } = require('./prisma/generated/client');


const prisma = new PrismaClient();
const app = express();

app.use(express.json());

// Signup route
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

 try {
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
    console.error(error);
     res.status(500).json({ message: 'Error creating user' });
 }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, 'your-secret-key', {
      expiresIn: '1h',
    });

    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

app.get('/users', async(req,res)=>{
    
const users = await prisma.user.findMany()
console.log(users);

if(users) {
    return res.status(200).json({
        users : users
    })
}

else{
    return res.status(404).json({message : "no data found"})
}

})
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
