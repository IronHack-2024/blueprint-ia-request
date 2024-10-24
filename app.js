const express = require('express');
const morgan = require('morgan');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(morgan('tiny'));


app.listen(PORT, () => {
    
    // connectDB();
    console.log(`Servidor escuchando en el puerto ${PORT}`);
})