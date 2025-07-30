# 🎟️ Distributed Event Booking System

A scalable, fault-tolerant microservices-based system for event ticket booking, built with **Node.js**, **Express**, **MongoDB**, **RabbitMQ**, and **Docker**. It features **authentication**, **event management**, **ticket reservations**, and **email notifications**, with an API gateway using **NGINX** for unified access.

---

## 🏗️ Architecture

### Microservices
- **Auth Service**: JWT-based user authentication and authorization.
- **Event Service**: Manages events and ticket availability.
- **Ticket Booking Service**: Handles booking requests using a RabbitMQ-based Orchestration Saga.
- **Notification Service**: Sends email notifications.
- **RabbitMQ**: Acts as the event/message broker.
- **MongoDB**: Each service uses its own database for data isolation (Database per service pattern).
- **NGINX**: API gateway that routes requests to respective services.

---

## 📂 Project Structure

event-booking-system/
│
├── auth-service/
├── event-service/
├── ticket-service/
├── notification-service/
├── nginx/
│ └── nginx.conf
├── docker-compose.yml
└── README.md



---

## 🧰 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Message Queue**: RabbitMQ (AMQP)
- **Containerization**: Docker & Docker Compose
- **API Gateway**: NGINX
- **Other**: JWT, Nodemailer, Mongoose

---

## 🚀 Getting Started

### ✅ Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- (Optional) [Postman](https://www.postman.com/) for API testing

### 🛠️ Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/event-booking-system.git
   cd event-booking-system
2. **Set environment variables**

    Each service has a .env file. Example for auth-service:

    ini
    Copy
    Edit
    PORT=5000
    MONGO_URI=mongodb://auth-db:27017/auth_db
    JWT_SECRET=your_jwt_secret

3. **Build and run all services using Docker**
    docker-compose up --build

4. **Access Services via NGINX**

    http://localhost/api/v1/auth/
    http://localhost/api/v1/events/
    http://localhost/api/v1/booking/

5. **RabbitMQ Dashboard**

    Access RabbitMQ at:
    http://localhost:15672
    (Username: guest, Password: guest)

