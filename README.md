# 🚀 Ecommerce Backend

Welcome to the **Ecommerce Backend** repository! This project provides a robust backend for managing an Ecommerce platform. It offers API services for handling user authentication, product management, and order processing. 

🔧 **Built with**:
- **Node.js**: JavaScript runtime for building fast and scalable network applications.
- **Express.js**: Web framework for Node.js, used for handling HTTP requests.
- **MongoDB**: NoSQL database to persist product, order, and user data.
- **JWT (JSON Web Tokens)**: Secure user authentication mechanism.
- **dotenv**: For managing environment variables.

## 🌟 Features

- **User Authentication**: Signup, login, and JWT token management.
- **Product Management**: Create, read, update, and delete product listings.
- **Order Management**: Create, update, and retrieve orders.
- **Secure API Endpoints**: All endpoints are protected using JWT-based authentication.

## 🛠️ Technologies Used

- **Node.js**
- **Express.js**
- **MongoDB**
- **JWT (JSON Web Tokens)**
- **Redis**

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/) (or use MongoDB Atlas for cloud-based database)

### Installation Steps

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Binkeurss/Ecommerce-backend.git
   cd Ecommerce-backend
   ```

2. **Install dependencies**:

  ```bash
  npm install
  ```
3. **Configure environment variables: Create a .env file in the root directory and add the following**:
  MONGO_URI=your_mongodb_connection_string
  JWT_SECRET=your_jwt_secret_key

3. **Start the server**:

  ```bash
  npm run start
  ```