# 🚗 ApexDrive CRM

**A high-performance CRM built for automotive businesses, featuring AI-powered inventory tracking and autonomous customer engagement.**

[![Tech Stack](https://img.shields.io/badge/Stack-Full%20Stack-blue)](https://github.com/rahulkavishka)
[![Demo Video](https://img.shields.io/badge/Demo-Watch%20Video-red)](https://res.cloudinary.com/dagj9begy/video/upload/f_auto,q_auto/v1766386087/ApexDrive_f3sdxo.mp4)

## 📖 Overview

ApexDrive CRM is a comprehensive B2B solution designed to streamline operations for car dealerships[cite: 22, 107]. Beyond standard customer and inventory management, it integrates advanced **Artificial Intelligence** to automate manual tasks.

Key innovations include an **EasyOCR** module for automatic number plate recognition from vehicle images [cite: 23, 67, 107] [cite_start]and an **Autonomous Sales Agent** (powered by n8n) that handles inquiries and books test drives 24/7 ![View on GitHub]([https://github.com/username/repository](https://github.com/rahulkavishka/ApexDrive-Bot)).

<p float="left">
  <img src="https://res.cloudinary.com/dagj9begy/image/upload/f_auto,q_auto/v1766152372/1_pd21ra.png" width="200" />
  <img src="https://res.cloudinary.com/dagj9begy/image/upload/f_auto,q_auto/v1766152373/2_obcnhd.png" width="200" />
  <img src="https://res.cloudinary.com/dagj9begy/image/upload/f_auto,q_auto/v1766152373/3_nx0jia.png" width="200" />
  <img src="https://res.cloudinary.com/dagj9begy/image/upload/f_auto,q_auto/v1766152380/4_x0uty0.png" width="200" />
</p>

## 🚀 Key Features

### 🤖 AI & Automation
- [cite_start]**Automatic Number Plate Recognition (ANPR):** Integrated **EasyOCR** to automatically extract and log vehicle registration numbers from uploaded images, reducing manual data entry[cite: 23, 107].
- **Autonomous SDR Agent (ApexDrive-Bot):** A "24/7 Sales Bot" built with **n8n** and **OpenAI**. [cite_start]It queries the live inventory database to answer customer questions and performs function calling to autonomously schedule test drives[cite: 24, 25].

### 💻 Dashboard & Management
- [cite_start]**Inventory Management:** Real-time tracking of vehicle stock, status, and pricing[cite: 22].
- [cite_start]**Customer Relationship Management:** Centralized database for client details, interaction history, and sales progress[cite: 22].
- **Interactive Data Visualization:** Dynamic charts and graphs powered by **Recharts** and **React Big Calendar** for tracking sales performance.

## 🛠️ Tech Stack

**Frontend:**
- ![React](https://img.shields.io/badge/-React_19-61DAFB?logo=react&logoColor=black) **React 19** & **Vite**
- [cite_start]![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white) **TypeScript** [cite: 21]
- ![Tailwind](https://img.shields.io/badge/-Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white) **Tailwind CSS** & **ShadcnUI**

**Backend:**
- [cite_start]![Django](https://img.shields.io/badge/-Django-092E20?logo=django&logoColor=white) **Django (Python)** [cite: 21]
- ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-336791?logo=postgresql&logoColor=white) **PostgreSQL**
- [cite_start]![Docker](https://img.shields.io/badge/-Docker-2496ED?logo=docker&logoColor=white) **Docker** [cite: 21]

**AI & Automation:**
- 🧠 **EasyOCR** (Computer Vision)
- ⚡ **n8n** (Workflow Automation)
- 🤖 **OpenAI API**
