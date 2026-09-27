# 🛍️ Smart Boutique - Algorithmic E-Commerce & Analytics Engine

A production-grade, full-stack e-commerce boutique platform built using Node.js, Express, MySQL, and modern JavaScript (ES6+). Features a real-time virtual style/fit recommendation engine, ACID-compliant guest booking transactions, and an event-driven analytics pipeline.

## 🚀 Key Features

- **Algorithmic Fit Matcher:** Dynamically maps client body shape metrics to recommended catalog items using optimized SQL parameters.
- **Transaction-Safe Booking Engine:** Multi-step guest profile registration and fitting appointment scheduling executed within MySQL ACID transactions (`beginTransaction`, `commit`, `rollback`).
- **Data Analytics Pipeline:** Event-driven logging system recording customer interactions and aggregating real-time business intelligence using SQL aggregate functions (`GROUP BY`, `COUNT`).
- **SQL Security & Performance Optimization:** Configured connection pooling using `mysql2/promise` alongside parameterized SQL prepared statements to prevent SQL Injection (SQLi) attacks.

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MySQL (Relational Schema, Connection Pooling, Composite Indexing)
- **Frontend:** HTML5, CSS3 (Grid/Flexbox), JavaScript ES6+ (Fetch API)
- **Version Control & DevOps:** Git, GitHub, Dotenv

## 💻 Local Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/ajithaperiyannan16-glitch/smart_boutique.git](https://github.com/ajithaperiyannan16-glitch/smart_boutique.git)
   cd smart-boutique