# SavrX — Play2Earn Savings Group Simulator

A dynamic in-browser simulation of a **12-member savings group** where students can join tiered investment tiers, earn weekly interest, and manage group membership. Built with vanilla JavaScript, HTML, and CSS — no backend required.

## 📋 Overview

SavrX simulates a collaborative savings scheme where:
- **12 students** can join the group (maximum capacity)
- Members choose from **3 investment tiers** with different amounts and interest rates
- **Weekly interest** is calculated and accumulated automatically
- Members can **withdraw** with full returns, be **removed** by admin, or **replaced** by new members
- All data persists locally using **localStorage**

## 🎯 Features

### Student Registration
- Join the savings group with a name, tier selection, and corresponding amount
- Three tiers available:
  - **Tier 1**: ₦10,000 with 5% weekly interest
  - **Tier 2**: ₦20,000 with 10% weekly interest
  - **Tier 3**: ₦30,000 with 20% weekly interest
- Form validation ensures correct tier-amount matching
- Real-time group capacity feedback (cannot join when full)

### Savings Dashboard
- **View all members** in a comprehensive table showing:
  - Member name and tier
  - Principal amount invested
  - Weekly interest calculation
  - Accumulated interest over time
  - Weeks participated
- **Real-time totals**: Principal, accumulated interest, and overall balance
- **Member count**: Track current vs. maximum capacity (0/12)

### Member Management
- **Withdraw**: Member exits the group and receives their principal + accumulated interest
- **Remove**: Admin removes a member without payout (immediate removal)
- **Replace**: Substitute a member with a new one (resets their data to 0 weeks)

### Weekly Simulation
- Click "Simulate Week" to:
  - Calculate interest for each member based on their tier rate
  - Add weekly interest to accumulated interest
  - Increment weeks counter for each member
  - Automatically persist changes

### Data Persistence
- All member data and group state saved to browser's localStorage
- Data persists across browser sessions
- Clear data by removing all members or resetting browser storage

### Running the App
1. Open `index.html` in your web browser
2. The app loads any previously saved data from localStorage
3. Start registering members and simulating weeks

### Usage Example
1. **Register Members**:
   - Enter a name (e.g., "Alice")
   - Select Tier 1 (₦10,000, 5% weekly)
   - Amount auto-fills to ₦10,000
   - Click "Join Group"

2. **Simulate Weeks**:
   - Click "Simulate Week" to add interest to all members
   - View updated totals and individual accumulated interest

3. **Manage Members**:
   - **Withdraw**: Member leaves and gets their balance
   - **Remove**: Admin removes member without payout
   - **Replace**: Swap a member for a new one
