# 🌟 NexBuy - E-Commerce Platform  

Welcome to **NexBuy**, an e-commerce platform where users can buy and sell products, manage multiple addresses, add credit card details, and choose from multiple payment options. It's built using **MERN stack** (MongoDB, Express.js, React, Node.js) and offers a similar experience to Amazon for both customers and sellers.  

---

## 🚀 Live Link  
Check out the live demo of NexBuy:  
[Live Link](https://nex-9tyw9uu45-om-avchers-projects.vercel.app/)

---

## 📋 Description  

**NexBuy** enables:  
- **🛒 E-commerce Store** for customers to browse and buy products.  
- **💳 Multiple Payment Solutions** for a seamless checkout experience.  
- **📍 Multiple Addresses** for users to manage their delivery locations.  
- **🔐 Secure Payment Integration** with Razorpay and other options.  
- **👩‍💼 Seller Accounts** to allow users to sell their own products and manage listings.  
- **📦 Product Upload and Management** for sellers.  

Built with:  
- **Node.js** 🟩  
- **React.js** ⚛️  
- **MongoDB** 🍃  
- **Express.js** 🚂  

---

## 🛠️ Installation & Setup  

Follow the steps below to set up **NexBuy** locally.  

---

### 1️⃣ Clone the Repository  

To clone the project from GitHub, use the following command:

```bash
git clone https://github.com/OmAvcher/NexBuy.git
2️⃣ Install Dependencies
Backend (Server)
Navigate to the server folder and install the required dependencies:

bash
Copy code
cd server
npm install
Frontend (Client)
Navigate to the client folder and install the required dependencies:

bash
Copy code
cd client
npm install
3️⃣ Setup Environment Variables
Create a .env file in the server directory and add the following keys:

plaintext
Copy code
SESSION_SECRET=your-secret-key
PORT=8080
MONGO_LINK=mongodb://127.0.0.1:27017/NexBuy
NODE_ENV=production
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_CLOUD_API_KEY=your-cloudinary-api-key
CLOUDINARY_CLOUD_API_SECRET=your-cloudinary-api-secret
RAZORPAY_KEY=your-razorpay-key
RAZORPAY_SECRET=your-razorpay-secret
ADMIN_EMAIL=your-email@example.com
4️⃣ Start the Application
To run the application, follow these steps:

Start Backend (Server)
In the server folder, run:

bash
Copy code
npm start
Start Frontend (Client)
In the client folder, run:

bash
Copy code
npm run dev
⚙️ Technologies Used
Node.js 🟩
Express.js 🚂
MongoDB 🍃
React.js ⚛️
Razorpay 💳
Cloudinary ☁️
Axios 🌐
Multer 📤
📝 Features
🛒 E-commerce Store
💳 Multiple Payment Solutions (Razorpay, Credit Card)
📍 Multiple Delivery Addresses
🔐 Secure User Authentication with JWT
🛍️ Seller Management
🛠️ Product Upload for sellers
🔧 Commands
To start the server:

bash
Copy code
npm start
To run the client:

bash
Copy code
npm run dev
📜 License
This project is licensed under the ISC License.
