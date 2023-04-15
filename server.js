import express from 'express'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import * as url from 'url';
import bcrypt from 'bcryptjs';
import * as jwtJsDecode from 'jwt-js-decode';
import base64url from "base64url";
import SimpleWebAuthnServer from '@simplewebauthn/server';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const app = express()
app.use(express.json())

const adapter = new JSONFile(__dirname + '/auth.json');
const db = new Low(adapter);
await db.read();
db.data ||= { users: [] }

const rpID = "localhost";
const protocol = "http";
const port = 5050;
const expectedOrigin = `${protocol}://${rpID}:${port}`;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

const findUser = (email) => {
    return db.data.users.find(user => user.email === email);
}

// ADD HERE THE REST OF THE ENDPOINTS
// TODO: authorization with token that is sent to the client
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const userExisted = findUser(email);
  if (userExisted) {
    const passwordCorrect = bcrypt.compareSync(password, userExisted.password);
    if (passwordCorrect) {
      // const token = jwt.sign({ email: userExisted.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.send({ ok: true, name: userExisted.name, email: userExisted.email });
      return;
    }
  }
  res.send({ ok: false, message: 'Credentials are wrong' });
})

app.post('/auth/register', (req, res) => {
    const { name, password, email } = req.body;
    const userExisted = findUser(email);
    if (userExisted) {
      res.send({ ok: false, message: 'User already exists' });
      return;
    }
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const user = {
        email,
        name,
        password: hash,
    };
    db.data.users.push(user);
    db.write();
    res.json({ ok: true, name: user.name, email: user.email });
})

app.post('/auth/google-login', (req, res) => {
  const { credential } = req.body;
  const jwt = jwtJsDecode.jwtDecode(credential);
  let user = {
    email: jwt.payload.email,
    name: `${jwt.payload.given_name} ${jwt.payload.family_name}`,
    password: null,
  }
  const existingUser = findUser(user.email);
  if (existingUser) {
    if (existingUser.provider?.google) {
      return res.send({ ok: true, name: existingUser.name, email: existingUser.email });
    }
    user = {
      ...existingUser,
      provider: {
        ...(existingUser.provider ?? {}),
        google: jwt.payload.aud,
      },
    }
    db.data.users = db.data.users.map(u => u.email === user.email ? user : u);
    db.write();
    return res.send({ ok: true, name: user.name, email: user.email });
  }

  db.data.users.push({
    ...user,
    provider: {
      google: jwt.payload.aud,
    },
  });
  db.write();
  res.send({ ok: true, name: user.name, email: user.email });
})

app.get("*", (req, res) => {
    res.sendFile(__dirname + "public/index.html"); 
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
});

