# 🎬 Fundsroom Assessment - Video Recording Script

**Tips before you start:**
- Keep your IDE (VS Code) open on one side or tab, and your live Vercel/Railway app open on the other.
- Speak confidently. You built a robust, enterprise-grade system!
- **Test Credentials to use in the video:** Email: `admin@fundsroom.com` | Password: `password123`

---

## ⏱️ 0:00 - Introduction & Architecture
**👀 What to show on screen:** 
Open `backend/src/index.ts` in VS Code.

**🗣️ What to say:**
> "Hello, my name is Kushagra Tiwari, and this is my submission for the Fundsroom Full Stack Developer Case Study. I have built a complete, enterprise-grade Mini ERP and CRM system. 
> 
> The architecture uses a React frontend powered by Vite, and a Node.js Express backend. For the database, I am using PostgreSQL hosted on Supabase, managed entirely by the Prisma ORM. 
> 
> My system features Role-Based Access Control, real-time inventory gating, and a Tax Invoice PDF generator."

---

## ⏱️ 0:30 - Authentication & Security
**👀 What to show on screen:** 
Switch to `backend/src/middlewares/auth.ts`, then switch to the **Live Browser (Login Page)**.

**🗣️ What to say:**
> "Security is handled via JSON Web Tokens (JWT). In my backend middleware, every route is protected, and specific routes enforce Role-Based Access Control. For example, a Warehouse manager cannot access Financial routes. 
> 
> Let's log into the live system as an Admin to see the full capabilities. Notice that I added a 'warm-up ping' on the login page so the backend wakes up instantly from its serverless sleep state while I type."
> *(Type in `admin@fundsroom.com` and `password123`, then click Sign In)*

---

## ⏱️ 1:00 - The Dashboard & UI/UX
**👀 What to show on screen:** 
**Live Browser (Dashboard Page)**. Scroll around to show the charts and KPI cards.

**🗣️ What to say:**
> "Upon logging in, we hit the Analytics Dashboard. I designed this using an enterprise 'Spring Boot' aesthetic—clean panels, sharp contrast, and Recharts for interactive data visualization. 
> 
> To ensure high performance, the dashboard aggregates data using highly optimized, parallelized Prisma queries in the backend. You can see our financial metrics, CRM data, and live inventory alerts all separated logically."

---

## ⏱️ 1:30 - CRM & Email Automation
**👀 What to show on screen:** 
Click on **Customers** in the sidebar. Click "Add Customer". Then open `backend/src/utils/email.ts` in VS Code briefly.

**🗣️ What to say:**
> "In the Customers module, the Sales team can onboard new clients. I implemented the Resend Email API into the backend. Whenever a new customer is registered, the system automatically fires a beautifully formatted HTML Welcome Email directly to their inbox using a background process."

---

## ⏱️ 2:00 - Inventory & Constraints
**👀 What to show on screen:** 
Click on **Inventory** in the sidebar. Point out the "Low Stock Alerts" in red.

**🗣️ What to say:**
> "Our Inventory acts as a strict gatekeeper. Products have dynamic stock levels and auto-generated SKUs. You'll notice some items are flagged with red Low Stock Alerts. 
> 
> The system tracks a detailed history of every single IN and OUT movement with precise timestamps, ensuring total warehouse accountability."

---

## ⏱️ 2:30 - Challan State Machine & Atomic Transactions (CRITICAL)
**👀 What to show on screen:** 
Click on **Sales Challans**. Open `backend/src/routes/challans.ts` (scroll to line 110 where `prisma.$transaction` is).

**🗣️ What to say:**
> "The core business logic lies in the Challan generation. This operates on a 3-tier state machine: Draft, Confirmed, and Cancelled.
> 
> When a Challan is Confirmed, I use Prisma's `$transaction` block to guarantee atomic database operations. This means the system deducts the exact stock, updates the product table, and logs the movement in the exact same millisecond. If the stock goes below zero, the transaction rolls back entirely, preventing database corruption."

---

## ⏱️ 3:15 - Invoice Generation & PDF Print
**👀 What to show on screen:** 
Click on **Tax Invoices** in the sidebar. Click **"Print / Download"** on an invoice to open the PDF preview.

**🗣️ What to say:**
> "Finally, once a Challan is confirmed, it becomes a formal Tax Invoice. I built a dedicated A4-formatted React component that automatically calculates CGST, SGST, and Grand Totals.
> 
> Using browser-level media queries and print rendering, the UI is stripped away, leaving a perfect, professional PDF invoice that can be printed or saved instantly."

---

## ⏱️ 3:45 - Conclusion
**👀 What to show on screen:** 
Open the **Profile Dropdown** in the top right corner and click **Logout**.

**🗣️ What to say:**
> "This system was fully deployed using Railway for the backend and Vercel for the frontend. Thank you for your time, and I look forward to your feedback on my code and architecture."
