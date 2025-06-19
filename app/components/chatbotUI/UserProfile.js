export default function UserProfile({ userProfile, onClear }) {
  if (Object.keys(userProfile).length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-primary-200 to-accent-200 border-b border-gray-200 p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Your Profile:
          </h3>
          <div className="flex flex-wrap gap-2">
            {userProfile.income && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                Income: {userProfile.income}
              </span>
            )}
            {userProfile.spending?.map((item) => (
              <span
                key={item}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium"
              >
                {item}
              </span>
            ))}
            {userProfile.benefits?.map((item) => (
              <span
                key={item}
                className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium"
              >
                {item}
              </span>
            ))}
            {userProfile.feePreference && (
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">
                Fee: {userProfile.feePreference}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onClear}
          className="text-gray-500 hover:text-gray-700 text-sm underline"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
