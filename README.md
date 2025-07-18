# TicketSaferBase

TicketSaferBase es una plataforma de venta y gestión de boletos NFT sobre la blockchain Base. El objetivo es ofrecer un marketplace seguro, transparente y eficiente para la compra, venta y validación de boletos digitales, aprovechando la tecnología Web3.

## Características principales
- **Marketplace de boletos NFT**: Compra y venta de boletos como tokens no fungibles.
- **Validación segura**: Verificación de autenticidad y propiedad de los boletos.
- **Despliegue en la red Base**: Aprovecha las ventajas de la blockchain Base para escalabilidad y bajos costos.
- **Frontend moderno**: Interfaz construida con React y Vite para una experiencia de usuario rápida y responsiva.
- **Integración Web3**: Conexión con wallets y contratos inteligentes usando Dynamic SDK.

## Estructura del proyecto
```
TicketSaferBase/
├── package.json
├── package-lock.json
├── ticketsafer-site/
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── App.jsx
│       ├── components/
│       └── ...
└── ...
```
- **ticketsafer-site/**: Contiene el frontend de la aplicación.
- **public/**: Archivos estáticos y recursos.
- **src/**: Código fuente de React y componentes.

## Tecnologías utilizadas
- **React** y **Vite** para el frontend
- **Dynamic SDK** para integración Web3
- **CSS** para estilos personalizados
- **GitHub** para control de versiones
- **Vercel** para despliegue

## Instalación y ejecución local
1. Clona el repositorio:
   ```bash
   git clone https://github.com/Vaios0x/TickBase.git
   cd TicketSaferBase/ticketsafer-site
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Accede a la app en `http://localhost:5173` (o el puerto que indique Vite).

## Despliegue en Vercel
1. Sube el repositorio a GitHub (ya realizado).
2. Ve a [Vercel](https://vercel.com/) y crea un nuevo proyecto importando este repositorio.
3. Configura el directorio de salida como `ticketsafer-site` si es necesario.
4. Despliega y obtén tu URL pública.

## Contribuciones
¡Las contribuciones son bienvenidas! Abre un issue o pull request para sugerencias o mejoras.

## Licencia
Este proyecto está bajo la licencia MIT. 