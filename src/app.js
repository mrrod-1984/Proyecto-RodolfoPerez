import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { engine } from 'express-handlebars';
import path from 'path';
import fs from 'fs';
import productsRouter from './routes/products.js';
import cartsRouter from './routes/carts.js';

const app = express();
const server = createServer(app); // Crear el servidor HTTP
const io = new SocketIOServer(server); // Inicializar Socket.IO

// Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(path.resolve(), 'views'));


app.use(express.json());
app.use(express.static(path.join(path.resolve(), 'public')));



// Routers
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);


// vista Home
app.get('/', (req, res) => {
    res.render('index', { products: getProducts() });
});

// vista 
app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { products: getProducts() });
});




 // Socket.IO
io.on('connection', (socket) => {
    console.log('Cliente conectado');


    socket.emit('productList', getProducts());

    // agrega o elimina 
    socket.on('addProduct', (newProduct) => {
        const products = getProducts();
        products.push(newProduct);
        fs.writeFileSync('productos.json', JSON.stringify(products));
        io.emit('productList', products); 
    });

    socket.on('deleteProduct', (productId) => {
        const products = getProducts().filter(product => product.id !== productId);
        fs.writeFileSync('productos.json', JSON.stringify(products));
        io.emit('productList', products); 
    });

    // Desconexion
    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});


// Configurar el puerto
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


// obtener productos 

function getProducts() {
    try {
        const products = JSON.parse(fs.readFileSync('productos.json', 'utf-8'));
        return products;
    } catch (error) {
        console.error('Error leyendo productos:', error);
        return [];
    }
}
