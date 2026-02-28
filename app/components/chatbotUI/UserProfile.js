export default function UserProfile({ userProfile, onClear }) {
  if (Object.keys(userProfile).length === 0) return null;

  return (
    <div className="border-y border-primary-700/40 bg-primary-900/60 px-5 py-4 backdrop-blur-md">
      <div className="flex items-start justify-between gap-4">
        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary-300">
            Active Card Profile
          </p>
          <div className="flex flex-wrap gap-2.5">
            {userProfile.income && (
              <span className="rounded-full border border-accent-500/40 bg-accent-500/15 px-3 py-1 text-xs font-medium text-accent-200">
                Income {userProfile.income}
              </span>
            )}
            {userProfile.spending?.map((item) => (
              <span
                key={item}
                className="rounded-full border border-primary-400/40 bg-primary-600/25 px-3 py-1 text-xs font-medium capitalize text-primary-100"
              >
                {item}
              </span>
            ))}
            {userProfile.benefits?.map((item) => (
              <span
                key={item}
                className="rounded-full border border-accent-400/40 bg-accent-600/20 px-3 py-1 text-xs font-medium text-accent-100"
              >
                {item}
              </span>
            ))}
            {userProfile.feePreference && (
              <span className="rounded-full border border-primary-500/50 bg-primary-700/40 px-3 py-1 text-xs font-medium capitalize text-primary-100">
                Fee {userProfile.feePreference}
              </span>
            )}
          </div>
        </section>
        <button
          onClick={onClear}
          className="rounded-md border border-primary-600/60 px-3 py-1 text-xs font-medium text-primary-200 transition hover:border-accent-500/50 hover:text-accent-100"
        >
          Reset Chat
        </button>
      </div>
    </div>
  );
}
