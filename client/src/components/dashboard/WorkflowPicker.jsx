const WorkflowPicker = ({ activeTab, onTabChange }) => {
  const tabs = [
    { label: 'Escalations' },
    { label: 'Notifications' },
    { label: 'Insights', locked: true },
  ];

  return (
    <div className="w-full bg-gray-50 rounded-lg font-inter mb-6 border-b border-gray-200">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.label}
            className={`
              px-6 py-3 text-lg font-medium transition-colors duration-200
              ${activeTab === tab.label
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
              }
              flex items-center space-x-2
            `}
            onClick={() => onTabChange(tab.label)}
            aria-selected={activeTab === tab.label}
            role="tab"
          >
            <span>{tab.label}</span>
            {tab.locked && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 ml-1 text-gray-400"
              >
                <path
                  fillRule="evenodd"
                  d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WorkflowPicker;