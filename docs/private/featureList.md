# Feature List

#### Authentication

1. Email/password registration and login
2. Google OAuth via Passport.js
3. Forgot password / reset password
4. Change password and email in settings
5. Delete account
6. Avatar upload via Cloudinary

#### Dashboard

7. Display all three main quests with deadlines and countdown timers
8. Date navigation — previous and next date visible, click to open calendar
9. Button on all pages to jump to today
10. Pop up when rank increases

#### Categories

11. Three fixed categories — Body, Mind, Wealth (RPG styled naming)
    Main Quests

12. Each category has one active main quest with a deadline
13. Displayed on top of category with countdown to deadline
    Side Quests

14. Each category has side quests with difficulty — easy, medium, hard
15. Side quests are the building blocks towards the main quest
16. Full CRUD on side quests
17. Maximum 15 side quests per day across all categories
18. User can plan up to 7 days ahead from today
19. Tasks lock at midnight — no editing previous days
20. Example side quests pre-populated on new account, disappear when user adds their own
    Scoring and Ranking

21. Completion rate per day based on quests completed
22. Score weighted by difficulty — hard worth more than easy
23. Rank system — D, C, B, A, S, SS, SSS
24. Streak based on quest completion only — resets if no quest completed that day
25. Off day — user can mark one off day per week, streak stays intact, toggle greyed out for next 6 days
    History

26. View task history by day — date, completion rate, rank, reflection notes
27. Click a day to view all tasks completed that day

    #### Reflection

28. Daily reflection notes — what went right, what went wrong
29. 8 PM daily reflection email via cron job
30. Next day pop up shows previous day's tasks with option to copy to today
    Onboarding

31. Explain concept — main quest is the goal, side quests are daily actions
32. Walk user through creating their first main quest
33. Explain 80/20 principle
34. Icon legend explaining UI elements
    Settings

35. Change password and email
36. Upload or change avatar
37. Delete account
38. Notification preference for 8 PM reflection email
    Empty States

39. Motivating prompt when no quests added yet
    Deferred to v2

- Custom categories
- Badges and achievements
- Shareable image card
- Social features
  Architecture

- React frontend, mobile first
- Express backend with service layer and repository pattern
- PostgreSQL
- TypeScript throughout
- Zod validation
- Winston or Pino for structured logging
- Docker + Docker Compose
- Jest + Supertest for testing
- GitHub Actions for CI/CD
- Cloudinary for image uploads
- Passport.js for Google OAuth
- Lottie animation on app load
- WebP for all UI images
- node-cron for 8 PM reflection email
