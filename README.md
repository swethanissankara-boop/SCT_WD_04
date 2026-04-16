# 📝 FocusFlow - Advanced Task Management App

FocusFlow is a highly interactive, feature-rich CRUD (Create, Read, Update, Delete) application built with React and Tailwind CSS v4. It moves beyond standard to-do list templates by introducing local storage persistence, priority auto-sorting, custom dark mode, and real-time browser notifications for scheduled tasks.

## ✨ Key Features

* **Complete CRUD Engine:** Users can create tasks, mark them as completed, edit existing task text inline, and delete them smoothly.
* **Persistent Memory:** Utilizes the browser's native `localStorage` to save all tasks and the user's theme preference. Your data survives page refreshes and browser restarts.
* **Smart Priority Sorting:** Tasks can be assigned Low, Medium, or High priority (with color-coded UI flags). High-priority tasks automatically sort to the top of the feed.
* **Real-Time Browser Notifications:** An integrated `setInterval` engine checks the clock against task due dates/times and utilizes the Web Notification API to ping the user's operating system when a task is due.
* **Dynamic Filtering:** Users can toggle between "Active," "Completed," and "All" states, as well as filter by specific custom categories (Work, Personal, Health, Shopping) using derived React state.
* **Custom Dark Mode:** Implements Tailwind v4's new `@custom-variant` configuration to allow users to manually toggle between a bright, clean Light Mode and a deep, sleek Dark Mode.

## 🛠️ Tech Stack

* **Frontend Framework:** React (via Vite)
* **Styling:** Tailwind CSS (v4)
* **State Management:** React Hooks (`useState`, `useEffect`)
* **Browser APIs:** `localStorage` API, Web Notification API

## 🚀 Getting Started

To run this project locally on your machine, follow these steps:

### Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your computer.

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/swethanissankara-boop/todo-app.git](https://github.com/swethanissankara-boop/todo-app.git)

2. **Navigate to the project directory:**
   ```bash
   cd todo-app

3. **Install the dependencies:**
   ```bash
   npm install

4. **Start the development server:**
   ```bash
   npm run dev

5. **Open your browser:**
  Navigate to http://localhost:5173 to start organizing your day!

## 📂 Architecture & Design Highlights
Single Source of Truth: The app uses a master tasks array, while the UI relies on derived state (e.g., filteredTasks) to ensure data is never accidentally deleted when users switch tabs.

Glassmorphism & Micro-interactions: Built utilizing Tailwind's focus rings, active scale reductions (active:scale-95), and smooth transition timings to make the app feel tactile and premium.

Conditional Rendering: Inline editing dynamically replaces text fields with input boxes while preserving the layout of the task card.

## 🚀 Future Roadmap
 * While the frontend engine is fully complete, planned future upgrades include:

*  Drag-and-Drop Reordering: Integrating dnd-kit to allow users to manually sort their daily tasks.

*  Cloud Database & Auth: Moving from localStorage to Firebase so users can create accounts and sync their tasks across mobile and desktop devices.

*  Progress Analytics: A dashboard view showing weekly productivity trends and category breakdowns.
## Screenshot

<img width="1399" height="816" alt="image" src="https://github.com/user-attachments/assets/ca4f164e-7058-45cc-9fa0-6786bec6ab38" />

## 🎉 Acknowledgments

Developed as a milestone portfolio project during my Web Development Internship at Skillcart.

UI styling powered by Tailwind CSS.
