const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Obtener el token del header
    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }
    try {
        // Verificar el token sea válido
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token inválido' });
    }
}

module.exports = { verificarToken };