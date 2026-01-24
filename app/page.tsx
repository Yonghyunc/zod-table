import WeeklyScheduler from './components/WeeklyScheduler';

export default function MealPlanPage() {
  return (
      <div className="">
        <div className="p-4">
          <h1 className="text-center font-bold text-gray-800">식단표</h1>
        </div>
        <WeeklyScheduler />
      </div>
  );
}
