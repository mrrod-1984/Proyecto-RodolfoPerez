import { Router } from 'express';
import fs from 'fs';

const router = Router();



// Ruta para obtener todos los productos
router.get('/', (req, res) => {
    const limit = req.query.limit;
    const products = JSON.parse(fs.readFileSync('productos.json', 'utf-8'));
    
    if (limit) {
        return res.json(products.slice(0, limit));
    }
    res.json(products);
});

// Ruta para obtener un producto por su ID
router.get('/:pid', (req, res) => {
    const productId = req.params.pid;
    const products = JSON.parse(fs.readFileSync('productos.json', 'utf-8'));
    const product = products.find(p => p.id === productId);
    
    if (product) {
        return res.json(product);
    }
    res.status(404).send({ error: 'Producto no encontrado' });
});

// Ruta para agregar un nuevo producto
router.post('/', (req, res) => {
    const { title, description, code, price, stock, category, thumbnails } = req.body;

    // Crear un arreglo con los campos obligatorios faltantes
    let missingFields = [];
    
    if (!title) missingFields.push('title');
    if (!description) missingFields.push('description');
    if (!code) missingFields.push('code');
    if (!price) missingFields.push('price');
    if (!stock) missingFields.push('stock');
    if (!category) missingFields.push('category');
    
    // Si faltan campos, devolver un error con los campos que faltan
    if (missingFields.length > 0) {
        return res.status(400).send({ error: `Faltan los siguientes campos obligatorios: ${missingFields.join(', ')}` });
    }
    
    // Leer el archivo de productos
    let products = JSON.parse(fs.readFileSync('productos.json', 'utf-8'));

    // Crear un nuevo producto
    const newProduct = {
        id: String(Date.now()), // Generar un ID único
        title,
        description,
        code,
        price,
        status: true, // Valor por defecto
        stock,
        category,
        thumbnails: thumbnails || [] // Valor por defecto si no hay imágenes
    };

    // Añadir el nuevo producto a la lista de productos
    products.push(newProduct);
    fs.writeFileSync('productos.json', JSON.stringify(products));

    // Responder con el nuevo producto creado
    res.status(201).json(newProduct);
});


// Ruta para actualizar un producto
router.put('/:pid', (req, res) => {
    const productId = req.params.pid;
    const { title, description, code, price, status, stock, category, thumbnails } = req.body;
    
    let products = JSON.parse(fs.readFileSync('productos.json', 'utf-8'));
    const index = products.findIndex(p => p.id === productId);
    
    if (index === -1) {
        return res.status(404).send({ error: 'Producto no encontrado' });
    }
    
    const updatedProduct = {
        ...products[index],
        title: title || products[index].title,
        description: description || products[index].description,
        code: code || products[index].code,
        price: price || products[index].price,
        status: status !== undefined ? status : products[index].status,
        stock: stock || products[index].stock,
        category: category || products[index].category,
        thumbnails: thumbnails || products[index].thumbnails
    };
    
    products[index] = updatedProduct;
    fs.writeFileSync('productos.json', JSON.stringify(products));
    
    res.json(updatedProduct);
});

// Ruta para eliminar un producto
router.delete('/:pid', (req, res) => {
    const productId = req.params.pid;
    let products = JSON.parse(fs.readFileSync('productos.json', 'utf-8'));
    
    const index = products.findIndex(p => p.id === productId);
    if (index === -1) {
        return res.status(404).send({ error: 'Producto no encontrado' });
    }
    
    products.splice(index, 1);
    fs.writeFileSync('productos.json', JSON.stringify(products));
    
    res.status(204).send();
});

export default router;
