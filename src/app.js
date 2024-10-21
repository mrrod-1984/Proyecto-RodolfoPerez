import express from 'express';
import productsRouter from './routes/products.js';
import cartsRouter from './routes/carts.js';

const app = express();

app.use(express.json());

// Routers
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Configurar el puerto
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
