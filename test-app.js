require('dotenv').config();
const sequelize = require('./src/config/database');
const { Usuario } = require('./src/models');
const bcrypt = require('bcrypt');

async function testApp() {
  try {
    console.log('Ì¥ß Probando conexi√≥n a BD...');
    await sequelize.sync({ alter: false });
    console.log('‚úÖ BD sincronizada');
    
    // Verificar si hay usuarios
    const usuarios = await Usuario.findAll();
    console.log(`‚úÖ Se encontraron ${usuarios.length} usuarios`);
    
    if (usuarios.length > 0) {
      console.log('Ì≥ß Primer usuario:', usuarios[0].email);
    }
    
    console.log('\n‚úÖ Todas las pruebas pasadas!');
    process.exit(0);
  } catch (error) {
    console.error('‚ùå Error:', error.message);
    process.exit(1);
  }
}

testApp();
