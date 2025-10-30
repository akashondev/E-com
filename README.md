🛒 E-Commerce Cart App

A simple full-stack shopping cart project built with React, Node.js, and MongoDB.
Implements basic e-commerce flow: add/remove items, cart total, and mock checkout.

⚙️ Tech Stack

Frontend: React + Tailwind CSS
Backend: Node.js + Express
Database: MongoDB Atlas

📁 Project Structure
ecommerce-cart/
 ├── backend/      → Node + Express API
 └── frontend/     → React + Tailwind UI

🚀 Setup
Backend
cd backend
npm install


.env

MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/
PORT=5000


Run:

npm run dev

Frontend
cd frontend
npm install
npm run dev


Open → http://localhost:5173

🔗 API Routes
Method	Route	Description
GET	/api/products	Fetch products
POST	/api/cart	Add to cart
DELETE	/api/cart/:id	Remove from cart
GET	/api/cart	Get cart
POST	/api/checkout	Mock checkout
✨ Features

Product grid with “Add to Cart”

Cart with update/remove

Checkout with mock receipt

Responsive UI

MongoDB data persistence


📧 akashvishwakarma1024@gmail.com

🔗 GitHub
