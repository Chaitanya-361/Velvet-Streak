import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Habit } from './src/models/Habit';
import { CheckIn } from './src/models/CheckIn';
import { isHabitScheduledForDate } from './src/services/scheduling.service';
import { formatDate } from './src/services/dayBoundary.service';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log('Connected to DB');

  const habits = await Habit.find({});
  for (const habit of habits) {
    const checkIns = await CheckIn.find({ habitId: habit._id }).sort({ logicalDate: 1 });
    if (checkIns.length === 0) continue;

    let currentStreak = 0;
    let longestStreak = 0;
    let prevDateStr: string | null = null;

    for (const checkIn of checkIns) {
      const logicalDate = checkIn.logicalDate;
      let streakBroken = false;
      let sameDay = false;

      if (prevDateStr) {
        if (prevDateStr === logicalDate) {
          sameDay = true;
        } else {
          const prevDate = new Date(prevDateStr);
          const currDate = new Date(logicalDate);
          const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / 86400000);
          
          if (diffDays > 1) {
            let scheduledDayFound = false;
            for (let i = 1; i < diffDays; i++) {
              const d = new Date(prevDate.getTime() + i * 86400000);
              if (isHabitScheduledForDate(habit.toObject() as any, formatDate(d))) {
                scheduledDayFound = true;
                break;
              }
            }
            if (scheduledDayFound) {
              streakBroken = true;
            }
          }
        }
      }

      if (!prevDateStr) {
        currentStreak = 1;
      } else if (sameDay) {
        // do not increment
      } else if (streakBroken) {
        currentStreak = 1;
      } else {
        currentStreak++;
      }

      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }

      prevDateStr = logicalDate;
    }

    console.log(`Habit ${habit.name}: old CS=${habit.currentStreak} LS=${habit.longestStreak} | new CS=${currentStreak} LS=${longestStreak}`);
    
    habit.currentStreak = currentStreak;
    habit.longestStreak = longestStreak;
    await habit.save();
  }

  console.log('Done recalculating streaks');
  await mongoose.disconnect();
}

run().catch(console.error);
