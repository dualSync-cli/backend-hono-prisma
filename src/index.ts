import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import prisma from './lib/prisma';

const app = new Hono();

// Health & Welcome
app.get('/', (c) => c.json({ message: 'Welcome to the API' }));
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Users CRUD
app.get('/users', async (c) => {
    const users = await prisma.user.findMany();
    return c.json(users);
});

app.get('/users/:id', async (c) => {
    const id = parseInt(c.req.param('id'));
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
        return c.json({ error: 'User not found' }, 404);
    }
    return c.json(user);
});

app.post('/users', async (c) => {
    const body = await c.req.json();
    const user = await prisma.user.create({
        data: { email: body.email, name: body.name },
    });
    return c.json(user, 201);
});

app.put('/users/:id', async (c) => {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    const user = await prisma.user.update({
        where: { id },
        data: { email: body.email, name: body.name },
    });
    return c.json(user);
});

app.delete('/users/:id', async (c) => {
    const id = parseInt(c.req.param('id'));
    await prisma.user.delete({ where: { id } });
    return c.body(null, 204);
});

const port = Number(process.env.PORT) || 3000;

console.log(`🔥 Server running on http://localhost:${port}`);

serve({
    fetch: app.fetch,
    port,
});
