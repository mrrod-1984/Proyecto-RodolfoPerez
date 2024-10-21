import { Router } from 'express';
import fs from 'fs';

const router = Router();

// Ruta para crear un nuevo carrito
router.post('/', (req, res) => {
    let carts = JSON.parse(fs.readFileSync('carrito.json', 'utf-8'));
    const newCart = {
        id: String(Date.now()), // ID único
        products: []
    };
    
    carts.push(newCart);
    fs.writeFileSync('carrito.json', JSON.stringify(carts));
    
    res.status(201).json(newCart);
});

// Ruta para obtener productos de un carrito por ID
router.get('/:cid', (req, res) => {
    const cartId = req.params.cid;
    let carts = JSON.parse(fs.readFileSync('carrito.json', 'utf-8'));
    const cart = carts.find(c => c.id === cartId);
    
    if (cart) {
        return res.json(cart.products);
    }
    res.status(404).send({ error: 'Carrito no encontrado' });
});

// Ruta para agregar un producto a un carrito
router.post('/:cid/product/:pid', (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    let carts = JSON.parse(fs.readFileSync('carrito.json', 'utf-8'));
    let products = JSON.parse(fs.readFileSync('productos.json', 'utf-8'));
    
    const cart = carts.find(c => c.id === cartId);
    if (!cart) {
        return res.status(404).send({ error: 'Carrito no encontrado' });
    }
    
    const productExists = cart.products.find(p => p.product === productId);
    
    if (productExists) {
        productExists.quantity += 1;
    } else {
        const product = products.find(p => p.id === productId);
        if (!product) {
            return res.status(404).send({ error: 'Producto no encontrado' });
        }
        cart.products.push({ product: productId, quantity: 1 });
    }
    
    fs.writeFileSync('carrito.json', JSON.stringify(carts));
    res.json(cart);
});

export default router;
