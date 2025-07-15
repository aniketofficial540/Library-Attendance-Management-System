## 📚 Library Entry Management System

A smart entry‑logging solution for academic libraries. Students and faculty **scan their ID cards** (RFID / QR) on arrival; the system logs the entry in a secure database and lets librarians generate daily or custom‑range reports.

---

<img width="1919" height="644" alt="lams" src="https://github.com/user-attachments/assets/6162d158-ffe3-40ef-94dc-bbc57cde5449" />


### 🚀 Features

* 🆔 **Instant ID‑card scan** (RFID or QR) for fast check‑in
* 🗄️ **Central log database** with date & time stamps
* 📊 **Exportable reports** (CSV / Excel) for any date range
* 🔐 **Admin dashboard** for search, filters, and data download
* 🔔 Optional **email alerts** for VIP visitors or threshold breaches

---

### 🧠 Technologies Used

* **Frontend:** HTML, CSS, JavaScript, Bootstrap
* **Backend:** Node.js (Express)
* **Database:** MySQL
* **Hardware:** USB RFID reader / Barcode scanner

---

### 🧪 How It Works

1. User scans ID ➡️ Reader sends the ID code to backend via USB HID or HTTP.
2. Server queries `students` table to match ID and fetch user info.
3. An **entry record** is inserted into `entry_log` with timestamp.
4. Librarian dashboard displays real‑time logs and lets admins export reports.

---

### 👨‍💻 Author

**Aniket Adars, Akriti Kumari, Aditya Sharma**
📍 Dehradun, India
🌐 [Portfolio Website](https://your-portfolio.vercel.app)
✉️ [aniketofficial540@gmail.com](mailto:aniketofficial540@gmail.com)


